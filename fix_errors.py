import re
from pathlib import Path

def fix_file(file_path, replacements):
    """Apply replacements to a file"""
    try:
        content = Path(file_path).read_text(encoding='utf-8')
        for old, new in replacements:
            content = content.replace(old, new)
        Path(file_path).write_text(content, encoding='utf-8')
        print(f"Fixed: {file_path}")
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

# Fix notifications - add Film import
fix_file("src/app/(protected)/notifications/page.tsx", [
    ('  X,\n} from \'lucide-react\';', '  X,\n  Film,\n} from \'lucide-react\';')
])

print("Done!")
