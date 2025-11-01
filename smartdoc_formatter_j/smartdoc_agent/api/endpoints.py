
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import shutil
import os
import uuid
from typing import Dict, List, Any
from datetime import datetime
import asyncio
import json # For process_document_agent_task's result parsing
import traceback

from .models import FileUploadResponse, ProcessingRequest, JobStatus, WebSocketMessage, FinalProcessingResult, FinalProcessingResultData
from smartdoc_agent.core.agent import DocumentFormattingAgent
from ..config import get_groq_api_key
from .websocket_manager import manager
from .job_database import (
    create_job, get_job, update_job, update_job_status,
    get_all_jobs, get_job_stats
)

# --- In-Memory Job Store (for WebSocket tracking) ---
# Now synced with persistent database
jobs_db: Dict[str, Dict] = {}

def load_recent_jobs():
    """Load recent processing jobs from database into memory for WebSocket tracking"""
    try:
        recent_jobs = get_all_jobs(limit=50)
        for job in recent_jobs:
            if job.get("status") in ["processing", "queued"]:
                jobs_db[job["job_id"]] = job
        print(f"Loaded {len(jobs_db)} recent jobs from database")
    except Exception as e:
        print(f"Error loading recent jobs: {e}")

# Load jobs on startup
load_recent_jobs()

