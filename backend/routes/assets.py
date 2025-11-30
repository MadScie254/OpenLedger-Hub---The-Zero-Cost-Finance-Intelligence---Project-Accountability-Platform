"""
OpenLedger Black - Assets & Inventory Routes
Asset tracking, maintenance, inventory management - operations war room
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from database import Database, get_db
from models import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    MaintenanceLogCreate,
    MaintenanceLogResponse,
    InventoryItemCreate,
    InventoryItemResponse,
    UserResponse
)
# Auth removed


router = APIRouter()


# ============================================================================
# ASSET MANAGEMENT
# ============================================================================

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset: AssetCreate,
    db: Database = Depends(get_db))
):
    """Create a new asset"""
    
    # Check if asset tag exists
    existing = await db.fetch_one("SELECT id FROM assets WHERE asset_tag = ?", (asset.asset_tag,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset tag '{asset.asset_tag}' already exists"
        )
    
    cursor = await db.execute(
        """
        INSERT INTO assets 
        (asset_tag, name, category_id, description, purchase_date, purchase_price,
         current_value, location, condition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            asset.asset_tag,
            asset.name,
            asset.category_id,
            asset.description,
            asset.purchase_date,
            asset.purchase_price,
            asset.purchase_price,  # Initial current_value = purchase_price
            asset.location,
            asset.condition
        )
    )
    await db.commit()    # Audit removed
    
    created = await db.fetch_one(
        """
        SELECT a.*, ac.name as category_name
        FROM assets a
        LEFT JOIN asset_categories ac ON a.category_id = ac.id
        WHERE a.id = ?
        """,
        (cursor.lastrowid,)
    )
    
    return AssetResponse(**created)


@router.get("", response_model=List[AssetResponse])
async def list_assets(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db))
):
    """List assets with filters"""
    
    conditions = []
    params = []
    
    if status:
        conditions.append("a.status = ?")
        params.append(status)
    
    if category_id:
        conditions.append("a.category_id = ?")
        params.append(category_id)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    assets = await db.fetch_all(
        f"""
        SELECT a.*, ac.name as category_name
        FROM assets a
        LEFT JOIN asset_categories ac ON a.category_id = ac.id
        WHERE {where_clause}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
        """,
        (*params, limit, skip)
    )
    
    return [AssetResponse(**a) for a in assets]


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: int,
    db: Database = Depends(get_db))
):
    """Get asset details"""
    
    asset = await db.fetch_one(
        """
        SELECT a.*, ac.name as category_name
        FROM assets a
        LEFT JOIN asset_categories ac ON a.category_id = ac.id
        WHERE a.id = ?
        """,
        (asset_id,)
    )
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return AssetResponse(**asset)


@router.patch("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int,
    updates: AssetUpdate,
    db: Database = Depends(get_db))
):
    """Update asset details"""
    
    update_fields = []
    params = []
    
    if updates.name is not None:
        update_fields.append("name = ?")
        params.append(updates.name)
    
    if updates.status is not None:
        update_fields.append("status = ?")
        params.append(updates.status)
    
    if updates.location is not None:
        update_fields.append("location = ?")
        params.append(updates.location)
    
    if updates.condition is not None:
        update_fields.append("condition = ?")
        params.append(updates.condition)
    
    if updates.notes is not None:
        update_fields.append("notes = ?")
        params.append(updates.notes)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(asset_id)
    
    await db.execute(
        f"UPDATE assets SET {', '.join(update_fields)} WHERE id = ?",
        tuple(params)
    )
    await db.commit()    # Audit removed
    
    return await get_asset(asset_id, db, current_user)


