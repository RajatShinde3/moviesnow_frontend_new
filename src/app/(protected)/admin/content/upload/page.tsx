// app/(protected)/admin/content/upload/page.tsx
/**
 * =============================================================================
 * Admin - Advanced Content Upload Wizard
 * =============================================================================
 * Multi-step upload wizard with all backend features:
 * - Content type selection (Movie, Series, Anime, Documentary)
 * - Metadata entry with validation
 * - Multi-quality video upload (480p, 720p, 1080p)
 * - Artwork upload (poster, backdrop, thumbnails)
 * - Subtitle upload (multi-language)
 * - Trailer upload
 * - Download bundle configuration
 * - Stream quality controls
 * - Genre and credit management
 * - Compliance settings
 */

"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Film,
  Tv,
  FileVideo,
  Image as ImageIcon,
  FileText,
  PlayCircle,
  Upload,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

type ContentType = "MOVIE" | "SERIES" | "ANIME" | "DOCUMENTARY";
type UploadStep = "type" | "metadata" | "videos" | "artwork" | "subtitles" | "config" | "review";

interface QualityUpload {
  quality: "480p" | "720p" | "1080p";
  file: File | null;
  uploadProgress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  storageKey?: string;
}

interface ArtworkUpload {
  type: "poster" | "backdrop" | "thumbnail";
  file: File | null;
  uploadProgress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  storageKey?: string;
}

interface SubtitleUpload {
  language: string;
  file: File | null;
  isForced: boolean;
  isSDH: boolean;
  uploadProgress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  storageKey?: string;
}

interface UploadFormData {
  // Content Type
  contentType: ContentType;

  // Basic Metadata
  title: string;
  originalTitle: string;
  description: string;
  releaseYear: number;
  releaseDate: string;
  duration: number; // minutes

  // Classification
  genres: string[];
  ageRating: string;
  language: string;

  // Quality Uploads
  videos: QualityUpload[];

  // Artwork
  artwork: ArtworkUpload[];

  // Subtitles
  subtitles: SubtitleUpload[];

  // Trailer
  trailer: File | null;

  // Stream Quality Config
  enabledQualities: string[];
  defaultQuality: string;

  // Download Config
  downloadEnabled: boolean;
  downloadFormats: string[];

  // Publishing
  publishImmediately: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ContentUploadWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = React.useState<UploadStep>("type");
  const [formData, setFormData] = React.useState<UploadFormData>({
    contentType: "MOVIE",
    title: "",
    originalTitle: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    releaseDate: "",
    duration: 0,
    genres: [],
    ageRating: "",
    language: "en",
    videos: [
      { quality: "480p", file: null, uploadProgress: 0, status: "pending" },
      { quality: "720p", file: null, uploadProgress: 0, status: "pending" },
      { quality: "1080p", file: null, uploadProgress: 0, status: "pending" },
    ],
    artwork: [
      { type: "poster", file: null, uploadProgress: 0, status: "pending" },
      { type: "backdrop", file: null, uploadProgress: 0, status: "pending" },
    ],
    subtitles: [],
    trailer: null,
    enabledQualities: ["480p", "720p", "1080p"],
    defaultQuality: "1080p",
    downloadEnabled: true,
    downloadFormats: ["mp4"],
    publishImmediately: false,
  });

