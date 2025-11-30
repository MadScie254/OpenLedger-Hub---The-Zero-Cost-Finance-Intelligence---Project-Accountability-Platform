"""
OpenLedger Black - Finance Engine Routes
Transaction management, budgets, cashflow analytics - cold precision
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import date, datetime, timedelta
from database import Database, get_db
from models import (
    TransactionCreate,
    TransactionResponse,
    BudgetCreate,
    BudgetResponse,
    BudgetItemCreate,
    BudgetItemResponse,
    CashflowSnapshot,
    FinancialAnalytics,
    UserResponse
)
# Auth removed - open access platform


router = APIRouter()


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    db: Database = Depends(get_db)
):
    """Record a new transaction - income, expense, disbursement, or transfer"""
    
    # Generate reference number if not provided
    ref_number = transaction.reference_number
    if not ref_number:
        count = await db.fetch_one("SELECT COUNT(*) as count FROM transactions")
        ref_number = f"TXN-{datetime.now().strftime('%Y%m')}-{count['count'] + 1:04d}"
    
    # Insert transaction
    cursor = await db.execute(
        """
        INSERT INTO transactions 
        (transaction_type, category_id, amount, description, reference_number, 
         date, created_by, project_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            transaction.transaction_type,
            transaction.category_id,
            transaction.amount,
            transaction.description,
            ref_number,
            transaction.date,
            "system",
            transaction.project_id,
            transaction.notes
        )
    )
    await db.commit()
    
    # Update project spent amount if applicable
    if transaction.project_id and transaction.transaction_type == "expense":
        await db.execute(
            "UPDATE projects SET spent_amount = spent_amount + ? WHERE id = ?",
            (transaction.amount, transaction.project_id)
        )
        await db.commit()
    
    # Log audit    
    # Fetch and return created transaction
    created = await db.fetch_one(
        """
        SELECT t.*, tc.name as category_name, p.name as project_name
        FROM transactions t
        LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
        """,
        (cursor.lastrowid,)
    )
    
    return TransactionResponse(**created)


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    transaction_type: Optional[str] = None,
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Database = Depends(get_db)
):
    """List transactions with filters and pagination"""
    
    # Build query with filters
    conditions = ["1=1"]
    params = []
    
    if transaction_type:
        conditions.append("t.transaction_type = ?")
        params.append(transaction_type)
    
    if project_id:
        conditions.append("t.project_id = ?")
        params.append(project_id)
    
    if start_date:
        conditions.append("t.date >= ?")
        params.append(start_date)
    
    if end_date:
        conditions.append("t.date <= ?")
        params.append(end_date)
    
    where_clause = " AND ".join(conditions)
    
    transactions = await db.fetch_all(
        f"""
        SELECT t.*, tc.name as category_name, p.name as project_name
        FROM transactions t
        LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE {where_clause}
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT ? OFFSET ?
        """,
        (*params, limit, skip)
    )
    
    return [TransactionResponse(**t) for t in transactions]


@router.get("/budgets", response_model=List[BudgetResponse])
async def list_budgets(
    db: Database = Depends(get_db)
):
    """List all budgets"""
    budgets = await db.fetch_all(
        """
        SELECT * FROM budgets
        ORDER BY fiscal_year DESC, created_at DESC
        """
    )
    return [BudgetResponse(**b) for b in budgets]


