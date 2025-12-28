from pathlib import Path

# Fix ReviewCard
file = Path("src/components/reviews/ReviewCard.tsx")
content = file.read_text(encoding='utf-8')

content = content.replace(
    "  const { accessToken, user } = // // useAuthStore();",
    "  // const { accessToken, user } = useAuthStore(); // Disabled\n  const accessToken = null;\n  const user = null;"
)

file.write_text(content, encoding='utf-8')
print("Fixed ReviewCard.tsx")

# Fix ReviewList
file = Path("src/components/reviews/ReviewList.tsx")
content = file.read_text(encoding='utf-8')

# Find similar pattern and fix
content = content.replace(
    "  const { user } = // // useAuthStore();",
    "  // const { user } = useAuthStore(); // Disabled\n  const user = null;"
)

# Alternative pattern
content = content.replace(
    "  const { accessToken, user } = // // useAuthStore();",
    "  // const { accessToken, user } = useAuthStore(); // Disabled\n  const accessToken = null;\n  const user = null;"
)

file.write_text(content, encoding='utf-8')
print("Fixed ReviewList.tsx")
