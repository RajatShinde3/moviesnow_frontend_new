#!/usr/bin/env python3
"""
Script to fix TypeScript errors systematically
"""
import re
import os
import sys
from pathlib import Path

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

def fix_notifications_page():
    """Fix notifications/page.tsx - add Film import"""
    file_path = Path("src/app/(protected)/notifications/page.tsx")
    content = file_path.read_text(encoding='utf-8')

    # Add Film to imports
    content = content.replace(
        '  X,\n} from \'lucide-react\';',
        '  X,\n  Film,\n} from \'lucide-react\';'
    )

    file_path.write_text(content, encoding='utf-8')
    print(f"[OK] Fixed {file_path}")

def fix_missing_imports():
    """Fix missing lucide-react imports"""
    # Fix collections page - remove style prop from icons
    file_path = Path("src/app/(protected)/collections/page.tsx")
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        # Remove style prop from icons
        content = re.sub(
            r'(<\w+\s+className="[^"]*")\s+style=\{\{\s*color:\s*[^}]+\}\}',
            r'\1',
            content
        )
        file_path.write_text(content, encoding='utf-8')
        print(f"✓ Fixed {file_path}")

def fix_marker_handle():
    """Fix MarkerHandle component - remove style from icons"""
    file_path = Path("src/components/admin/MarkerHandle.tsx")
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        content = re.sub(
            r'(<\w+\s+className="[^"]*")\s+style=\{\{\s*color:\s*[^}]+\}\}',
            r'\1',
            content
        )
        file_path.write_text(content, encoding='utf-8')
        print(f"✓ Fixed {file_path}")

def fix_animated_metric_card():
    """Fix AnimatedMetricCard - remove style and duplicate attributes"""
    file_path = Path("src/components/admin/analytics/AnimatedMetricCard.tsx")
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        # Remove style props
        content = re.sub(
            r'(<\w+\s+className="[^"]*")\s+style=\{\{\s*color:\s*[^}]+\}\}',
            r'\1',
            content
        )
        file_path.write_text(content, encoding='utf-8')
        print(f"✓ Fixed {file_path}")

def main():
    os.chdir(Path(__file__).parent)

    print("Fixing TypeScript errors...")
    print()

    fix_notifications_page()
    fix_missing_imports()
    fix_marker_handle()
    fix_animated_metric_card()

    print()
    print("Done! Run 'npx tsc --noEmit' to check remaining errors.")

if __name__ == "__main__":
    main()