# --- Agent Processing Function (to be run in background) ---
def process_document_agent_task(job_id: str, user_goal: str):
    # Simulate getting the current event loop for this background task context
    try:
        loop = asyncio.get_running_loop()
        if manager.main_event_loop is None : # Set it if manager could not get it at startup
            manager.main_event_loop = loop
            print(f"Agent Task for {job_id}: Main event loop captured for manager.")
    except RuntimeError:
        print(f"Agent Task for {job_id}: No running event loop, WebSocket broadcasts from thread might fail.")
        # manager.main_event_loop might remain None if this task is run very early by FastAPI

    # Get job from database first, then sync to memory
    job_info = get_job(job_id)
    if not job_info:
        job_info = jobs_db.get(job_id)
    
    if not job_info or job_info["status"] != "queued": # Expecting "queued" now
        error_message = f"Job {job_id} not found or not in 'queued' state for processing. Current state: {job_info.get('status') if job_info else 'N/A'}"
        print(error_message)
        if job_info:
            # Update database
            update_job_status(job_id, "error", error_message, error_message)
            # Update memory
            job_info["status"] = "error"
            job_info["current_step_details"] = error_message
            jobs_db[job_id] = job_info
            
            final_error_result = FinalProcessingResult(
                job_id=job_id, status="error", message=error_message, error_details=error_message
            )
            job_info["final_result_data"] = final_error_result.model_dump()
            ws_err_msg = WebSocketMessage(job_id=job_id, type="job_error", message=error_message, timestamp="")
            manager.broadcast_to_job_from_thread(job_id, ws_err_msg)
        return

    # Update database
    update_job_status(job_id, "processing", "Initializing agent...")
    # Update memory
    job_info["status"] = "processing"
    job_info["current_step_details"] = "Initializing agent..."
    jobs_db[job_id] = job_info
    
    initial_progress_msg = WebSocketMessage(job_id=job_id, type="status_update", event="processing_start", message="Initializing agent...", timestamp="")
    manager.broadcast_to_job_from_thread(job_id, initial_progress_msg)

    def progress_callback_for_job(data: dict):
        # data is what agent's _emit_progress sends
        ws_message = WebSocketMessage(
            job_id=job_id,
            type=data.get("type", "agent_progress"),
            event=data.get("event"), name=data.get("name"), purpose=data.get("purpose"),
            input_preview=data.get("input_preview"), observation_preview=data.get("observation_preview"),
            variable=data.get("variable"), length=data.get("length"), message=data.get("message"),
            details=data.get("details"), final_answer=data.get("final_answer"),
            duration_seconds=data.get("duration_seconds"), timestamp=""
        )
        manager.broadcast_to_job_from_thread(job_id, ws_message)

    try:
        # Get formatting mode (defaults to contextual for backward compatibility)
        formatting_mode = job_info.get("formatting_mode", "contextual")
        template_type = job_info.get("template_type", "business_proposal")
        
        original_doc_path = job_info["original_file_path"]
        job_output_dir = os.path.join(TEMP_UPLOAD_DIR, job_id, "formatted")
        os.makedirs(job_output_dir, exist_ok=True)
        output_doc_filename = job_info.get("original_file_name", "formatted_document.docx")
        base_name, ext_name = os.path.splitext(output_doc_filename)
        output_doc_path = os.path.join(job_output_dir, f"{base_name}_formatted{ext_name}")

        job_info["output_file_path"] = output_doc_path

        print(f"Starting agent with mode: {formatting_mode}")
        print(f"  user_query: {user_goal}")
        print(f"  document_path: {original_doc_path}")
        print(f"  output_document_path: {output_doc_path}")
        print(f"  Document exists: {os.path.exists(original_doc_path)}")

        # Route to appropriate agent based on mode
        if formatting_mode == "template":
            # Use Template Formatting Agent
            print(f"Using Template Agent with template: {template_type}")
            try:
                from smartdoc_agent.core.template_agent import TemplateFormattingAgent
                agent = TemplateFormattingAgent(progress_callback=progress_callback_for_job)
                
                print(f"DEBUG: About to call template_agent.run()")
                print(f"DEBUG: Agent type: {type(agent)}")
                
                final_agent_response_str = agent.run(
                    document_path=original_doc_path,
                    output_document_path=output_doc_path,
                    template_type=template_type
                )
                
            except ImportError as e:
                # Fallback to contextual agent if template agent not available
                print(f"Template agent not available ({e}), using contextual agent as fallback")
                agent = DocumentFormattingAgent(progress_callback=progress_callback_for_job)
                final_agent_response_str = agent.run(
                    user_query=user_goal,
                    document_path=original_doc_path,
                    output_document_path=output_doc_path
                )
        else:
            # Use Contextual Formatting Agent (default/existing behavior)
            print(f"Using Contextual Formatting Agent")
            agent = DocumentFormattingAgent(progress_callback=progress_callback_for_job)
            
            print(f"DEBUG: About to call agent.run()")
            print(f"DEBUG: Agent type: {type(agent)}")
            print(f"DEBUG: Agent has llm_chain: {hasattr(agent, 'llm_chain')}")
            
            final_agent_response_str = agent.run(
                user_query=user_goal,
                document_path=original_doc_path,
                output_document_path=output_doc_path
            )

        print(f"DEBUG: Agent.run() returned")
        print(f"Agent completed with response: {final_agent_response_str}")
        print(f"Output file exists: {os.path.exists(output_doc_path)}")
        print(f"DEBUG: Response length: {len(str(final_agent_response_str))}")
        print(f"DEBUG: Response type: {type(final_agent_response_str)}")

        original_analysis_summary, modified_analysis_summary, plan_actions_count, validation_summary_dict = None, None, None, {}

        # Only try to access these attributes if they exist (contextual agent has them, template agent doesn't)
        if hasattr(agent, 'full_original_analysis_json') and agent.full_original_analysis_json:
            try:
                original_analysis_summary = json.loads(agent.full_original_analysis_json).get("summary")
            except:
                pass

        if hasattr(agent, 'full_modified_analysis_json') and agent.full_modified_analysis_json:
            try:
                modified_analysis_summary = json.loads(agent.full_modified_analysis_json).get("summary")
            except:
                pass

        if hasattr(agent, 'current_formatting_plan_json') and agent.current_formatting_plan_json:
            try:
                plan_actions_count = len(json.loads(agent.current_formatting_plan_json))
            except:
                pass

        if "AgentFinish:" in final_agent_response_str:
            final_answer_content = final_agent_response_str.split("AgentFinish:", 1)[-1].strip()
            try:
                validation_output = json.loads(final_answer_content)
                if isinstance(validation_output, dict) and "overall_assessment" in validation_output:
                    validation_summary_dict = validation_output
                else:
                    validation_summary_dict = {"raw_final_answer": final_answer_content}
            except json.JSONDecodeError:
                validation_summary_dict = {"raw_final_answer": final_agent_response_str}
        else:
            validation_summary_dict = {"raw_final_answer": final_agent_response_str}

        result_data_obj = FinalProcessingResultData(
            original_doc_path=original_doc_path,
            formatted_doc_path=output_doc_path if os.path.exists(output_doc_path) else None,
            analysis_summary_original=original_analysis_summary,
            analysis_summary_modified=modified_analysis_summary,
            formatting_plan_actions_count=plan_actions_count,
            validation_report_summary=validation_summary_dict,
            agent_final_answer=final_agent_response_str
        )

        final_status_message = "Processing complete."
        if not os.path.exists(output_doc_path):
            final_status_message = "Processing completed, but output file was not generated."
        
        # Update database
        update_job_status(job_id, "completed", final_status_message)
        update_job(job_id, output_file_path=output_doc_path)
        
        # Update memory
        jobs_db[job_id].update({
            "status": "completed",
            "current_step_details": final_status_message,
            "final_result_data": result_data_obj.dict(),
            "completed_at": datetime.now().isoformat()
        })
        final_ws_msg = WebSocketMessage(job_id=job_id, type="job_completed", message=final_status_message, data=result_data_obj.dict(), timestamp="")
        manager.broadcast_to_job_from_thread(job_id, final_ws_msg)

    except Exception as e:
        print(f"Error during agent processing for job {job_id}: {e}")
        detailed_error = traceback.format_exc()
        error_message_for_user = f"Agent processing error: {str(e)}"
        
        # Update database
        update_job_status(job_id, "error", error_message_for_user, error_message_for_user)
        
        # Update memory
        jobs_db[job_id].update({
            "status": "error",
            "current_step_details": error_message_for_user,
            "final_result_data": FinalProcessingResultData(
                original_doc_path=jobs_db[job_id].get("original_file_path", "N/A"), # Try to get original path
                agent_final_answer=f"Error: {str(e)}",
                # No other summaries available on error typically
            ).dict(exclude_none=True), # Store as dict
            "error_details_for_log": detailed_error, # For server logs, not necessarily for user
            "error_message": error_message_for_user,
            "completed_at": datetime.now().isoformat()
        })
        final_ws_err_msg = WebSocketMessage(job_id=job_id, type="job_error", message=error_message_for_user, details=detailed_error, timestamp="")
        manager.broadcast_to_job_from_thread(job_id, final_ws_err_msg)


