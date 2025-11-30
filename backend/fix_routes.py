"""Simple batch script to remove all auth dependencies"""
import re, glob

for filepath in glob.glob('routes/*.py'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace auth imports
    content = re.sub(r'from auth import .+\n', '# Auth removed\n', content)
    
    # Remove Depends with auth
    content = re.sub(r',\s*current_user:\s*UserResponse\s*=\s*Depends\([^)]+\)', '', content, flags=re.MULTILINE)
    
    # Replace current_user.id
    content = re.sub(r'current_user\.id', '"system"', content)
    
    # Remove log_audit calls
    content = re.sub(r'\s*await log_audit\([^)]+\)\n', '    # Audit removed\n', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"[OK] {filepath}")
print("Done")
