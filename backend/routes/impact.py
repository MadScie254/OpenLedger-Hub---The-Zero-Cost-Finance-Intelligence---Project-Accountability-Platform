"""
OpenLedger Black - Impact Metrics Routes
KPI tracking, beneficiary management, impact reporting - PR + results proof machine
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import date
from database import Database, get_db
from models import (
    KPICreate,
    KPIResponse,
    KPIValueCreate,
    KPIValueResponse,
    BeneficiaryCreate,
    BeneficiaryResponse,
    DashboardStats,
    UserResponse
)
# Auth removed - open access


router = APIRouter()


# ============================================================================
# KPI MANAGEMENT
# ============================================================================

@router.post("/kpis", response_model=KPIResponse, status_code=status.HTTP_201_CREATED)
async def create_kpi(
    kpi: KPICreate,
    db: Database = Depends(get_db)
):
    """Create a custom KPI"""
    
    cursor = await db.execute(
        """
        INSERT INTO kpis 
        (category_id, name, description, measurement_unit, target_value, frequency, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            kpi.category_id,
            kpi.name,
            kpi.description,
            kpi.measurement_unit,
            kpi.target_value,
            kpi.frequency,
            "system"
        )
    )
    await db.commit()
    # Audit removed
    
    created = await db.fetch_one(
        """
        SELECT k.*, kc.name as category_name
        FROM kpis k
        LEFT JOIN kpi_categories kc ON k.category_id = kc.id
        WHERE k.id = ?
        """,
        (cursor.lastrowid,)
    )
    
    created_dict = dict(created)
    created_dict['current_value'] = None
    created_dict['achievement_rate'] = None
    
    return KPIResponse(**created_dict)


@router.get("/kpis", response_model=List[KPIResponse])
async def list_kpis(
    category_id: Optional[int] = None,
    db: Database = Depends(get_db)
):
    """List all KPIs with current values and achievement rates"""
    
    conditions = []
    params = []
    
    if category_id:
        conditions.append("k.category_id = ?")
        params.append(category_id)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    kpis = await db.fetch_all(
        f"""
        SELECT 
            k.*,
            kc.name as category_name,
            (
                SELECT value 
                FROM kpi_values 
                WHERE kpi_id = k.id 
                ORDER BY recorded_date DESC 
                LIMIT 1
            ) as current_value,
            CASE 
                WHEN k.target_value > 0 
                THEN ROUND((
                    (SELECT SUM(value) FROM kpi_values WHERE kpi_id = k.id) 
                    * 100.0 / k.target_value
                ), 2)
                ELSE NULL
            END as achievement_rate
        FROM kpis k
        LEFT JOIN kpi_categories kc ON k.category_id = kc.id
        WHERE {where_clause}
        ORDER BY k.created_at DESC
        """,
        tuple(params)
    )
    
    return [KPIResponse(**kpi) for kpi in kpis]


@router.post("/kpis/{kpi_id}/record", response_model=KPIValueResponse, status_code=status.HTTP_201_CREATED)
async def record_kpi_value(
    kpi_id: int,
    value: KPIValueCreate,
    db: Database = Depends(get_db)
):
    """Record a value for a KPI"""
    
    # Verify KPI exists
    kpi = await db.fetch_one("SELECT id FROM kpis WHERE id = ?", (kpi_id,))
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    
    # Verify kpi_id matches
    if value.kpi_id != kpi_id:
        raise HTTPException(status_code=400, detail="KPI ID mismatch")
    
    cursor = await db.execute(
        """
        INSERT INTO kpi_values 
        (kpi_id, value, recorded_date, project_id, notes, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            value.kpi_id,
            value.value,
            value.recorded_date,
            value.project_id,
            value.notes,
            "system"
        )
    )
    await db.commit()
    # Audit removed
    
    created = await db.fetch_one("SELECT * FROM kpi_values WHERE id = ?", (cursor.lastrowid,))
    return KPIValueResponse(**created)


@router.get("/kpis/{kpi_id}/values", response_model=List[KPIValueResponse])
async def list_kpi_values(
    kpi_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Database = Depends(get_db)
):
    """List recorded values for a KPI"""
    
    conditions = ["kpi_id = ?"]
    params = [kpi_id]
    
    if start_date:
        conditions.append("recorded_date >= ?")
        params.append(start_date)
    
    if end_date:
        conditions.append("recorded_date <= ?")
        params.append(end_date)
    
    where_clause = " AND ".join(conditions)
    
    values = await db.fetch_all(
        f"""
        SELECT * FROM kpi_values
        WHERE {where_clause}
        ORDER BY recorded_date DESC
        """,
        tuple(params)
    )
    
    return [KPIValueResponse(**v) for v in values]


# ============================================================================
# BENEFICIARY MANAGEMENT
# ============================================================================

@router.post("/beneficiaries", response_model=BeneficiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_beneficiary(
    beneficiary: BeneficiaryCreate,
    db: Database = Depends(get_db)
):
    """Register a new beneficiary"""
    
    cursor = await db.execute(
        """
        INSERT INTO beneficiaries 
        (project_id, type, name, identifier, gender, age_group, location, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            beneficiary.project_id,
            beneficiary.type,
            beneficiary.name,
            beneficiary.identifier,
            beneficiary.gender,
            beneficiary.age_group,
            beneficiary.location,
            beneficiary.registration_date
        )
    )
    await db.commit()
    # Audit removed
    
    created = await db.fetch_one("SELECT * FROM beneficiaries WHERE id = ?", (cursor.lastrowid,))
    return BeneficiaryResponse(**created)


