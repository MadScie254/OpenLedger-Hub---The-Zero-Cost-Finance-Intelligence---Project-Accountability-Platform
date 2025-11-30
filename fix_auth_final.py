"""
Final script to remove authentication dependencies from route files.
Handles:
1. Import removal
2. Depends() injection removal
3. Audit log removal
4. User ID replacement
"""

import re
import glob

files = [
    'backend/routes/finance.py',
    'backend/routes/projects.py',
    'backend/routes/assets.py',
    'backend/routes/impact.py'
]

for filepath in files:
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Remove auth import
        content = re.sub(r'^from auth import .+$', '# Auth removed - open access', content, flags=re.MULTILINE)
        
        # 2. Remove Depends(create_permission_dependency(...)) and Depends(get_current_user)
        # Matches: current_user: UserResponse = Depends(create_permission_dependency("..."))
        # We need to handle potential newlines in the function signature
        
        # Regex for the parameter:
        # ,\s*current_user:\s*UserResponse\s*=\s*Depends\([^)]+\)
        # We'll replace it with empty string
        
        # Handle create_permission_dependency
        content = re.sub(
            r',\s*\n?\s*current_user:\s*UserResponse\s*=\s*Depends\(create_permission_dependency\("[^"]+"\)\)',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # Handle get_current_user
        content = re.sub(
            r',\s*\n?\s*current_user:\s*UserResponse\s*=\s*Depends\(get_current_user\)',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # 3. Remove log_audit calls
        # await log_audit(db, current_user.id, "CREATE", "finance", cursor.lastrowid)
        content = re.sub(r'^\s*await log_audit\(.+$', '    # Audit removed', content, flags=re.MULTILINE)
        
        # 4. Replace current_user.id with "system"
        content = content.replace('current_user.id', '"system"')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✓ {filepath} updated")
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print("Done")
