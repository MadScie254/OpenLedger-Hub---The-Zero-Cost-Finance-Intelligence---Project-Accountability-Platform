-- OpenLedger Black - Seed Data
-- Sample data for demonstration and testing

-- ============================================================================
-- Roles and Users removed for Open Access mode

-- ============================================================================
-- TRANSACTION CATEGORIES
-- ============================================================================

INSERT INTO transaction_categories (name, type, description) VALUES
-- Income categories
('Donor Funding', 'income', 'Grants and funding from donors'),
('Service Revenue', 'income', 'Revenue from services provided'),
('Product Sales', 'income', 'Income from product sales'),
('Interest Income', 'income', 'Interest earned on savings'),
('Other Income', 'income', 'Miscellaneous income'),

-- Expense categories
('Salaries & Wages', 'expense', 'Staff compensation'),
('Office Rent', 'expense', 'Office space rental'),
('Utilities', 'expense', 'Electricity, water, internet'),
('Travel & Transport', 'expense', 'Transportation and travel costs'),
('Training & Workshops', 'expense', 'Staff training and capacity building'),
('Office Supplies', 'expense', 'Stationery and office materials'),
('Equipment', 'expense', 'Equipment purchases'),
('Consultancy Fees', 'expense', 'External consultant payments'),
('Marketing', 'expense', 'Marketing and outreach'),
('Other Expenses', 'expense', 'Miscellaneous expenses'),

-- Transfer categories
('Bank Transfer', 'transfer', 'Transfers between accounts'),
('Petty Cash', 'transfer', 'Petty cash allocations');

-- ============================================================================
-- PROJECTS
-- ============================================================================

INSERT INTO projects (name, code, description, start_date, end_date, status, total_budget, spent_amount, donor_name, project_manager_name) VALUES
(
    'Community Health Initiative',
    'CHI-2024-01',
    'Providing healthcare services to underserved communities in rural areas',
    '2024-01-01',
    '2024-12-31',
    'active',
    250000.00,
    87500.00,
    'Global Health Foundation',
    'Michael Chen'
),
(
    'Youth Empowerment Program',
    'YEP-2024-02',
    'Skills training and entrepreneurship program for youth aged 18-30',
    '2024-03-01',
    '2024-11-30',
    'active',
    180000.00,
    54000.00,
    'Youth Development Fund',
    'Michael Chen'
),
(
    'Agricultural Support Project',
    'ASP-2024-03',
    'Supporting smallholder farmers with training and resources',
    '2024-02-15',
    '2025-02-14',
    'active',
    320000.00,
    96000.00,
    'Sustainable Agriculture Alliance',
    'Michael Chen'
),
(
    'Education Access Initiative',
    'EAI-2023-04',
    'Improving access to quality education in marginalized areas',
    '2023-09-01',
    '2024-08-31',
    'active',
    450000.00,
    382500.00,
    'Education for All Coalition',
    'Michael Chen'
);

-- ============================================================================
-- MILESTONES
-- ============================================================================

INSERT INTO milestones (project_id, name, description, due_date, completion_date, status, completion_percentage) VALUES
-- Community Health Initiative
(1, 'Baseline Assessment', 'Conduct community health needs assessment', '2024-02-28', '2024-02-25', 'completed', 100),
(1, 'Health Worker Training', 'Train 50 community health workers', '2024-04-30', '2024-04-28', 'completed', 100),
(1, 'Mobile Clinics Setup', 'Establish 5 mobile health clinics', '2024-06-30', NULL, 'in_progress', 75),
(1, 'Mid-Year Review', 'Conduct mid-year impact assessment', '2024-07-31', NULL, 'pending', 0),

-- Youth Empowerment Program
(2, 'Curriculum Development', 'Develop training curriculum', '2024-03-31', '2024-03-29', 'completed', 100),
(2, 'Participant Recruitment', 'Recruit 200 youth participants', '2024-05-15', '2024-05-10', 'completed', 100),
(2, 'Skills Training Phase 1', 'Complete first phase of skills training', '2024-07-31', NULL, 'in_progress', 60),
(2, 'Business Grants Distribution', 'Distribute startup grants to graduates', '2024-10-31', NULL, 'pending', 0),

-- Agricultural Support Project
(3, 'Farmer Registration', 'Register 500 smallholder farmers', '2024-03-31', '2024-03-28', 'completed', 100),
(3, 'Training Sessions', 'Conduct modern farming techniques training', '2024-05-31', NULL, 'in_progress', 50),
(3, 'Input Distribution', 'Distribute seeds and fertilizers', '2024-06-30', NULL, 'pending', 0),