@router.get("/beneficiaries", response_model=List[BeneficiaryResponse])
async def list_beneficiaries(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db)
):
    """List beneficiaries with filters"""
    
    conditions = []
    params = []
    
    if project_id:
        conditions.append("project_id = ?")
        params.append(project_id)
    
    if status:
        conditions.append("status = ?")
        params.append(status)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    beneficiaries = await db.fetch_all(
        f"""
        SELECT * FROM beneficiaries
        WHERE {where_clause}
        ORDER BY registration_date DESC
        LIMIT ? OFFSET ?
        """,
        (*params, limit, skip)
    )
    
    return [BeneficiaryResponse(**b) for b in beneficiaries]


# ============================================================================
# DASHBOARD & ANALYTICS
# ============================================================================

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Database = Depends(get_db)
):
    """Get overall dashboard statistics"""
    
    # Financial stats
    financial = await db.fetch_one(
        """
        SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN transaction_type IN ('expense', 'disbursement') THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE date >= date('now', '-30 days')
        """
    )
    
    # Get burn rate from latest cashflow snapshot
    cashflow = await db.fetch_one(
        """
        SELECT burn_rate
        FROM cashflow_snapshots
        ORDER BY snapshot_date DESC
        LIMIT 1
        """
    )
    
    # Project stats
    projects = await db.fetch_one(
        """
        SELECT 
            COUNT(*) as active_projects,
            COALESCE(SUM(total_budget), 0) as total_budget,
            COALESCE(SUM(spent_amount), 0) as budget_spent
        FROM projects
        WHERE status = 'active'
        """
    )
    
    # Low stock items
    inventory = await db.fetch_one(
        """
        SELECT COUNT(*) as low_stock_items
        FROM inventory_items
        WHERE current_quantity <= minimum_quantity
        """
    )
    
    # Upcoming maintenance
    maintenance = await db.fetch_one(
        """
        SELECT COUNT(*) as upcoming_maintenances
        FROM maintenance_logs
        WHERE next_maintenance_date BETWEEN date('now') AND date('now', '+30 days')
        """
    )
    
    # Total beneficiaries
    beneficiaries = await db.fetch_one(
        """
        SELECT COUNT(*) as total_beneficiaries
        FROM beneficiaries
        WHERE status = 'active'
        """
    )
    
    budget_utilization = 0
    if projects['total_budget'] > 0:
        budget_utilization = round((projects['budget_spent'] / projects['total_budget']) * 100, 2)
    
    return DashboardStats(
        total_income=financial['total_income'],
        total_expenses=financial['total_expenses'],
        net_cashflow=financial['total_income'] - financial['total_expenses'],
        burn_rate=cashflow['burn_rate'] if cashflow else 0,
        active_projects=projects['active_projects'],
        total_budget=projects['total_budget'],
        budget_spent=projects['budget_spent'],
        budget_utilization=budget_utilization,
        low_stock_items=inventory['low_stock_items'],
        upcoming_maintenances=maintenance['upcoming_maintenances'] or 0,
        total_beneficiaries=beneficiaries['total_beneficiaries']
    )


@router.get("/heatmap")
async def get_impact_heatmap(
    db: Database = Depends(get_db)
):
    """Get impact heatmap data for visualization"""
    
    # Get KPI achievements by category
    kpi_data = await db.fetch_all(
        """
        SELECT 
            kc.name as category,
            COUNT(DISTINCT k.id) as kpi_count,
            COUNT(kv.id) as total_records,
            ROUND(AVG(
                CASE 
                    WHEN k.target_value > 0 
                    THEN (kv.value * 100.0 / k.target_value)
                    ELSE 100
                END
            ), 2) as avg_achievement
        FROM kpi_categories kc
        LEFT JOIN kpis k ON kc.id = k.category_id
        LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
        GROUP BY kc.id, kc.name
        ORDER BY avg_achievement DESC
        """
    )
    
    # Get beneficiaries by type
    beneficiary_data = await db.fetch_all(
        """
        SELECT 
            type,
            COUNT(*) as count
        FROM beneficiaries
        WHERE status = 'active'
        GROUP BY type
        ORDER BY count DESC
        """
    )
    
    return {
        "kpi_achievements": [dict(row) for row in kpi_data],
        "beneficiary_distribution": [dict(row) for row in beneficiary_data]
    }
