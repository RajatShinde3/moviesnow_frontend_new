from pathlib import Path

file = Path("src/app/(protected)/admin/titles/[id]/variants/page.tsx")
content = file.read_text(encoding='utf-8')

# Fix the malformed comment - replace the broken comment structure
content = content.replace(
    """                    {
          /* <AdvancedFileUploader
                      accept="video/*,.m3u8,.mpd"
                      maxSize={10737418240} // 10 GB
                      onUploadComplete={(url) => setFileUrl(url)}
                      label="Drop video file or click to upload"
                    />
                  </div>""",
    """                    {/* Temporarily disabled: <AdvancedFileUploader
                      accept="video/*,.m3u8,.mpd"
                      maxSize={10737418240}
                      onUploadComplete={(url) => setFileUrl(url)}
                      label="Drop video file or click to upload"
                    /> */}
                    <input
                      type="text"
                      placeholder="Enter video file URL manually"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                  </div>"""
)

# Remove the extra closing div that was added
content = content.replace(
    """    </div>
      </div>
  );
}""",
    """    </div>
  );
}"""
)

file.write_text(content, encoding='utf-8')
print("Fixed variants page properly")