-- Education Access Initiative
(4, 'Infrastructure Development', 'Build 3 new classrooms', '2023-12-31', '2023-12-20', 'completed', 100),
(4, 'Teacher Training', 'Train 30 teachers on new curriculum', '2024-02-28', '2024-02-22', 'completed', 100),
(4, 'Student Enrollment', 'Enroll 500 new students', '2024-04-30', '2024-04-15', 'completed', 100),
(4, 'Final Evaluation', 'Conduct end-of-year evaluation', '2024-08-15', NULL, 'pending', 0);

-- ============================================================================
-- TRANSACTIONS (Last 3 months)
-- ============================================================================

-- January 2024 transactions
INSERT INTO transactions (transaction_type, category_id, amount, description, reference_number, date, project_id) VALUES
('income', 1, 100000.00, 'Q1 Disbursement - Community Health Initiative', 'DON-2024-001', '2024-01-05', 1),
('income', 1, 60000.00, 'Q1 Disbursement - Youth Empowerment Program', 'DON-2024-002', '2024-01-10', 2),
('expense', 6, 12500.00, 'Salaries - January', 'SAL-2024-001', '2024-01-31', NULL),
('expense', 7, 3500.00, 'Office Rent - January', 'RENT-2024-001', '2024-01-05', NULL),
('expense', 8, 850.00, 'Utilities - January', 'UTIL-2024-001', '2024-01-15', NULL),
('expense', 9, 4200.00, 'Field Travel - CHI Project', 'TRV-2024-001', '2024-01-20', 1),
('expense', 11, 650.00, 'Office Supplies', 'SUP-2024-001', '2024-01-12', NULL),

-- February 2024 transactions
('income', 1, 80000.00, 'Q1 Disbursement - Agricultural Support', 'DON-2024-003', '2024-02-01', 3),
('income', 1, 150000.00, 'Q3 Disbursement - Education Access Initiative', 'DON-2024-004', '2024-02-15', 4),
('expense', 6, 12500.00, 'Salaries - February', 'SAL-2024-002', '2024-02-29', NULL),
('expense', 7, 3500.00, 'Office Rent - February', 'RENT-2024-002', '2024-02-05', NULL),
('expense', 8, 920.00, 'Utilities - February', 'UTIL-2024-002', '2024-02-15', NULL),
('expense', 10, 15000.00, 'Health Worker Training Workshop', 'TRAIN-2024-001', '2024-02-22', 1),
('expense', 12, 8500.00, 'Medical Equipment Purchase', 'EQUIP-2024-001', '2024-02-25', 1),
('expense', 9, 3800.00, 'Project Site Visits', 'TRV-2024-002', '2024-02-18', 3),

-- March 2024 transactions
('income', 1, 100000.00, 'Q2 Disbursement - Community Health Initiative', 'DON-2024-005', '2024-03-05', 1),
('income', 1, 60000.00, 'Q2 Disbursement - Youth Empowerment', 'DON-2024-006', '2024-03-10', 2),
('income', 1, 80000.00, 'Q2 Disbursement - Agricultural Support', 'DON-2024-007', '2024-03-12', 3),
('expense', 6, 12500.00, 'Salaries - March', 'SAL-2024-003', '2024-03-31', NULL),
('expense', 7, 3500.00, 'Office Rent - March', 'RENT-2024-003', '2024-03-05', NULL),
('expense', 8, 890.00, 'Utilities - March', 'UTIL-2024-003', '2024-03-15', NULL),
('expense', 10, 12000.00, 'Youth Skills Training', 'TRAIN-2024-002', '2024-03-20', 2),
('expense', 11, 850.00, 'Office Supplies', 'SUP-2024-002', '2024-03-08', NULL),
('expense', 9, 5200.00, 'Field Transportation', 'TRV-2024-003', '2024-03-25', 2),
('expense', 12, 18000.00, 'Mobile Clinic Vehicles', 'EQUIP-2024-002', '2024-03-28', 1);

-- ============================================================================
-- BUDGETS
-- ============================================================================

INSERT INTO budgets (name, description, fiscal_year, start_date, end_date, total_amount, status) VALUES
('FY 2024 Operating Budget', 'Annual operating budget for 2024', 2024, '2024-01-01', '2024-12-31', 500000.00, 'active');

