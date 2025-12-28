"""
Fix all service file return statements
Remove the incorrect "|| any" pattern
"""
from pathlib import Path
import re

def fix_service_returns(file_path):
    """Fix return statements in service files"""
    try:
        path = Path(file_path)
        if not path.exists():
            return False

        content = path.read_text(encoding='utf-8')
        original = content

        # Fix pattern: "return response as any || any;" -> "return response as any;"
        content = re.sub(r'return response as any \|\| any;', 'return response as any;', content)

        # Fix pattern: "return response as any || [];" -> "return response as any;"
        content = re.sub(r'return response as any \|\| \[\];', 'return response as any;', content)

        # Fix pattern: "return response as any ||" -> "return response as any;"
        content = re.sub(r'return response as any \|\|[^;]*;', 'return response as any;', content)

        if content != original:
            path.write_text(content, encoding='utf-8')
            print(f"[OK] {file_path}")
            return True

        return False
    except Exception as e:
        print(f"[ERR] {file_path}: {e}")
        return False

# Fix all service files
service_dir = Path("src/lib/api/services")
service_files = list(service_dir.glob("*.ts"))

print("Fixing service return statements...\n")

fixed = 0
for service_file in service_files:
    if service_file.name == "index.ts":
        continue
    if fix_service_returns(service_file):
        fixed += 1

# Also fix services.ts
if fix_service_returns("src/lib/api/services.ts"):
    fixed += 1

print(f"\nFixed {fixed} service files")