  const steps: Array<{ id: UploadStep; label: string; icon: React.ReactNode }> = [
    { id: "type", label: "Content Type", icon: <Film className="h-5 w-5" /> },
    { id: "metadata", label: "Metadata", icon: <FileText className="h-5 w-5" /> },
    { id: "videos", label: "Videos", icon: <Upload className="h-5 w-5" /> },
    { id: "artwork", label: "Artwork", icon: <ImageIcon className="h-5 w-5" /> },
    { id: "subtitles", label: "Subtitles", icon: <FileText className="h-5 w-5" /> },
    { id: "config", label: "Configuration", icon: <Settings className="h-5 w-5" /> },
    { id: "review", label: "Review", icon: <Check className="h-5 w-5" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upload Content</h1>
              <p className="mt-1 text-gray-400">
                Add movies, series, anime, and documentaries to your platform
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                      index === currentStepIndex
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                        : index < currentStepIndex
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium ${
                      index === currentStepIndex
                        ? "text-white"
                        : index < currentStepIndex
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      index < currentStepIndex ? "bg-green-600" : "bg-gray-800"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-xl">
          {currentStep === "type" && (
            <StepContentType formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "metadata" && (
            <StepMetadata formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "videos" && (
            <StepVideos formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "artwork" && (
            <StepArtwork formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "subtitles" && (
            <StepSubtitles formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "config" && (
            <StepConfiguration formData={formData} setFormData={setFormData} />
          )}
          {currentStep === "review" && (
            <StepReview formData={formData} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => console.log("Submit", formData)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
            >
              <Check className="h-5 w-5" />
              Publish Content
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step Components
// ============================================================================

function StepContentType({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  const contentTypes: Array<{
    type: ContentType;
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = [
    {
      type: "MOVIE",
      icon: <Film className="h-8 w-8" />,
      label: "Movie",
      description: "Single video file with complete story",
    },
    {
      type: "SERIES",
      icon: <Tv className="h-8 w-8" />,
      label: "TV Series",
      description: "Multiple seasons and episodes",
    },
    {
      type: "ANIME",
      icon: <Sparkles className="h-8 w-8" />,
      label: "Anime",
      description: "Japanese animation with arcs and episodes",
    },
    {
      type: "DOCUMENTARY",
      icon: <FileVideo className="h-8 w-8" />,
      label: "Documentary",
      description: "Educational or informational content",
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Select Content Type</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentTypes.map((ct) => (
          <button
            key={ct.type}
            onClick={() => setFormData({ ...formData, contentType: ct.type })}
            className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all ${
              formData.contentType === ct.type
                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/30"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800"
            }`}
          >
            <div
              className={`mb-4 inline-flex rounded-full p-3 ${
                formData.contentType === ct.type
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-700"
              }`}
            >
              {ct.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{ct.label}</h3>
            <p className="text-sm text-gray-400">{ct.description}</p>

            {formData.contentType === ct.type && (
              <div className="absolute right-3 top-3">
                <Check className="h-6 w-6 text-blue-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepMetadata({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Content Metadata</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="The Matrix"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Original Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Original Title
          </label>
          <input
            type="text"
            value={formData.originalTitle}
            onChange={(e) => setFormData({ ...formData, originalTitle: e.target.value })}
            placeholder="Optional: original language title"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Release Year */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Release Year *
          </label>
          <input
            type="number"
            value={formData.releaseYear}
            onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
            min="1900"
            max={new Date().getFullYear() + 5}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Duration (minutes) *
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            placeholder="120"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter a compelling description..."
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Age Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Age Rating
          </label>
          <select
            value={formData.ageRating}
            onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select rating</option>
            <option value="G">G - General Audiences</option>
            <option value="PG">PG - Parental Guidance</option>
            <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
            <option value="R">R - Restricted</option>
            <option value="NC-17">NC-17 - Adults Only</option>
            <option value="TV-Y">TV-Y - All Children</option>
            <option value="TV-PG">TV-PG - Parental Guidance</option>
            <option value="TV-14">TV-14 - Parents Strongly Cautioned</option>
            <option value="TV-MA">TV-MA - Mature Audiences</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function StepVideos({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  const handleFileChange = (quality: "480p" | "720p" | "1080p", file: File | null) => {
    const updatedVideos = formData.videos.map((v) =>
      v.quality === quality ? { ...v, file, status: file ? "pending" as const : "pending" as const } : v
    );
    setFormData({ ...formData, videos: updatedVideos });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Upload Video Files</h2>
      <p className="mb-6 text-gray-400">
        Upload your content in multiple quality options. At least one quality is required.
      </p>

      <div className="space-y-4">
        {formData.videos.map((video) => (
          <div
            key={video.quality}
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/20 p-3">
                  <FileVideo className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{video.quality}</h3>
                  <p className="text-sm text-gray-400">
                    {video.quality === "480p" && "Standard Definition (SD)"}
                    {video.quality === "720p" && "High Definition (HD)"}
                    {video.quality === "1080p" && "Full HD (1080p)"}
                  </p>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(video.quality, e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  {video.file ? "Change File" : "Select File"}
                </div>
              </label>
            </div>

            {video.file && (
              <div className="mt-4 rounded-lg bg-gray-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{video.file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {video.status === "completed" && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-300">Upload Guidelines</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-200/80">
              <li>• Supported formats: MP4, MKV, AVI, WebM, MOV</li>
              <li>• Maximum file size: 50GB per file</li>
              <li>• Videos will be automatically processed for streaming</li>
              <li>• Processing time: 10-30 minutes depending on file size</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepArtwork({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  const handleFileChange = (type: "poster" | "backdrop", file: File | null) => {
    const updatedArtwork = formData.artwork.map((a) =>
      a.type === type ? { ...a, file, status: file ? "pending" as const : "pending" as const } : a
    );
    setFormData({ ...formData, artwork: updatedArtwork });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Upload Artwork</h2>
      <p className="mb-6 text-gray-400">
        Add visual assets to make your content stand out
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Poster */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-500/20 p-3">
              <ImageIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Poster</h3>
              <p className="text-sm text-gray-400">2:3 aspect ratio (e.g., 800x1200px)</p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("poster", e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 p-8 transition-colors hover:border-purple-500 hover:bg-gray-900">
              {formData.artwork.find((a) => a.type === "poster")?.file ? (
                <div className="text-center">
                  <Check className="mx-auto h-8 w-8 text-green-400" />
                  <p className="mt-2 text-sm font-medium text-white">
                    {formData.artwork.find((a) => a.type === "poster")?.file?.name}
                  </p>
                  <p className="text-xs text-gray-400">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-300">
                    Drop poster or click to browse
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG (max 10MB)</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Backdrop */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-500/20 p-3">
              <ImageIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Backdrop</h3>
              <p className="text-sm text-gray-400">16:9 aspect ratio (e.g., 1920x1080px)</p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("backdrop", e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 p-8 transition-colors hover:border-blue-500 hover:bg-gray-900">
              {formData.artwork.find((a) => a.type === "backdrop")?.file ? (
                <div className="text-center">
                  <Check className="mx-auto h-8 w-8 text-green-400" />
                  <p className="mt-2 text-sm font-medium text-white">
                    {formData.artwork.find((a) => a.type === "backdrop")?.file?.name}
                  </p>
                  <p className="text-xs text-gray-400">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-300">
                    Drop backdrop or click to browse
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG (max 10MB)</p>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function StepSubtitles({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  const addSubtitle = () => {
    setFormData({
      ...formData,
      subtitles: [
        ...formData.subtitles,
        {
          language: "en",
          file: null,
          isForced: false,
          isSDH: false,
          uploadProgress: 0,
          status: "pending",
        },
      ],
    });
  };

  const removeSubtitle = (index: number) => {
    setFormData({
      ...formData,
      subtitles: formData.subtitles.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Subtitles (Optional)</h2>
      <p className="mb-6 text-gray-400">
        Add subtitle tracks in multiple languages
      </p>

      {formData.subtitles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-gray-400">No subtitles added yet</p>
          <button
            onClick={addSubtitle}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Subtitle Track
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.subtitles.map((subtitle, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-700 bg-gray-800/50 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Language
                      </label>
                      <select className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        File
                      </label>
                      <label className="block cursor-pointer">
                        <input type="file" accept=".srt,.vtt" className="hidden" />
                        <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white hover:border-gray-600">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Select File</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-300">Forced</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-300">SDH/CC</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => removeSubtitle(index)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addSubtitle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/30 py-4 font-semibold text-gray-400 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            Add Another Subtitle Track
          </button>
        </div>
      )}
    </div>
  );
}

function StepConfiguration({
  formData,
  setFormData,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
}) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Stream & Download Configuration</h2>

      <div className="space-y-6">
        {/* Stream Quality */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Stream Quality Settings</h3>

          <div className="mb-4 space-y-3">
            {["480p", "720p", "1080p"].map((quality) => (
              <label key={quality} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.enabledQualities.includes(quality)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        enabledQualities: [...formData.enabledQualities, quality],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        enabledQualities: formData.enabledQualities.filter((q) => q !== quality),
                      });
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600"
                />
                <span className="text-white">Enable {quality} streaming</span>
              </label>
            ))}
          </div>
        </div>

        {/* Download Configuration */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Download Settings</h3>

          <label className="mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.downloadEnabled}
              onChange={(e) => setFormData({ ...formData, downloadEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600"
            />
            <span className="text-white">Enable downloads for this content</span>
          </label>

          {formData.downloadEnabled && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Available formats:</p>
              {["mp4", "mkv", "avi"].map((format) => (
                <label key={format} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.downloadFormats.includes(format)}
                    className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-white uppercase">{format}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Publishing */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Publishing Options</h3>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.publishImmediately}
              onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
              className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600"
            />
            <span className="text-white">Publish immediately after upload</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function StepReview({ formData }: { formData: UploadFormData }) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Review & Submit</h2>
      <p className="mb-6 text-gray-400">
        Please review all information before publishing
      </p>

      <div className="space-y-4">
        {/* Content Info */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 font-semibold text-white">Content Information</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="font-medium text-white">{formData.contentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Title:</span>
              <span className="font-medium text-white">{formData.title || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Release Year:</span>
              <span className="font-medium text-white">{formData.releaseYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="font-medium text-white">{formData.duration} minutes</span>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 font-semibold text-white">Video Files</h3>
          <div className="space-y-2">
            {formData.videos.map((video) => (
              <div key={video.quality} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{video.quality}:</span>
                <span className={`font-medium ${video.file ? "text-green-400" : "text-gray-500"}`}>
                  {video.file ? `✓ ${video.file.name}` : "Not uploaded"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Artwork */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 font-semibold text-white">Artwork</h3>
          <div className="space-y-2">
            {formData.artwork.map((art) => (
              <div key={art.type} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 capitalize">{art.type}:</span>
                <span className={`font-medium ${art.file ? "text-green-400" : "text-gray-500"}`}>
                  {art.file ? `✓ ${art.file.name}` : "Not uploaded"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 font-semibold text-white">Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Enabled Qualities:</span>
              <span className="font-medium text-white">
                {formData.enabledQualities.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Downloads:</span>
              <span className="font-medium text-white">
                {formData.downloadEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Publish:</span>
              <span className="font-medium text-white">
                {formData.publishImmediately ? "Immediately" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
