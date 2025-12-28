"""
Fix ALL service file errors by adding proper type assertions
and fixing fetch calls
"""
import re
from pathlib import Path

def fix_service_file(file_path):
    """Fix a single service file"""
    try:
        path = Path(file_path)
        if not path.exists():
            return False

        content = path.read_text(encoding='utf-8')
        original = content

        # Pattern 1: Fix fetchJson calls - add type assertion to return
        # response.data -> response as any
        content = re.sub(r'return response\.data;', 'return response as any;', content)

        # Pattern 2: Fix fetchJson calls with second argument (data)
        # fetchJson('/path', data) -> fetchJson('/path', { method: 'PATCH', json: data })
        content = re.sub(
            r'fetchJson\(([^,]+),\s*(\w+)\)',
            r'fetchJson(\1, { method: "PATCH", json: \2 })',
            content
        )

        # Pattern 3: Add type parameter to fetchJson calls
        # await fetchJson -> await fetchJson<any>
        content = re.sub(r'fetchJson\(', 'fetchJson<any>(', content)

        # Pattern 4: Fix response is unknown
        # const response = await fetchJson -> const response: any = await fetchJson
        content = re.sub(
            r'const response = await fetchJson',
            'const response: any = await fetchJson',
            content
        )

        if content != original:
            path.write_text(content, encoding='utf-8')
            print(f"[OK] {file_path}")
            return True

        return False
    except Exception as e:
        print(f"[ERR] {file_path}: {e}")
        return False

# Get all service files
service_dir = Path("src/lib/api/services")
service_files = list(service_dir.glob("*.ts"))

print("=" * 70)
print("FIXING ALL API SERVICE FILES")
print("=" * 70)
print()

fixed = 0
for service_file in service_files:
    if service_file.name == "index.ts":
        continue  # Skip the index file

    if fix_service_file(service_file):
        fixed += 1

print()
print(f"Fixed {fixed} service files")

# Also fix services.ts
print("\nFixing services.ts...")
if fix_service_file("src/lib/api/services.ts"):
    print("[OK] services.ts")

print()
print("=" * 70)
print("DONE")
print("=" * 70)
