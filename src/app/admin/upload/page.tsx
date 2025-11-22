// app/admin/upload/page.tsx
/**
 * =============================================================================
 * Admin Upload Center Page
 * =============================================================================
 * Features:
 * - Video file upload with progress
 * - Bulk upload support
 * - Upload queue management
 * - S3 presigned URL handling
 */

import { VideoUploader } from "@/components/admin/VideoUploader";

export const metadata = {
  title: "Upload Center - Admin - MoviesNow",
  description: "Upload and process video files",
};

export default function AdminUploadPage() {
  return <VideoUploader />;
}
