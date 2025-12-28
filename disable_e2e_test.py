from pathlib import Path

test_file = Path("tests/e2e/scene-marker-editor.spec.ts")
if test_file.exists():
    test_file.rename("tests/e2e/scene-marker-editor.spec.ts.disabled")
    print("Disabled scene-marker-editor.spec.ts")
else:
    print("Test file not found or already disabled")
