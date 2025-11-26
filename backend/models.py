"""
OpenLedger Black - Pydantic Models
Type-safe data models for API requests and responses
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    DISBURSEMENT = "disbursement"
    TRANSFER = "transfer"


class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MilestoneStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"
    CANCELLED = "cancelled"


class AssetStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"
    DISPOSED = "disposed"


class DocumentType(str, Enum):
    RECEIPT = "receipt"
    INVOICE = "invoice"
    REPORT = "report"
    CONTRACT = "contract"
    OTHER = "other"


# ============================================================================
# AUTH MODELS
# ============================================================================

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role_id: int
    role_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# ============================================================================
# FINANCE MODELS
# ============================================================================

class TransactionBase(BaseModel):
    transaction_type: TransactionType
    category_id: Optional[int] = None
    amount: float = Field(..., gt=0)
    description: str
    date: date
    project_id: Optional[int] = None
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    reference_number: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    reference_number: Optional[str] = None
    created_by: int
    created_at: datetime
    category_name: Optional[str] = None
    project_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    name: str
    description: Optional[str] = None
    fiscal_year: int
    start_date: date
    end_date: date
    total_amount: float = Field(..., gt=0)


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: int
    status: str
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BudgetItemCreate(BaseModel):
    budget_id: int
    category_id: int
    allocated_amount: float = Field(..., gt=0)
    notes: Optional[str] = None


class BudgetItemResponse(BaseModel):
    id: int
    budget_id: int
    category_id: int
    category_name: Optional[str] = None
    allocated_amount: float
    spent_amount: float
    variance: Optional[float] = None
    utilization_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True


class CashflowSnapshot(BaseModel):
    snapshot_date: date
    opening_balance: float
    total_income: float
    total_expenses: float
    closing_balance: float
    burn_rate: Optional[float] = None
    projection_30_days: Optional[float] = None


# ============================================================================
# PROJECT MODELS
# ============================================================================

class ProjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    total_budget: float = Field(..., ge=0)
    donor_name: Optional[str] = None
    project_manager_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    project_manager_id: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus
    spent_amount: float
    budget_utilization: Optional[float] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    project_manager_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class MilestoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    due_date: date
    completion_percentage: float = Field(default=0, ge=0, le=100)


class MilestoneCreate(MilestoneBase):
    project_id: int


class MilestoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[MilestoneStatus] = None
    completion_percentage: Optional[float] = Field(None, ge=0, le=100)
    completion_date: Optional[date] = None


class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    status: MilestoneStatus
    completion_date: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# ASSET MODELS
# ============================================================================

class AssetBase(BaseModel):
    asset_tag: str
    name: str
    category_id: int
    description: Optional[str] = None
    purchase_date: date
    purchase_price: float = Field(..., gt=0)
    location: Optional[str] = None
    condition: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[AssetStatus] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    notes: Optional[str] = None


class AssetResponse(AssetBase):
    id: int
    current_value: Optional[float] = None
    depreciation_method: str
    status: AssetStatus
    category_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MaintenanceLogCreate(BaseModel):
    asset_id: int
    maintenance_type: str
    description: str
    maintenance_date: date
    next_maintenance_date: Optional[date] = None
    cost: float = Field(default=0, ge=0)
    performed_by: Optional[str] = None
    notes: Optional[str] = None


class MaintenanceLogResponse(MaintenanceLogCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# INVENTORY MODELS
# ============================================================================

class InventoryItemBase(BaseModel):
    item_code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit_of_measure: str
    minimum_quantity: float = Field(default=0, ge=0)
    unit_cost: Optional[float] = None
    location: Optional[str] = None


class InventoryItemCreate(InventoryItemBase):
    current_quantity: float = Field(default=0, ge=0)


class InventoryItemResponse(InventoryItemBase):
    id: int
    current_quantity: float
    total_value: Optional[float] = None
    is_low_stock: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# IMPACT METRICS MODELS
# ============================================================================

class KPIBase(BaseModel):
    name: str
    description: Optional[str] = None
    measurement_unit: str
    target_value: Optional[float] = None
    frequency: str
    category_id: Optional[int] = None


class KPICreate(KPIBase):
    pass


class KPIResponse(KPIBase):
    id: int
    category_name: Optional[str] = None
    created_by: int
    created_at: datetime
    current_value: Optional[float] = None
    achievement_rate: Optional[float] = None
    
    class Config:
        from_attributes = True


class KPIValueCreate(BaseModel):
    kpi_id: int
    value: float
    recorded_date: date
    project_id: Optional[int] = None
    notes: Optional[str] = None


class KPIValueResponse(KPIValueCreate):
    id: int
    recorded_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BeneficiaryBase(BaseModel):
    type: str
    name: Optional[str] = None
    identifier: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    location: Optional[str] = None
    registration_date: date


class BeneficiaryCreate(BeneficiaryBase):
    project_id: Optional[int] = None


class BeneficiaryResponse(BeneficiaryBase):
    id: int
    project_id: Optional[int] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# ANALYTICS & DASHBOARD MODELS
# ============================================================================

class DashboardStats(BaseModel):
    total_income: float
    total_expenses: float
    net_cashflow: float
    burn_rate: float
    active_projects: int
    total_budget: float
    budget_spent: float
    budget_utilization: float
    low_stock_items: int
    upcoming_maintenances: int
    total_beneficiaries: int


class FinancialAnalytics(BaseModel):
    period_start: date
    period_end: date
    total_income: float
    total_expenses: float
    net_position: float
    burn_rate: float
    projection_30_days: float
    projection_90_days: float
    budget_variance: float
    top_expense_categories: List[dict]
    income_trend: List[dict]
    expense_trend: List[dict]


# ============================================================================
# PAGINATION
# ============================================================================

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
