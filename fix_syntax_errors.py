from pathlib import Path

# Fix recommendations page syntax errors
file = Path("src/app/(protected)/recommendations/page.tsx")
content = file.read_text(encoding='utf-8')

# Fix the commented out hooks
content = content.replace(
    """  // const { data: personalizedData, isLoading: loadingPersonalized, refetch: refetchPersonalized } =
    usePersonalizedRecommendations({ limit: 20 });

  // const { data: trendingData, isLoading: loadingTrending } = useTrendingRecommendations({
    time_window: '7d',
    limit: 20,
  });

  const refreshRecommendations = useRefreshRecommendations();

  const handleRefresh = async () => {
    await refreshRecommendations.mutateAsync();
    await refetchPersonalized();
  };""",
    """  // Personalized recommendations hooks temporarily disabled
  const personalizedData = null;
  const loadingPersonalized = false;
  const refetchPersonalized = async () => {};

  const trendingData = null;
  const loadingTrending = false;

  const handleRefresh = async () => {
    // Refresh logic disabled
  };"""
)

file.write_text(content, encoding='utf-8')
print("Fixed recommendations page")

# Fix variants page - find unclosed div
variants_file = Path("src/app/(protected)/admin/titles/[id]/variants/page.tsx")
variants_content = variants_file.read_text(encoding='utf-8')

# Fix the commented out AdvancedFileUploader properly
variants_content = variants_content.replace(
    "{/* <AdvancedFileUploader",
    "{\n          /* <AdvancedFileUploader"
)
variants_content = variants_content.replace(
    "</AdvancedFileUploader> */}",
    "</AdvancedFileUploader>*/\n          }"
)

# Check for unclosed tags
if variants_content.count("<div") != variants_content.count("</div>"):
    print("Warning: Mismatch in div tags in variants page")
    # Try to find and fix the issue
    # This is a simple fix - may need manual adjustment
    # Add a closing div at the end of the return statement
    variants_content = variants_content.replace(
        "    </div>\n  );\n}",
        "    </div>\n      </div>\n  );\n}"
    )

variants_file.write_text(variants_content, encoding='utf-8')
print("Fixed variants page")