INSERT INTO budget_items (budget_id, category_id, allocated_amount, spent_amount) VALUES
(1, 6, 150000.00, 37500.00),  -- Salaries
(1, 7, 42000.00, 10500.00),   -- Rent
(1, 8, 12000.00, 2660.00),    -- Utilities
(1, 9, 60000.00, 13200.00),   -- Travel
(1, 10, 80000.00, 27000.00),  -- Training
(1, 11, 15000.00, 1500.00),   -- Supplies
(1, 12, 100000.00, 26500.00), -- Equipment
(1, 13, 30000.00, 0.00),      -- Consultancy
(1, 14, 11000.00, 0.00);      -- Marketing

-- ============================================================================
-- ASSET CATEGORIES
-- ============================================================================

INSERT INTO asset_categories (name, depreciation_rate, useful_life_years) VALUES
('Vehicles', 20.0, 5),
('Computer Equipment', 33.33, 3),
('Office Furniture', 10.0, 10),
('Medical Equipment', 15.0, 7),
('Agricultural Equipment', 12.5, 8);

-- ============================================================================
-- ASSETS
-- ============================================================================

INSERT INTO assets (asset_tag, name, category_id, description, purchase_date, purchase_price, current_value, status, location, condition) VALUES
('VEH-001', 'Toyota Land Cruiser', 1, 'Field work vehicle', '2022-06-15', 45000.00, 27000.00, 'active', 'Main Office', 'good'),
('VEH-002', 'Mobile Clinic Van', 1, 'Converted health clinic vehicle', '2023-03-20', 38000.00, 26600.00, 'active', 'CHI Project Site', 'excellent'),
('COMP-001', 'Dell Laptop - Manager', 2, 'Project manager workstation', '2023-01-10', 1200.00, 533.33, 'active', 'Main Office', 'good'),
('COMP-002', 'Dell Laptop - Finance', 2, 'Finance manager workstation', '2023-01-10', 1200.00, 533.33, 'active', 'Main Office', 'good'),
('COMP-003', 'HP Desktop - Reception', 2, 'Reception computer', '2022-09-05', 800.00, 177.78, 'active', 'Main Office', 'fair'),
('FURN-001', 'Conference Table', 3, 'Meeting room table', '2021-08-01', 1500.00, 1050.00, 'active', 'Main Office', 'good'),
('FURN-002', 'Office Desks (5 units)', 3, 'Staff workstations', '2021-08-01', 2500.00, 1750.00, 'active', 'Main Office', 'good'),
('MED-001', 'Blood Pressure Monitors (10 units)', 4, 'Digital BP monitors', '2024-02-25', 500.00, 482.50, 'active', 'Mobile Clinics', 'excellent'),
('MED-002', 'Medical Exam Lights (5 units)', 4, 'LED examination lights', '2024-02-25', 750.00, 723.75, 'active', 'Mobile Clinics', 'excellent'),
('AGR-001', 'Water Pump System', 5, 'Irrigation water pump', '2024-03-15', 3500.00, 3427.08, 'active', 'ASP Demo Farm', 'excellent');

-- ============================================================================
-- INVENTORY ITEMS
-- ============================================================================

INSERT INTO inventory_items (item_code, name, description, category, unit_of_measure, current_quantity, minimum_quantity, unit_cost, total_value, location) VALUES
('MED-SUP-001', 'First Aid Kits', 'Complete first aid kit', 'Medical Supplies', 'units', 45, 20, 25.00, 1125.00, 'Medical Storage'),
('MED-SUP-002', 'Disposable Gloves (boxes)', 'Medical examination gloves', 'Medical Supplies', 'boxes', 85, 30, 12.00, 1020.00, 'Medical Storage'),
('MED-SUP-003', 'Hand Sanitizer (liters)', 'Alcohol-based sanitizer', 'Medical Supplies', 'liters', 120, 50, 8.00, 960.00, 'Medical Storage'),
('OFF-SUP-001', 'A4 Paper (reams)', 'White copier paper', 'Office Supplies', 'reams', 65, 30, 5.50, 357.50, 'Office Storage'),
('OFF-SUP-002', 'Pens (boxes)', 'Ballpoint pens', 'Office Supplies', 'boxes', 28, 15, 8.00, 224.00, 'Office Storage'),
('OFF-SUP-003', 'Notebooks', 'A5 ruled notebooks', 'Office Supplies', 'units', 150, 50, 2.50, 375.00, 'Office Storage'),
('AGR-SUP-001', 'Maize Seeds (kg)', 'Hybrid maize seeds', 'Agricultural Inputs', 'kg', 280, 100, 12.00, 3360.00, 'ASP Warehouse'),
('AGR-SUP-002', 'Fertilizer (bags)', 'NPK fertilizer 50kg bags', 'Agricultural Inputs', 'bags', 145, 50, 35.00, 5075.00, 'ASP Warehouse'),
('AGR-SUP-003', 'Pesticides (liters)', 'Organic pesticide', 'Agricultural Inputs', 'liters', 75, 30, 18.00, 1350.00, 'ASP Warehouse');

