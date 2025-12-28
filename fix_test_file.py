from pathlib import Path

file = Path("tests/unit/useSceneMarkers.test.ts")
content = file.read_text(encoding='utf-8')

content = content.replace(
    "import { api } from '@/lib/api';",
    "import { api } from '@/lib/api/services';"
)

# Also need to mock the correct path
content = content.replace(
    "vi.mock('@/lib/api', () => ({",
    "vi.mock('@/lib/api/services', () => ({"
)

file.write_text(content, encoding='utf-8')
print("Fixed test file")
