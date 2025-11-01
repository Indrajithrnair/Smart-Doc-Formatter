"""
Analytics API endpoints for data visualization in admin dashboard.
Provides time-series data, trends, and statistics for charts.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sqlite3
import os
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin/analytics", tags=["analytics"])

# Database paths
JOBS_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.db")
USERS_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "users.db")


# ==================== Models ====================

class TimeSeriesDataPoint(BaseModel):
    date: str
    value: int

class SuccessRateDataPoint(BaseModel):
    date: str
    successful: int
    failed: int
    success_rate: float

class ProcessingTimeDataPoint(BaseModel):
    date: str
    avg_seconds: float
    min_seconds: float
    max_seconds: float

class UserSummary(BaseModel):
    id: int
    email: str
    username: str
    created_at: str
    is_active: bool
    total_jobs: int


# ==================== Documents Processed Over Time ====================

@router.get("/documents-over-time")
async def get_documents_over_time(days: int = Query(30, ge=1, le=365)):
    """
    Get number of documents processed per day for the last N days.
    Returns data suitable for line/bar charts.
    """
    try:
        conn = sqlite3.connect(JOBS_DB_PATH)
        cursor = conn.cursor()
        
        # Get daily job counts
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM jobs
            WHERE created_at >= DATE('now', '-' || ? || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (days,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Fill in missing dates with 0
        data_dict = {row[0]: row[1] for row in results}
        
        # Generate all dates in range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        time_series = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            time_series.append({
                "date": date_str,
                "value": data_dict.get(date_str, 0)
            })
            current_date += timedelta(days=1)
        
        return {
            "labels": [point["date"] for point in time_series],
            "data": [point["value"] for point in time_series],
            "total": sum(point["value"] for point in time_series)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching documents over time: {str(e)}")


# ==================== Success vs Failure Rate ====================

@router.get("/success-failure-rate")
async def get_success_failure_rate(days: int = Query(30, ge=1, le=365)):
    """
    Get success vs failure rate over time.
    Returns data for stacked area/bar charts.
    """
    try:
        conn = sqlite3.connect(JOBS_DB_PATH)
        cursor = conn.cursor()
        
        # Get daily success/failure counts
        cursor.execute('''
            SELECT 
                DATE(created_at) as date,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN status IN ('error', 'failed') THEN 1 ELSE 0 END) as failed,
                COUNT(*) as total
            FROM jobs
            WHERE created_at >= DATE('now', '-' || ? || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (days,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Process results
        data_dict = {row[0]: {"successful": row[1], "failed": row[2], "total": row[3]} for row in results}
        
        # Generate all dates in range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        time_series = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            day_data = data_dict.get(date_str, {"successful": 0, "failed": 0, "total": 0})
            
            success_rate = 0
            if day_data["total"] > 0:
                success_rate = round((day_data["successful"] / day_data["total"]) * 100, 2)
            
            time_series.append({
                "date": date_str,
                "successful": day_data["successful"],
                "failed": day_data["failed"],
                "success_rate": success_rate
            })
            current_date += timedelta(days=1)
        
        return {
            "labels": [point["date"] for point in time_series],
            "successful": [point["successful"] for point in time_series],
            "failed": [point["failed"] for point in time_series],
            "success_rates": [point["success_rate"] for point in time_series],
            "overall_success_rate": round(
                sum(p["successful"] for p in time_series) / 
                max(sum(p["successful"] + p["failed"] for p in time_series), 1) * 100, 
                2
            )
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching success/failure rate: {str(e)}")


# ==================== Processing Time Trends ====================

@router.get("/processing-time-trends")
async def get_processing_time_trends(days: int = Query(30, ge=1, le=365)):
    """
    Get processing time trends over time.
    Returns average, min, and max processing times per day.
    """
    try:
        conn = sqlite3.connect(JOBS_DB_PATH)
        cursor = conn.cursor()
        
        # Get daily processing time statistics
        cursor.execute('''
            SELECT 
                DATE(created_at) as date,
                AVG(processing_duration_seconds) as avg_duration,
                MIN(processing_duration_seconds) as min_duration,
                MAX(processing_duration_seconds) as max_duration,
                COUNT(*) as count
            FROM jobs
            WHERE created_at >= DATE('now', '-' || ? || ' days')
                AND processing_duration_seconds IS NOT NULL
                AND status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (days,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Process results
        data_dict = {}
        for row in results:
            data_dict[row[0]] = {
                "avg": round(row[1], 2) if row[1] else 0,
                "min": round(row[2], 2) if row[2] else 0,
                "max": round(row[3], 2) if row[3] else 0,
                "count": row[4]
            }
        
        # Generate all dates in range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        time_series = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            day_data = data_dict.get(date_str, {"avg": 0, "min": 0, "max": 0, "count": 0})
            
            if day_data["count"] > 0:  # Only include days with completed jobs
                time_series.append({
                    "date": date_str,
                    "avg_seconds": day_data["avg"],
                    "min_seconds": day_data["min"],
                    "max_seconds": day_data["max"]
                })
            current_date += timedelta(days=1)
        
        return {
            "labels": [point["date"] for point in time_series],
            "avg_times": [point["avg_seconds"] for point in time_series],
            "min_times": [point["min_seconds"] for point in time_series],
            "max_times": [point["max_seconds"] for point in time_series],
            "overall_avg": round(
                sum(p["avg_seconds"] for p in time_series) / max(len(time_series), 1),
                2
            ) if time_series else 0
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching processing time trends: {str(e)}")


# ==================== Template Usage Statistics ====================

@router.get("/template-usage")
async def get_template_usage():
    """
    Get usage statistics by template type.
    Returns data for pie/donut charts.
    """
    try:
        conn = sqlite3.connect(JOBS_DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COALESCE(template_type, 'Custom/Contextual') as template,
                COUNT(*) as count
            FROM jobs
            GROUP BY template_type
            ORDER BY count DESC
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        return {
            "labels": [row[0] for row in results],
            "data": [row[1] for row in results],
            "total": sum(row[1] for row in results)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template usage: {str(e)}")


# ==================== User Management ====================

@router.get("/users", response_model=List[UserSummary])
async def list_users():
    """
    Get list of all users with their job counts.
    """
    try:
        # Get users
        users_conn = sqlite3.connect(USERS_DB_PATH)
        users_conn.row_factory = sqlite3.Row
        users_cursor = users_conn.cursor()
        
        users_cursor.execute('''
            SELECT id, email, username, created_at, is_active
            FROM users
            ORDER BY created_at DESC
        ''')
        
        users = users_cursor.fetchall()
        users_conn.close()
        
        # Get job counts for each user
        jobs_conn = sqlite3.connect(JOBS_DB_PATH)
        jobs_cursor = jobs_conn.cursor()
        
        user_summaries = []
        for user in users:
            jobs_cursor.execute(
                'SELECT COUNT(*) FROM jobs WHERE user_id = ?',
                (user['id'],)
            )
            job_count = jobs_cursor.fetchone()[0]
            
            user_summaries.append(UserSummary(
                id=user['id'],
                email=user['email'],
                username=user['username'],
                created_at=user['created_at'],
                is_active=bool(user['is_active']),
                total_jobs=job_count
            ))
        
        jobs_conn.close()
        
        return user_summaries
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/users/stats")
async def get_user_stats():
    """
    Get user statistics.
    """
    try:
        conn = sqlite3.connect(USERS_DB_PATH)
        cursor = conn.cursor()
        
        # Total users
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        
        # Active users
        cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
        active_users = cursor.fetchone()[0]
        
        # Users created this week
        cursor.execute('''
            SELECT COUNT(*) FROM users 
            WHERE created_at >= DATE('now', '-7 days')
        ''')
        new_users_this_week = cursor.fetchone()[0]
        
        # Users created this month
        cursor.execute('''
            SELECT COUNT(*) FROM users 
            WHERE created_at >= DATE('now', '-30 days')
        ''')
        new_users_this_month = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "new_users_this_week": new_users_this_week,
            "new_users_this_month": new_users_this_month
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user stats: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """
    Delete a user and optionally their associated jobs.
    """
    try:
        # Check if user exists
        users_conn = sqlite3.connect(USERS_DB_PATH)
        users_cursor = users_conn.cursor()
        
        users_cursor.execute('SELECT email FROM users WHERE id = ?', (user_id,))
        user = users_cursor.fetchone()
        
        if not user:
            users_conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        user_email = user[0]
        
        # Get job count
        jobs_conn = sqlite3.connect(JOBS_DB_PATH)
        jobs_cursor = jobs_conn.cursor()
        
        jobs_cursor.execute('SELECT COUNT(*) FROM jobs WHERE user_id = ?', (user_id,))
        job_count = jobs_cursor.fetchone()[0]
        
        # Delete user's jobs (optional - you might want to keep them)
        jobs_cursor.execute('DELETE FROM jobs WHERE user_id = ?', (user_id,))
        jobs_conn.commit()
        jobs_conn.close()
        
        # Delete user
        users_cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        users_conn.commit()
        users_conn.close()
        
        return {
            "message": "User deleted successfully",
            "user_id": user_id,
            "email": user_email,
            "deleted_jobs": job_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(user_id: int):
    """
    Toggle user active/inactive status.
    """
    try:
        conn = sqlite3.connect(USERS_DB_PATH)
        cursor = conn.cursor()
        
        # Get current status
        cursor.execute('SELECT is_active FROM users WHERE id = ?', (user_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        current_status = bool(result[0])
        new_status = not current_status
        
        # Update status
        cursor.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            (1 if new_status else 0, user_id)
        )
        conn.commit()
        conn.close()
        
        return {
            "message": "User status updated",
            "user_id": user_id,
            "is_active": new_status
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user status: {str(e)}")


# ==================== Peak Usage Hours ====================

@router.get("/peak-usage-hours")
async def get_peak_usage_hours():
    """
    Get job distribution by hour of day.
    Returns data for heatmap or bar chart.
    """
    try:
        conn = sqlite3.connect(JOBS_DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                CAST(strftime('%H', created_at) AS INTEGER) as hour,
                COUNT(*) as count
            FROM jobs
            GROUP BY hour
            ORDER BY hour
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        # Fill in missing hours with 0
        hour_counts = {row[0]: row[1] for row in results}
        
        return {
            "labels": [f"{h:02d}:00" for h in range(24)],
            "data": [hour_counts.get(h, 0) for h in range(24)],
            "peak_hour": max(hour_counts.items(), key=lambda x: x[1])[0] if hour_counts else 0
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching peak usage hours: {str(e)}")