-- ============================================================================
-- KPI CATEGORIES & KPIs
-- ============================================================================

INSERT INTO kpi_categories (name, description) VALUES
('Health', 'Health-related impact metrics'),
('Education', 'Education access and quality metrics'),
('Economic', 'Economic empowerment metrics'),
('Agricultural', 'Agricultural productivity metrics');

INSERT INTO kpis (category_id, name, description, measurement_unit, target_value, frequency) VALUES
(1, 'Health Screenings Conducted', 'Number of health screenings provided', 'screenings', 5000, 'monthly'),
(1, 'Patients Treated', 'Number of patients receiving treatment', 'patients', 2000, 'monthly'),
(2, 'Students Enrolled', 'Number of students enrolled in programs', 'students', 500, 'quarterly'),
(2, 'Teacher Training Hours', 'Total hours of teacher training delivered', 'hours', 240, 'monthly'),
(3, 'Youth Trained', 'Youth completing skills training', 'individuals', 200, 'quarterly'),
(3, 'Businesses Started', 'New businesses launched by graduates', 'businesses', 50, 'yearly'),
(4, 'Farmers Trained', 'Farmers receiving agricultural training', 'farmers', 500, 'quarterly'),
(4, 'Crop Yield Increase', 'Average crop yield increase percentage', 'percentage', 30, 'yearly');

-- ============================================================================
-- KPI VALUES (Sample data)
-- ============================================================================

INSERT INTO kpi_values (kpi_id, value, recorded_date, project_id) VALUES
-- Health screenings
(1, 420, '2024-01-31', 1),
(1, 485, '2024-02-29', 1),
(1, 510, '2024-03-31', 1),

-- Patients treated
(2, 168, '2024-01-31', 1),
(2, 192, '2024-02-29', 1),
(2, 205, '2024-03-31', 1),

-- Students enrolled
(3, 125, '2024-03-31', 4),

-- Teacher training
(4, 18, '2024-01-31', 4),
(4, 22, '2024-02-29', 4),
(4, 20, '2024-03-31', 4),

-- Youth trained
(5, 45, '2024-03-31', 2),

-- Farmers trained
(7, 150, '2024-03-31', 3);

-- ============================================================================
-- BENEFICIARIES
-- ============================================================================

INSERT INTO beneficiaries (project_id, type, name, identifier, gender, age_group, location, registration_date, status) VALUES
(1, 'individual', 'Jane Wanjiku', 'CHI-BEN-001', 'female', '25-34', 'Kiambu County', '2024-01-15', 'active'),
(1, 'household', NULL, 'CHI-BEN-002', 'unknown', '35-44', 'Kiambu County', '2024-01-20', 'active'),
(2, 'individual', 'John Omondi', 'YEP-BEN-001', 'male', '18-24', 'Nairobi', '2024-03-10', 'active'),
(2, 'individual', 'Mary Akinyi', 'YEP-BEN-002', 'female', '18-24', 'Kisumu', '2024-03-12', 'active'),
(3, 'individual', 'Peter Mutua', 'ASP-BEN-001', 'male', '35-44', 'Machakos', '2024-02-20', 'active'),
(4, 'individual', 'Grace Chebet', 'EAI-BEN-001', 'female', '6-12', 'Turkana', '2023-09-15', 'active');

-- ============================================================================
-- CASHFLOW SNAPSHOTS
-- ============================================================================

INSERT INTO cashflow_snapshots (snapshot_date, opening_balance, total_income, total_expenses, closing_balance, burn_rate, projection_30_days) VALUES
('2024-01-31', 50000.00, 160000.00, 21700.00, 188300.00, 21700.00, 166600.00),
('2024-02-29', 188300.00, 230000.00, 44220.00, 374080.00, 44220.00, 329860.00),
('2024-03-31', 374080.00, 240000.00, 52940.00, 561140.00, 52940.00, 508200.00);
