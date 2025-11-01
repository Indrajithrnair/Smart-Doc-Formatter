"""
Job Database Module - Persistent storage for processing jobs
"""
import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

# Database path - same directory as users.db
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.db")

def init_jobs_database():
    """Initialize the jobs database with required tables"""
    try:
        print(f"Initializing jobs database at: {DB_PATH}")
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Main jobs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                user_id INTEGER,
                user_email TEXT,
                status TEXT NOT NULL,
                formatting_mode TEXT,
                template_type TEXT,
                user_goal TEXT,
                original_file_name TEXT,
                original_file_path TEXT,
                output_file_path TEXT,
                current_step_details TEXT,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                processing_duration_seconds REAL,
                file_size_bytes INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Job metadata table for additional flexible data
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS job_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT,
                FOREIGN KEY (job_id) REFERENCES jobs (job_id) ON DELETE CASCADE
            )
        ''')
        
        # Create indexes for faster queries
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC)')
        
        conn.commit()
        conn.close()
        print("Jobs database initialized successfully")
    except Exception as e:
        print(f"Error initializing jobs database: {e}")
        raise

def create_job(job_id: str, user_id: Optional[int] = None, user_email: Optional[str] = None, 
               formatting_mode: str = "contextual", template_type: Optional[str] = None,
               original_file_name: Optional[str] = None, original_file_path: Optional[str] = None,
               file_size_bytes: Optional[int] = None) -> Dict:
    """Create a new job in the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO jobs (
                job_id, user_id, user_email, status, formatting_mode, template_type,
                original_file_name, original_file_path, file_size_bytes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            job_id, user_id, user_email, "uploaded", formatting_mode, template_type,
            original_file_name, original_file_path, file_size_bytes, datetime.utcnow()
        ))
        
        conn.commit()
        conn.close()
        
        return get_job(job_id)
    except Exception as e:
        print(f"Error creating job {job_id}: {e}")
        raise

def get_job(job_id: str) -> Optional[Dict]:
    """Get a job by ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM jobs WHERE job_id = ?', (job_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    except Exception as e:
        print(f"Error getting job {job_id}: {e}")
        return None

def update_job(job_id: str, **kwargs) -> bool:
    """Update job fields"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Build dynamic UPDATE query
        fields = []
        values = []
        for key, value in kwargs.items():
            fields.append(f"{key} = ?")
            values.append(value)
        
        if not fields:
            return True
        
        values.append(job_id)
        query = f"UPDATE jobs SET {', '.join(fields)} WHERE job_id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Error updating job {job_id}: {e}")
        return False

def update_job_status(job_id: str, status: str, current_step_details: Optional[str] = None,
                      error_message: Optional[str] = None) -> bool:
    """Update job status and related fields"""
    updates = {"status": status}
    
    if current_step_details:
        updates["current_step_details"] = current_step_details
    
    if error_message:
        updates["error_message"] = error_message
    
    # Set timestamps based on status
    if status == "processing" and not get_job(job_id).get("started_at"):
        updates["started_at"] = datetime.utcnow()
    elif status in ["completed", "error", "failed"]:
        job = get_job(job_id)
        if job:
            updates["completed_at"] = datetime.utcnow()
            if job.get("started_at"):
                started = datetime.fromisoformat(job["started_at"])
                completed = datetime.utcnow()
                duration = (completed - started).total_seconds()
                updates["processing_duration_seconds"] = duration
    
    return update_job(job_id, **updates)

def get_all_jobs(limit: int = 100, offset: int = 0, status: Optional[str] = None,
                 user_id: Optional[int] = None) -> List[Dict]:
    """Get all jobs with optional filtering"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Error getting jobs: {e}")
        return []

def get_job_stats() -> Dict[str, Any]:
    """Get statistics about jobs"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Total jobs
        cursor.execute("SELECT COUNT(*) FROM jobs")
        total_jobs = cursor.fetchone()[0]
        
        # Jobs by status
        cursor.execute("SELECT status, COUNT(*) FROM jobs GROUP BY status")
        status_counts = dict(cursor.fetchall())
        
        # Average processing time
        cursor.execute("SELECT AVG(processing_duration_seconds) FROM jobs WHERE processing_duration_seconds IS NOT NULL")
        avg_duration = cursor.fetchone()[0] or 0
        
        # Jobs today
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE DATE(created_at) = DATE('now')")
        jobs_today = cursor.fetchone()[0]
        
        # Jobs this week
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE created_at >= DATE('now', '-7 days')")
        jobs_this_week = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_jobs": total_jobs,
            "status_counts": status_counts,
            "average_processing_time": round(avg_duration, 2),
            "jobs_today": jobs_today,
            "jobs_this_week": jobs_this_week
        }
    except Exception as e:
        print(f"Error getting job stats: {e}")
        return {}

def delete_old_jobs(days: int = 30) -> int:
    """Delete jobs older than specified days"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM jobs WHERE created_at < DATE('now', '-' || ? || ' days')",
            (days,)
        )
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        print(f"Deleted {deleted_count} jobs older than {days} days")
        return deleted_count
    except Exception as e:
        print(f"Error deleting old jobs: {e}")
        return 0

# Initialize database on import
init_jobs_database()