@router.post("/{asset_id}/assign")
async def assign_asset(
    asset_id: int,
    assigned_to_type: str = Query(..., regex="^(user|project)$"),
    assigned_to_id: int = Query(...),
    notes: Optional[str] = None,
    db: Database = Depends(get_db))
):
    """Assign asset to a user or project"""
    
    # Verify asset exists
    asset = await db.fetch_one("SELECT id FROM assets WHERE id = ?", (asset_id,))
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    from datetime import date
    
    cursor = await db.execute(
        """
        INSERT INTO asset_assignments 
        (asset_id, assigned_to_type, assigned_to_id, assigned_date, assigned_by, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (asset_id, assigned_to_type, assigned_to_id, date.today(), "system", notes)
    )
    await db.commit()    # Audit removed
    
    return {
        "message": "Asset assigned successfully",
        "assignment_id": cursor.lastrowid
    }


@router.post("/{asset_id}/maintenance", response_model=MaintenanceLogResponse, status_code=status.HTTP_201_CREATED)
async def log_maintenance(
    asset_id: int,
    maintenance: MaintenanceLogCreate,
    db: Database = Depends(get_db))
):
    """Log maintenance activity for an asset"""
    
    # Verify asset_id matches
    if maintenance.asset_id != asset_id:
        raise HTTPException(status_code=400, detail="Asset ID mismatch")
    
    cursor = await db.execute(
        """
        INSERT INTO maintenance_logs 
        (asset_id, maintenance_type, description, maintenance_date, 
         next_maintenance_date, cost, performed_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            maintenance.asset_id,
            maintenance.maintenance_type,
            maintenance.description,
            maintenance.maintenance_date,
            maintenance.next_maintenance_date,
            maintenance.cost,
            maintenance.performed_by,
            maintenance.notes
        )
    )
    await db.commit()    # Audit removed
    
    created = await db.fetch_one("SELECT * FROM maintenance_logs WHERE id = ?", (cursor.lastrowid,))
    return MaintenanceLogResponse(**created)


@router.get("/{asset_id}/maintenance", response_model=List[MaintenanceLogResponse])
async def list_maintenance_logs(
    asset_id: int,
    db: Database = Depends(get_db))
):
    """List maintenance logs for an asset"""
    
    logs = await db.fetch_all(
        """
        SELECT * FROM maintenance_logs
        WHERE asset_id = ?
        ORDER BY maintenance_date DESC
        """,
        (asset_id,)
    )
    
    return [MaintenanceLogResponse(**log) for log in logs]


# ============================================================================
# INVENTORY MANAGEMENT
# ============================================================================

@router.post("/inventory", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item: InventoryItemCreate,
    db: Database = Depends(get_db))
):
    """Create a new inventory item"""
    
    # Check if item code exists
    existing = await db.fetch_one("SELECT id FROM inventory_items WHERE item_code = ?", (item.item_code,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item code '{item.item_code}' already exists"
        )
    
    # Calculate total value
    total_value = (item.unit_cost or 0) * item.current_quantity
    
    cursor = await db.execute(
        """
        INSERT INTO inventory_items 
        (item_code, name, description, category, unit_of_measure, 
         current_quantity, minimum_quantity, unit_cost, total_value, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item.item_code,
            item.name,
            item.description,
            item.category,
            item.unit_of_measure,
            item.current_quantity,
            item.minimum_quantity,
            item.unit_cost,
            total_value,
            item.location
        )
    )
    await db.commit()    # Audit removed
    
    created = await db.fetch_one("SELECT * FROM inventory_items WHERE id= ?", (cursor.lastrowid,))
    created_dict = dict(created)
    created_dict['is_low_stock'] = created_dict['current_quantity'] <= created_dict['minimum_quantity']
    
    return InventoryItemResponse(**created_dict)


@router.get("/inventory", response_model=List[InventoryItemResponse])
async def list_inventory(
    low_stock_only: bool = False,
    db: Database = Depends(get_db))
):
    """List inventory items with low stock warnings"""
    
    if low_stock_only:
        items = await db.fetch_all(
            """
            SELECT * FROM inventory_items
            WHERE current_quantity <= minimum_quantity
            ORDER BY current_quantity ASC
            """
        )
    else:
        items = await db.fetch_all(
            """
            SELECT * FROM inventory_items
            ORDER BY created_at DESC
            """
        )
    
    result = []
    for item in items:
        item_dict = dict(item)
        item_dict['is_low_stock'] = item_dict['current_quantity'] <= item_dict['minimum_quantity']
        result.append(InventoryItemResponse(**item_dict))
    
    return result
