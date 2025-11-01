"""
Admin API endpoints for monitoring and managing the document formatting service.
Provides job management, system health, and configuration capabilities.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import psutil
import os
from datetime import datetime
from .endpoints import jobs_db  # Import the shared jobs database (for active jobs)
from .job_database import (
    get_all_jobs, get_job, get_job_stats, delete_old_jobs as db_delete_old_jobs
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== Models ====================

class SystemHealth(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_total_mb: float
    disk_usage_percent: float
    disk_free_gb: float
    uptime_seconds: float
    active_jobs: int
    total_jobs: int


class JobSummary(BaseModel):
    job_id: str
    status: str
    user_goal: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = None
    error_message: Optional[str] = None


class JobsStats(BaseModel):
    total: int
    completed: int
    failed: int
    in_progress: int
    queued: int
    success_rate: float
    avg_duration_seconds: Optional[float] = None


class ConfigUpdate(BaseModel):
    llm_provider: Optional[str] = None  # "openai" or "anthropic"
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class LogEntry(BaseModel):
    timestamp: str
    level: str
    job_id: Optional[str]
    message: str


# ==================== System Health ====================

@router.get("/health", response_model=SystemHealth)
async def get_system_health():
    """Get current system health metrics."""
    try:
        # Get CPU and memory info
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Calculate uptime (simplified - you might want to track actual service start time)
        boot_time = psutil.boot_time()
        uptime = datetime.now().timestamp() - boot_time
        
        # Count active jobs
        active_jobs = sum(1 for job in jobs_db.values() 
                         if job["status"] not in ["completed", "error"])
        
        return SystemHealth(
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            memory_used_mb=memory.used / (1024 * 1024),
            memory_total_mb=memory.total / (1024 * 1024),
            disk_usage_percent=disk.percent,
            disk_free_gb=disk.free / (1024 * 1024 * 1024),
            uptime_seconds=uptime,
            active_jobs=active_jobs,
            total_jobs=len(jobs_db)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting system health: {str(e)}")


# ==================== Job Management ====================

@router.get("/jobs", response_model=List[JobSummary])
async def list_jobs(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """List all jobs with optional filtering from persistent database."""
    try:
        # Get jobs from database
        jobs_from_db = get_all_jobs(limit=limit, offset=offset, status=status)
        
        # Convert to JobSummary format
        jobs_list = []
        for job_data in jobs_from_db:
            # Use processing_duration_seconds from database if available
            duration = job_data.get("processing_duration_seconds")
            
            jobs_list.append(JobSummary(
                job_id=job_data["job_id"],
                status=job_data["status"],
                user_goal=job_data.get("user_goal"),
                created_at=job_data.get("created_at"),
                completed_at=job_data.get("completed_at"),
                duration_seconds=duration,
                error_message=job_data.get("error_message")
            ))
        
        return jobs_list
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing jobs: {str(e)}")


@router.get("/jobs/stats", response_model=JobsStats)
async def get_jobs_stats():
    """Get aggregate statistics about jobs from persistent database."""
    try:
        # Get stats from database
        db_stats = get_job_stats()
        
        total = db_stats.get("total_jobs", 0)
        status_counts = db_stats.get("status_counts", {})
        
        completed = status_counts.get("completed", 0)
        failed = status_counts.get("error", 0) + status_counts.get("failed", 0)
        in_progress = status_counts.get("processing", 0)
        queued = status_counts.get("queued", 0)
        
        success_rate = (completed / total * 100) if total > 0 else 0
        avg_duration = db_stats.get("average_processing_time", None)
        
        return JobsStats(
            total=total,
            completed=completed,
            failed=failed,
            in_progress=in_progress,
            queued=queued,
            success_rate=success_rate,
            avg_duration_seconds=avg_duration
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting job stats: {str(e)}")


@router.get("/jobs/{job_id}", response_model=Dict[str, Any])
async def get_job_details(job_id: str):
    """Get detailed information about a specific job from database."""
    job_data = get_job(job_id)
    if not job_data:
        # Fallback to memory if not in database yet
        if job_id not in jobs_db:
            raise HTTPException(status_code=404, detail="Job not found")
        job_data = jobs_db[job_id]
    
    return job_data


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job and its associated files."""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = jobs_db[job_id]
    
    # Delete associated files
    try:
        if job_data.get("original_file_path") and os.path.exists(job_data["original_file_path"]):
            os.remove(job_data["original_file_path"])
        
        if job_data.get("output_file_path") and os.path.exists(job_data["output_file_path"]):
            os.remove(job_data["output_file_path"])
        
        # Try to remove the job directory
        job_dir = f"temp_uploads/{job_id}"
        if os.path.exists(job_dir):
            import shutil
            shutil.rmtree(job_dir)
    except Exception as e:
        print(f"Warning: Error deleting files for job {job_id}: {e}")
    
    # Remove from database
    del jobs_db[job_id]
    
    return {"message": "Job deleted successfully", "job_id": job_id}


@router.post("/jobs/cleanup")
async def cleanup_old_jobs(days: int = Query(7, ge=1, le=365)):
    """Delete jobs older than specified days."""
    try:
        cutoff_date = datetime.now().timestamp() - (days * 24 * 60 * 60)
        deleted_count = 0
        
        jobs_to_delete = []
        for job_id, job_data in jobs_db.items():
            if job_data.get("created_at"):
                try:
                    created_timestamp = datetime.fromisoformat(job_data["created_at"]).timestamp()
                    if created_timestamp < cutoff_date:
                        jobs_to_delete.append(job_id)
                except:
                    pass
        
        # Delete each job
        for job_id in jobs_to_delete:
            try:
                await delete_job(job_id)
                deleted_count += 1
            except:
                pass
        
        return {
            "message": f"Cleaned up {deleted_count} jobs older than {days} days",
            "deleted_count": deleted_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during cleanup: {str(e)}")


# ==================== Configuration ====================

# Global config store (in production, use database or config file)
config_store = {
    "llm_provider": "openai",
    "model_name": "gpt-4",
    "temperature": 0.0,
    "max_tokens": 4000
}


@router.get("/config")
async def get_config():
    """Get current configuration."""
    return config_store


@router.put("/config")
async def update_config(config: ConfigUpdate):
    """Update configuration settings."""
    try:
        if config.llm_provider:
            config_store["llm_provider"] = config.llm_provider
        if config.model_name:
            config_store["model_name"] = config.model_name
        if config.temperature is not None:
            config_store["temperature"] = config.temperature
        if config.max_tokens:
            config_store["max_tokens"] = config.max_tokens
        
        return {
            "message": "Configuration updated successfully",
            "config": config_store
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating config: {str(e)}")


# ==================== Storage Management ====================

@router.get("/storage")
async def get_storage_stats():
    """Get storage statistics for uploaded files."""
    try:
        upload_dir = "temp_uploads"
        if not os.path.exists(upload_dir):
            return {
                "total_size_mb": 0,
                "file_count": 0,
                "job_count": 0
            }
        
        total_size = 0
        file_count = 0
        job_dirs = 0
        
        for root, dirs, files in os.walk(upload_dir):
            job_dirs = len(dirs) if root == upload_dir else job_dirs
            file_count += len(files)
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    total_size += os.path.getsize(file_path)
                except:
                    pass
        
        return {
            "total_size_mb": total_size / (1024 * 1024),
            "file_count": file_count,
            "job_count": job_dirs
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting storage stats: {str(e)}")