router = APIRouter()

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

@router.post("/documents/upload", response_model=FileUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .docx allowed.")

    job_id = str(uuid.uuid4())
    original_file_name = file.filename

    job_dir = os.path.join(TEMP_UPLOAD_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    original_file_path = os.path.join(job_dir, "original.docx")

    try:
        with open(original_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        # Clean up job_dir if save fails?
        raise HTTPException(status_code=500, detail=f"Could not save uploaded file: {e}")
    finally:
        file.file.close()
    
    # Get file size
    file_size = os.path.getsize(original_file_path)
    
    # Create job in database
    job_data = create_job(
        job_id=job_id,
        user_id=None,  # Will be set when we have auth
        user_email=None,
        formatting_mode="contextual",
        template_type=None,
        original_file_name=original_file_name,
        original_file_path=original_file_path,
        file_size_bytes=file_size
    )
    
    # Also keep in memory for WebSocket tracking
    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "uploaded",
        "original_file_path": original_file_path,
        "original_file_name": original_file_name,
        "output_file_path": None,
        "user_goal": None,
        "current_step_details": "File uploaded successfully. Ready for processing.",
        "final_result_data": None,
        "error_details_for_log": None,
        "created_at": datetime.now().isoformat(),
        "completed_at": None
    }

    return FileUploadResponse(
        job_id=job_id,
        file_name=original_file_name,
        status="uploaded",
        message="File uploaded successfully. Ready for processing."
    )

@router.post("/documents/process/{job_id}", status_code=202)
async def process_document_endpoint(job_id: str, request: ProcessingRequest, background_tasks: BackgroundTasks):
    # Check database first
    job_info = get_job(job_id)
    if not job_info:
        if job_id not in jobs_db:
            raise HTTPException(status_code=404, detail="Job ID not found.")
        job_info = jobs_db[job_id]

    if job_info["status"] != "uploaded":
        # Allow reprocessing if it was 'completed' or 'error'? For now, require 'uploaded'.
        raise HTTPException(status_code=400, detail=f"Document for job {job_id} is not in 'uploaded' state. Current state: {job_info['status']}")

    # Update database
    update_job(
        job_id,
        user_goal=request.user_goal,
        formatting_mode=request.formatting_mode,
        template_type=request.template_type,
        status="queued",
        current_step_details="Queued for processing."
    )
    
    # Update memory
    job_info["user_goal"] = request.user_goal
    job_info["formatting_mode"] = request.formatting_mode
    job_info["template_type"] = request.template_type
    job_info["status"] = "queued"
    job_info["current_step_details"] = "Queued for processing."
    job_info["final_result_data"] = None
    job_info["error_details_for_log"] = None
    jobs_db[job_id] = job_info

    background_tasks.add_task(process_document_agent_task, job_id, request.user_goal)

    return {"message": "Document processing initiated.", "job_id": job_id}


@router.get("/documents/{job_id}/status", response_model=JobStatus) # Using JobStatus as response
async def get_job_status(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job ID not found.")

    job_info = jobs_db[job_id]

    output_doc_url = None
    # Only provide download URL if job is completed AND output file path exists
    if job_info["status"] == "completed" and job_info.get("output_file_path") and os.path.exists(job_info["output_file_path"]):
        output_doc_url = f"/api/documents/{job_id}/download/formatted"

    original_doc_url = f"/api/documents/{job_id}/download/original" if job_info.get("original_file_path") else None

    # Extract a summary from final_result_data for the 'details' field
    details_summary = job_info.get("current_step_details", "N/A")
    if job_info.get("final_result_data"):
        final_data = job_info["final_result_data"]
        if isinstance(final_data, dict) and "agent_final_answer" in final_data :
             details_summary = final_data["agent_final_answer"]
        elif isinstance(final_data, FinalProcessingResultData): # Should be dict from .model_dump()
             details_summary = final_data.agent_final_answer


    return JobStatus(
        job_id=job_id,
        status=job_info["status"],
        current_step=job_info.get("current_step_details", "N/A"), # More granular step from agent
        details=details_summary, # Main agent message or error
        output_doc_url=output_doc_url,
        original_doc_url=original_doc_url,
        final_result_data=job_info.get("final_result_data")
    )

@router.get("/documents/{job_id}/download/formatted")
async def download_formatted_document(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job ID not found.")
    job_info = jobs_db[job_id]

    if job_info["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job {job_id} not completed. Status: {job_info['status']}")

    file_path = job_info.get("output_file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Formatted document file not found or path is missing.")

    base, ext = os.path.splitext(job_info.get("original_file_name", f"{job_id}_formatted.docx"))
    download_filename = f"{base}_formatted_by_agent{ext}" # Make it more distinct

    return FileResponse(path=file_path, filename=download_filename, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')

@router.get("/documents/{job_id}/download/original")
async def download_original_document(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job ID not found.")
    job_info = jobs_db[job_id]

    file_path = job_info.get("original_file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Original document file not found or path is missing.")

    return FileResponse(path=file_path, filename=job_info.get("original_file_name", f"{job_id}_original.docx"), media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')


@router.websocket("/ws/processing-updates/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    if manager.main_event_loop is None:
        try:
            manager.main_event_loop = asyncio.get_running_loop()
            print(f"WebSocket Endpoint: Main event loop captured for job {job_id}")
        except RuntimeError:
            print(f"Error: WebSocket Endpoint for job {job_id} could not get running event loop for manager.")
            await websocket.close(code=1011)
            return

    await manager.connect(job_id, websocket)
    try:
        while True:
            # This loop keeps the connection open.
            # For a simple broadcast-only WebSocket, you might just await a long sleep or a disconnect signal.
            # If you need to receive messages from client (e.g. to confirm receipt or send commands like 'pause')
            # data = await websocket.receive_text()
            # print(f"WS received from client for job {job_id}: {data}") # Example
            await asyncio.sleep(3600) # Keep connection alive for an hour, or until disconnect
    except WebSocketDisconnect:
        print(f"Client for job {job_id} disconnected (WebSocketDisconnect).")
    except Exception as e:
        print(f"Exception in WebSocket connection for job {job_id}: {e}")
    finally: # Ensure disconnect is called
        manager.disconnect(job_id, websocket)
        print(f"WebSocket for job {job_id} connection closed and cleaned up.")