@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget: BudgetCreate,
    db: Database = Depends(get_db)
):
    """Create a new budget"""
    cursor = await db.execute(
        """
        INSERT INTO budgets 
        (name, description, fiscal_year, start_date, end_date, total_amount, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            budget.name,
            budget.description,
            budget.fiscal_year,
            budget.start_date,
            budget.end_date,
            budget.total_amount,
            "system"
        )
    )
    await db.commit()    
    created = await db.fetch_one("SELECT * FROM budgets WHERE id = ?", (cursor.lastrowid,))
    return BudgetResponse(**created)


@router.get("/budgets/{budget_id}/items", response_model=List[BudgetItemResponse])
async def list_budget_items(
    budget_id:int,
    db: Database = Depends(get_db)
):
    """List budget items with variance analysis"""
    items = await db.fetch_all(
        """
        SELECT 
            bi.*,
            tc.name as category_name,
            (bi.allocated_amount - bi.spent_amount) as variance,
            CASE 
                WHEN bi.allocated_amount > 0 
                THEN ROUND((bi.spent_amount * 100.0 / bi.allocated_amount), 2)
                ELSE 0
            END as utilization_percentage
        FROM budget_items bi
        LEFT JOIN transaction_categories tc ON bi.category_id = tc.id
        WHERE bi.budget_id = ?
        ORDER BY bi.created_at
        """,
        (budget_id,)
    )
    
    return [BudgetItemResponse(**item) for item in items]


@router.get("/cashflow", response_model=List[CashflowSnapshot])
async def get_cashflow(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Database = Depends(get_db)
):
    """Get cashflow snapshots over time"""
    
    conditions = []
    params = []
    
    if start_date:
        conditions.append("snapshot_date >= ?")
        params.append(start_date)
    
    if end_date:
        conditions.append("snapshot_date <= ?")
        params.append(end_date)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    snapshots = await db.fetch_all(
        f"""
        SELECT * FROM cashflow_snapshots
        WHERE {where_clause}
        ORDER BY snapshot_date DESC
        LIMIT 90
        """,
        tuple(params)
    )
    
    return [CashflowSnapshot(**s) for s in snapshots]


@router.get("/analytics", response_model=FinancialAnalytics)
async def get_financial_analytics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Database = Depends(get_db)
):
    """Get comprehensive financial analytics"""
    
    # Default to last 90 days if not specified
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=90)
    
    # Get totals
    totals = await db.fetch_one(
        """
        SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN transaction_type IN ('expense', 'disbursement') THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE date BETWEEN ? AND ?
        """,
        (start_date, end_date)
    )
    
    # Calculate metrics
    days_in_period = (end_date - start_date).days or 1
    burn_rate = totals['total_expenses'] / days_in_period
    
    # Get top expense categories
    top_expenses = await db.fetch_all(
        """
        SELECT 
            tc.name,
            SUM(t.amount) as total
        FROM transactions t
        LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        WHERE t.transaction_type IN ('expense', 'disbursement')
          AND t.date BETWEEN ? AND ?
        GROUP BY tc.id, tc.name
        ORDER BY total DESC
        LIMIT 5
        """,
        (start_date, end_date)
    )
    
    # Get monthly trends
    income_trend = await db.fetch_all(
        """
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(amount) as total
        FROM transactions
        WHERE transaction_type = 'income'
          AND date BETWEEN ? AND ?
        GROUP BY month
        ORDER BY month
        """,
        (start_date, end_date)
    )
    
    expense_trend = await db.fetch_all(
        """
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(amount) as total
        FROM transactions
        WHERE transaction_type IN ('expense', 'disbursement')
          AND date BETWEEN ? AND ?
        GROUP BY month
        ORDER BY month
        """,
        (start_date, end_date)
    )
    
    return FinancialAnalytics(
        period_start=start_date,
        period_end=end_date,
        total_income=totals['total_income'],
        total_expenses=totals['total_expenses'],
        net_position=totals['total_income'] - totals['total_expenses'],
        burn_rate=burn_rate,
        projection_30_days=burn_rate * 30,
        projection_90_days=burn_rate * 90,
        budget_variance=0,  # TODO: Calculate from budget
        top_expense_categories=[dict(e) for e in top_expenses],
        income_trend=[dict(i) for i in income_trend],
        expense_trend=[dict(e) for e in expense_trend]
    )


@router.get("/export")
async def export_transactions(
    format: str = Query("csv", regex="^(csv|pdf)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Database = Depends(get_db)
):
    """Export transactions to CSV or PDF"""
    
    # TODO: Implement CSV/PDF export
    # For now, return placeholder
    
    return {
        "message": "Export functionality - to be implemented",
        "format": format,
        "start_date": start_date,
        "end_date": end_date
    }
