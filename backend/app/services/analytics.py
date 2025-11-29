"""
Finance Analytics Service
Provides summary metrics, trend analysis, and ML-powered predictions.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import sqlite3
import os


def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'openledger.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def calculate_summary_metrics(entity_id: Optional[int] = None) -> Dict:
    """
    Calculate key financial summary metrics.
    
    Metrics:
    - MTD (Month-to-Date) revenue
    - MTD expenses
    - Burn rate (daily average expenses)
    - Cashflow trend slope
    - Budget variance
    
    Args:
        entity_id: Optional entity filter
        
    Returns:
        Dictionary with summary metrics
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Current month boundaries
        now = datetime.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # MTD Revenue (income transactions)
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE transaction_type = 'income'
            AND date >= ?
        """, (month_start.date(),))
        mtd_revenue = cursor.fetchone()['total']
        
        # MTD Expenses
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE transaction_type IN ('expense', 'disbursement')
            AND date >= ?
        """, (month_start.date(),))
        mtd_expenses = cursor.fetchone()['total']
        
        # Last 30 days for burn rate
        thirty_days_ago = (now - timedelta(days=30)).date()
        
        cursor.execute("""
            SELECT COALESCE(AVG(daily_expense), 0) as burn_rate
            FROM (
                SELECT date, SUM(amount) as daily_expense
                FROM transactions
                WHERE transaction_type IN ('expense', 'disbursement')
                AND date >= ?
                GROUP BY date
            )
        """, (thirty_days_ago,))
        burn_rate = cursor.fetchone()['burn_rate']
        
        # Cashflow trend (last 6 months, monthly aggregates)
        six_months_ago = (now - timedelta(days=180)).date()
        
        cursor.execute("""
            SELECT 
                strftime('%Y-%m', date) as month,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN transaction_type IN ('expense', 'disbursement') THEN amount ELSE 0 END) as expenses
            FROM transactions
            WHERE date >= ?
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month
        """, (six_months_ago,))
        
        monthly_data = cursor.fetchall()
        cashflow_data = [(row['income'] - row['expenses']) for row in monthly_data]
        
        # Simple linear trend slope
        if len(cashflow_data) >= 2:
            x_mean = sum(range(len(cashflow_data))) / len(cashflow_data)
            y_mean = sum(cashflow_data) / len(cashflow_data)
            
            numerator = sum((i - x_mean) * (y - y_mean) for i, y in enumerate(cashflow_data))
            denominator = sum((i - x_mean) ** 2 for i in range(len(cashflow_data)))
            
            trend_slope = numerator / denominator if denominator != 0 else 0
        else:
            trend_slope = 0
        
        # Budget variance
        cursor.execute("""
            SELECT 
                COALESCE(SUM(allocated_amount), 0) as total_budget,
                COALESCE(SUM(spent_amount), 0) as total_spent
            FROM budget_items
            JOIN budgets ON budget_items.budget_id = budgets.id
            WHERE budgets.status = 'active'
        """)
        budget_row = cursor.fetchone()
        total_budget = budget_row['total_budget']
        total_spent = budget_row['total_spent']
        
        budget_variance = ((total_spent - total_budget) / total_budget * 100) if total_budget > 0 else 0
        
        return {
            "mtd_revenue": round(mtd_revenue, 2),
            "mtd_expenses": round(mtd_expenses, 2),
            "net_cashflow": round(mtd_revenue - mtd_expenses, 2),
            "burn_rate": round(burn_rate, 2),
            "cashflow_trend_slope": round(trend_slope, 2),
            "budget_variance_percent": round(budget_variance, 2),
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent, 2),
            "period": "MTD",
            "generated_at": datetime.utcnow().isoformat()
        }
        
    finally:
        conn.close()


def get_cashflow_predictions(horizon_months: int = 3) -> List[Dict]:
    """
    Generate simple cashflow predictions using linear regression.
    
    Args:
        horizon_months: Number of months to predict
        
    Returns:
        List of predicted cashflow values with dates
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get last 12 months of data
        twelve_months_ago = (datetime.now() - timedelta(days=365)).date()
        
        cursor.execute("""
            SELECT 
                strftime('%Y-%m', date) as month,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) -
                SUM(CASE WHEN transaction_type IN ('expense', 'disbursement') THEN amount ELSE 0 END) as net_cashflow
            FROM transactions
            WHERE date >= ?
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month
        """, (twelve_months_ago,))
        
        historical_data = [(i, row['net_cashflow']) for i, row in enumerate(cursor.fetchall())]
        
        if len(historical_data) < 2:
            # Not enough data, return simple average
            return [{
                "month": (datetime.now() + timedelta(days=30 * (i + 1))).strftime("%Y-%m"),
                "predicted_cashflow": 0,
                "confidence_lower": 0,
                "confidence_upper": 0
            } for i in range(horizon_months)]
        
        # Linear regression
        x_values = [x for x, _ in historical_data]
        y_values = [y for _, y in historical_data]
        
        x_mean = sum(x_values) / len(x_values)
        y_mean = sum(y_values) / len(y_values)
        
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, y_values))
        denominator = sum((x - x_mean) ** 2 for x in x_values)
        
        slope = numerator / denominator if denominator != 0 else 0
        intercept = y_mean - slope * x_mean
        
        # Generate predictions
        predictions = []
        next_month_index = len(historical_data)
        
        for i in range(horizon_months):
            month_index = next_month_index + i
            predicted_value = slope * month_index + intercept
            
            # Simple confidence interval (±20%)
            confidence_range = abs(predicted_value) * 0.2
            
            prediction_date = datetime.now() + timedelta(days=30 * (i + 1))
            
            predictions.append({
                "month": prediction_date.strftime("%Y-%m"),
                "predicted_cashflow": round(predicted_value, 2),
                "confidence_lower": round(predicted_value - confidence_range, 2),
                "confidence_upper": round(predicted_value + confidence_range, 2)
            })
        
        return predictions
        
    finally:
        conn.close()
