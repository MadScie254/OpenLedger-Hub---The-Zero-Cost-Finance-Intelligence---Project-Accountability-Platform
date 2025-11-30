-- OpenLedger Hub - Open Access SQLite Schema
-- Zero-cost, collaborative database architecture
-- Built for transparency and community accountability
-- NO AUTHENTICATION - Open access for all

-- ============================================================================
-- FINANCE ENGINE - TRANSPARENT FINANCIAL TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS transaction_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('income', 'expense', 'disbursement', 'transfer')),
    category_id INTEGER,
    amount REAL NOT NULL CHECK(amount > 0),
    description TEXT NOT NULL,
    reference_number TEXT UNIQUE,
    date DATE NOT NULL,
    project_id INTEGER,
    attachment_path TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    recurring_frequency TEXT CHECK(recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);

CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount REAL NOT NULL CHECK(total_amount > 0),
    status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year);
CREATE INDEX idx_budgets_status ON budgets(status);

CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    budget_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    allocated_amount REAL NOT NULL CHECK(allocated_amount > 0),
    spent_amount REAL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(id)
);

CREATE INDEX idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX idx_budget_items_category ON budget_items(category_id);

CREATE TABLE IF NOT EXISTS cashflow_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    opening_balance REAL NOT NULL,
    total_income REAL NOT NULL DEFAULT 0,
    total_expenses REAL NOT NULL DEFAULT 0,
    closing_balance REAL NOT NULL,
    burn_rate REAL,
    projection_30_days REAL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashflow_date ON cashflow_snapshots(snapshot_date);

-- ============================================================================
-- PROJECT INTELLIGENCE SYSTEM - COLLABORATIVE PROJECT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK(status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    total_budget REAL NOT NULL CHECK(total_budget >= 0),
    spent_amount REAL DEFAULT 0,
    donor_name TEXT,
    project_manager_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_projects_status ON projects(status);

CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completion_date DATE,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
    completion_percentage REAL DEFAULT 0 CHECK(completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

CREATE TABLE IF NOT EXISTS deliverables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    delivered_date DATE,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'delivered', 'approved', 'rejected')),
    assigned_to_name TEXT,
    attachment_path TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
);

CREATE INDEX idx_deliverables_milestone ON deliverables(milestone_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);

CREATE TABLE IF NOT EXISTS project_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    document_type TEXT NOT NULL CHECK(document_type IN ('receipt', 'invoice', 'report', 'contract', 'other')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by_name TEXT,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_documents_project ON project_documents(project_id);
CREATE INDEX idx_project_documents_type ON project_documents(document_type);

-- ============================================================================
-- ASSET & INVENTORY COMMAND CENTER - RESOURCE ACCOUNTABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    depreciation_rate REAL DEFAULT 0 CHECK(depreciation_rate >= 0 AND depreciation_rate <= 100),
    useful_life_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_tag TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    purchase_date DATE NOT NULL,
    purchase_price REAL NOT NULL CHECK(purchase_price > 0),
    current_value REAL,
    depreciation_method TEXT DEFAULT 'straight_line' CHECK(depreciation_method IN ('straight_line', 'declining_balance', 'none')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'maintenance', 'retired', 'disposed')),
    location TEXT,
    condition TEXT CHECK(condition IN ('excellent', 'good', 'fair', 'poor')),
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id)
);

CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    assigned_to_type TEXT NOT NULL CHECK(assigned_to_type IN ('person', 'project')),
    assigned_to_name TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    return_date DATE,
    assigned_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_asset_assignments_asset ON asset_assignments(asset_id);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    maintenance_type TEXT NOT NULL CHECK(maintenance_type IN ('routine', 'repair', 'inspection', 'upgrade')),
    description TEXT NOT NULL,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    cost REAL DEFAULT 0,
    performed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_maintenance_asset ON maintenance_logs(asset_id);
CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_maintenance_next_date ON maintenance_logs(next_maintenance_date);

CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_of_measure TEXT NOT NULL,
    current_quantity REAL NOT NULL DEFAULT 0,
    minimum_quantity REAL DEFAULT 0,
    maximum_quantity REAL,
    unit_cost REAL,
    total_value REAL,
    location TEXT,
    supplier TEXT,
    last_restocked_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_category ON inventory_items(category);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK(movement_type IN ('in', 'out', 'adjustment')),
    quantity REAL NOT NULL,
    reference_number TEXT,
    movement_date DATE NOT NULL,
    reason TEXT,
    performed_by_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);

-- ============================================================================
-- IMPACT METRICS CORTEX - COMMUNITY IMPACT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS kpi_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    measurement_unit TEXT NOT NULL,
    target_value REAL,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one_time')),
    calculation_method TEXT,
    is_cumulative BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES kpi_categories(id)
);

CREATE INDEX idx_kpis_category ON kpis(category_id);
CREATE INDEX idx_kpis_frequency ON kpis(frequency);

CREATE TABLE IF NOT EXISTS kpi_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kpi_id INTEGER NOT NULL,
    value REAL NOT NULL,
    recorded_date DATE NOT NULL,
    project_id INTEGER,
    notes TEXT,
    recorded_by_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kpi_id) REFERENCES kpis(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_kpi_values_kpi ON kpi_values(kpi_id);
CREATE INDEX idx_kpi_values_date ON kpi_values(recorded_date);
CREATE INDEX idx_kpi_values_project ON kpi_values(project_id);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    type TEXT NOT NULL CHECK(type IN ('individual', 'household', 'organization', 'community')),
    name TEXT,
    identifier TEXT UNIQUE,
    gender TEXT CHECK(gender IN ('male', 'female', 'other', 'unknown')),
    age_group TEXT,
    location TEXT,
    registration_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'graduated')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_beneficiaries_project ON beneficiaries(project_id);
CREATE INDEX idx_beneficiaries_type ON beneficiaries(type);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);

CREATE TABLE IF NOT EXISTS impact_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK(report_type IN ('monthly', 'quarterly', 'annual', 'project', 'donor', 'custom')),
    project_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    generated_by_name TEXT,
    file_path TEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_impact_reports_project ON impact_reports(project_id);
CREATE INDEX idx_impact_reports_type ON impact_reports(report_type);

-- ============================================================================
-- DATABASE METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO schema_version (version, description) VALUES ('2.0.0', 'OpenLedger Hub - Open Access (No Authentication)');
