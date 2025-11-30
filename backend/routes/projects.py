"""
OpenLedger Black - Projects Intelligence Routes
Project management, milestones, deliverables - compliance officer in code
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from typing import List, Optional
from database import Database, get_db
from models import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    UserResponse
)
# Auth removed - open access
import os
from config import settings


router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    db: Database = Depends(get_db)
):
    """Create a new project"""
    
    # Check if code already exists
    existing = await db.fetch_one("SELECT id FROM projects WHERE code = ?", (project.code,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project code '{project.code}' already exists"
        )
    
    cursor = await db.execute(
        """
        INSERT INTO projects 
        (name, code, description, start_date, end_date, total_budget, 
         donor_name, project_manager_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            project.name,
            project.code,
            project.description,
            project.start_date,
            project.end_date,
            project.total_budget,
            project.donor_name,
            project.project_manager_id,
            "system"
        )
    )
    await db.commit()
    
    # Audit logging removed
    
    # Fetch created project with manager name
    created = await db.fetch_one(
        """
        SELECT 
            p.*,
            u.full_name as project_manager_name,
            CASE 
                WHEN p.total_budget > 0 
                THEN ROUND((p.spent_amount * 100.0 / p.total_budget), 2)
                ELSE 0
            END as budget_utilization
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE p.id = ?
        """,
        (cursor.lastrowid,)
    )
    
    return ProjectResponse(**created)


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db)
):
    """List all projects with filters"""
    
    conditions = []
    params = []
    
    if status:
        conditions.append("p.status = ?")
        params.append(status)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    projects = await db.fetch_all(
        f"""
        SELECT 
            p.*,
            u.full_name as project_manager_name,
            CASE 
                WHEN p.total_budget > 0 
                THEN ROUND((p.spent_amount * 100.0 / p.total_budget), 2)
                ELSE 0
            END as budget_utilization
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE {where_clause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
        """,
        (*params, limit, skip)
    )
    
    return [ProjectResponse(**p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.view"))
):
    """Get project details"""
    
    project = await db.fetch_one(
        """
        SELECT 
            p.*,
            u.full_name as project_manager_name,
            CASE 
                WHEN p.total_budget > 0 
                THEN ROUND((p.spent_amount * 100.0 / p.total_budget), 2)
                ELSE 0
            END as budget_utilization
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE p.id = ?
        """,
        (project_id,)
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(**project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    updates: ProjectUpdate,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.update"))
):
    """Update project details"""
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    if updates.name is not None:
        update_fields.append("name = ?")
        params.append(updates.name)
    
    if updates.description is not None:
        update_fields.append("description = ?")
        params.append(updates.description)
    
    if updates.end_date is not None:
        update_fields.append("end_date = ?")
        params.append(updates.end_date)
    
    if updates.status is not None:
        update_fields.append("status = ?")
        params.append(updates.status)
    
    if updates.project_manager_id is not None:
        update_fields.append("project_manager_id = ?")
        params.append(updates.project_manager_id)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(project_id)
    
    await db.execute(
        f"UPDATE projects SET {', '.join(update_fields)} WHERE id = ?",
        tuple(params)
    )
    await db.commit()
    
    await log_audit(db, current_user.id, "UPDATE", "projects", project_id)
    
    # Return updated project
    return await get_project(project_id, db, current_user)


@router.post("/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    project_id: int,
    milestone: MilestoneCreate,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.create"))
):
    """Create a milestone for a project"""
    
    # Verify project exists
    project = await db.fetch_one("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    cursor = await db.execute(
        """
        INSERT INTO milestones 
        (project_id, name, description, due_date, completion_percentage)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            project_id,
            milestone.name,
            milestone.description,
            milestone.due_date,
            milestone.completion_percentage
        )
    )
    await db.commit()
    
    await log_audit(db, current_user.id, "CREATE", "milestones", cursor.lastrowid)
    
    created = await db.fetch_one("SELECT * FROM milestones WHERE id = ?", (cursor.lastrowid,))
    return MilestoneResponse(**created)


@router.get("/{project_id}/milestones", response_model=List[MilestoneResponse])
async def list_milestones(
    project_id: int,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.view"))
):
    """List all milestones for a project"""
    
    milestones = await db.fetch_all(
        """
        SELECT * FROM milestones
        WHERE project_id = ?
        ORDER BY due_date
        """,
        (project_id,)
    )
    
    return [MilestoneResponse(**m) for m in milestones]


@router.post("/{project_id}/upload")
async def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    document_type: str = Query("other"),
    description: Optional[str] = None,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.update"))
):
    """Upload a document (receipt, report, etc.) for a project"""
    
    # Verify project exists
    project = await db.fetch_one("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create project-specific upload directory
    project_dir = os.path.join(settings.UPLOAD_DIR, f"project_{project_id}")
    os.makedirs(project_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(project_dir, file.filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Record in database
    cursor = await db.execute(
        """
        INSERT INTO project_documents 
        (project_id, document_type, file_name, file_path, file_size, uploaded_by, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            project_id,
            document_type,
            file.filename,
            file_path,
            len(content),
            current_user.id,
            description
        )
    )
    await db.commit()
    
    await log_audit(db, current_user.id, "UPLOAD", "project_documents", cursor.lastrowid)
    
    return {
        "message": "Document uploaded successfully",
        "file_name": file.filename,
        "file_size": len(content),
        "document_id": cursor.lastrowid
    }


@router.get("/{project_id}/report")
async def generate_project_report(
    project_id: int,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(create_permission_dependency("projects.view"))
):
    """Generate donor report for a project"""
    
    # TODO: Implement comprehensive report generation
    # For now, return summary data
    
    project = await db.fetch_one(
        """
        SELECT 
            p.*,
            u.full_name as project_manager_name,
            CASE 
                WHEN p.total_budget > 0 
                THEN ROUND((p.spent_amount * 100.0 / p.total_budget), 2)
                ELSE 0
            END as budget_utilization,
            COUNT(DISTINCT m.id) as total_milestones,
            SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) as completed_milestones
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        LEFT JOIN milestones m ON m.project_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
        """,
        (project_id,)
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    transactions = await db.fetch_all(
        """
        SELECT t.*, tc.name as category_name
        FROM transactions t
        LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        WHERE t.project_id = ?
        ORDER BY t.date DESC
        """,
        (project_id,)
    )
    
    return {
        "project": dict(project),
        "transactions": [dict(t) for t in transactions],
        "message": "Full PDF report generation - to be implemented"
    }
