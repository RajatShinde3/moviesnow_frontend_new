// app/(protected)/admin/titles/[id]/scene-markers/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SceneMarkerEditor } from '@/components/admin/SceneMarkerEditor';
import { ArrowLeft, Film, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SceneMarkerEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const titleId = params.id as string;
  const episodeId = searchParams.get('episode');

  // Fetch title details
  const { data: title, isLoading: titleLoading, error: titleError } = useQuery({
    queryKey: ['title', titleId],
    queryFn: async () => {
      const response = await api.get(`/admin/titles/${titleId}`);
      return response.json();
    }
  });

  // Fetch episode if applicable
  const { data: episode, isLoading: episodeLoading } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: async () => {
      if (!episodeId) return null;
      const response = await api.get(`/admin/episodes/${episodeId}`);
      return response.json();
    },
    enabled: !!episodeId
  });

  const isLoading = titleLoading || (episodeId && episodeLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          className="relative w-24 h-24 mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-accent-primary/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-primary border-r-accent-primary" />
        </motion.div>
        <p className="text-white/60 text-xl">Loading scene marker editor...</p>
      </div>
    );
  }

  if (titleError || !title) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Title Not Found</h2>
          <p className="text-white/60 mb-6">The requested title could not be found or you don't have permission to access it.</p>
          <Link
            href="/admin/titles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary rounded-xl hover:brightness-110 transition-all font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Titles
          </Link>
        </motion.div>
      </div>
    );
  }

  const videoUrl = episodeId ? episode?.streamVariants?.[0]?.url : title?.streamVariants?.[0]?.url;
  const isSeries = title?.titleType === 'series' || title?.titleType === 'anime';

  return (
    <div className="container mx-auto p-8 max-w-[1920px]">
      {/* Breadcrumb & Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href={`/admin/titles/${titleId}`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Title Management
        </Link>

        {/* Title Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-elevated via-background-hover to-background-elevated p-8 border border-white/10 shadow-2xl">
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, rgba(229, 9, 20, 0.3), transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(229, 9, 20, 0.3), transparent 50%)',
                'radial-gradient(circle at 0% 0%, rgba(229, 9, 20, 0.3), transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative flex items-start gap-6">
            {/* Icon */}
            <motion.div
              className="p-4 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl border border-accent-primary/30 shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Film className="w-10 h-10 text-accent-primary" />
            </motion.div>

            {/* Content */}
            <div className="flex-grow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white/95 to-white/85 bg-clip-text text-transparent">
                    {title?.title}
                  </h1>
                  {episode && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white/70 mt-2 text-lg flex items-center gap-2"
                    >
                      <span className="px-3 py-1 bg-accent-primary/20 rounded-lg text-accent-primary font-semibold text-sm">
                        S{episode.seasonNumber}E{episode.episodeNumber}
                      </span>
                      <span>{episode.title}</span>
                    </motion.p>
                  )}
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap gap-3">
                  <motion.div
                    className="px-4 py-2 bg-background-elevated rounded-xl border border-white/10"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <span className="text-sm text-white/50">Type</span>
                    <p className="font-semibold capitalize text-white">{title?.titleType}</p>
                  </motion.div>

                  {isSeries && (
                    <motion.div
                      className="px-4 py-2 bg-background-elevated rounded-xl border border-white/10"
                      whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <span className="text-sm text-white/50">Episodes</span>
                      <p className="font-semibold text-white">{title?.totalEpisodes || 0}</p>
                    </motion.div>
                  )}

                  {title?.rating && (
                    <motion.div
                      className="px-4 py-2 bg-background-elevated rounded-xl border border-white/10"
                      whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <span className="text-sm text-white/50">Rating</span>
                      <p className="font-semibold text-yellow-400 flex items-center gap-1">
                        ★ {title.rating.toFixed(1)}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scene Marker Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {videoUrl ? (
          <SceneMarkerEditor
            titleId={titleId}
            episodeId={episodeId || undefined}
            videoUrl={videoUrl}
            isSeries={isSeries}
            totalEpisodes={title?.totalEpisodes}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-12 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-3">No Video Available</h3>
            <p className="text-white/60 text-lg mb-6">
              No video stream is available for this {episodeId ? 'episode' : 'title'}.
              Please upload a video file first before setting scene markers.
            </p>
            <Link
              href={`/admin/titles/${titleId}/upload`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary rounded-xl hover:brightness-110 transition-all font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Upload Video
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-blue-300 mb-2">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use the <strong>AI Detect</strong> feature to automatically find intro/outro segments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Click on timeline markers to jump to that timestamp instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>For series, use <strong>Batch Apply</strong> to copy markers to multiple episodes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Markers marked as "Auto-Skip" will be automatically skipped during playback</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
