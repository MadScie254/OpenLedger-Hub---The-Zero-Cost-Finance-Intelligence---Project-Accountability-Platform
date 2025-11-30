"""
Quick script to remove authentication dependencies from route files
"""

import re

# Files to update
files = [
    'routes/finance.py',
    'routes/projects.py',
    'routes/assets.py',
    'routes/impact.py'
]

for filepath in files:
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove auth import line
    content = re.sub(r'from auth import .+\n', '# Auth removed - open access\n', content)
    
    #Remove Depends lines with auth
    # Pattern 1: ,\n    current_user: UserResponse = Depends(create_permission_dependency(...))
    content = re.sub(
        r',\s*\n\s*current_user:\s*UserResponse\s*=\s*Depends\(create_permission_dependency\([^)]+\)\)',
        '',
        content
    )
    
    # Pattern 2: current_user: UserResponse = Depends(get_current_user)
    content = re.sub(
        r',\s*\n\s*current_user:\s*UserResponse\s*=\s*Depends\(get_current_user\)',
        '',
        content
    )
    
    # Remove log_audit calls
    content = re.sub(r'\s*await log_audit\([^)]+\)\n', '', content)
    
    # Remove references to current_user.id (replace with "system")
    content = re.sub(r'current_user\.id', '"system"', content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ {filepath} updated")

print("\n✓ All route files updated - auth dependencies removed!")
