"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  Globe,
  Calendar,
  X,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { ContentCertification } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data/DataTable";
import { ConfirmDialog } from "@/components/ui";

const RATING_SYSTEMS = [
  { value: "MPAA", label: "MPAA (USA)", region: "US" },
  { value: "BBFC", label: "BBFC (UK)", region: "GB" },
  { value: "FSK", label: "FSK (Germany)", region: "DE" },
  { value: "EIRIN", label: "EIRIN (Japan)", region: "JP" },
  { value: "KMRB", label: "KMRB (South Korea)", region: "KR" },
  { value: "OFLC", label: "OFLC (Australia)", region: "AU" },
  { value: "CBFC", label: "CBFC (India)", region: "IN" },
  { value: "DJCTQ", label: "DJCTQ (Brazil)", region: "BR" },
];

const MPAA_RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];
const BBFC_RATINGS = ["U", "PG", "12", "12A", "15", "18", "R18"];
const FSK_RATINGS = ["0", "6", "12", "16", "18"];

const DESCRIPTORS = [
  "Violence",
  "Strong Language",
  "Sexual Content",
  "Drug Use",
  "Nudity",
  "Gore",
  "Frightening Scenes",
  "Tobacco Use",
  "Alcohol Use",
  "Gambling",
];

export default function ContentCertificationPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<ContentCertification | null>(null);
  const [deleteCertId, setDeleteCertId] = useState<string | null>(null);
  const [selectedTitleId, setSelectedTitleId] = useState("");

  // Form state
  const [ratingSystem, setRatingSystem] = useState("MPAA");
  const [rating, setRating] = useState("");
  const [region, setRegion] = useState("US");
  const [certificationBody, setCertificationBody] = useState("");
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>([]);
  const [certifiedDate, setCertifiedDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");

  // Fetch certifications
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["admin", "compliance", "certifications"],
    queryFn: () => api.compliance.listCertifications(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      titleId: string;
      certification: {
        rating: string;
        rating_system: string;
        region: string;
        certification_body: string;
        descriptors?: string[];
        certified_date?: string;
        certificate_url?: string;
        age_restriction?: number;
      };
    }) => api.compliance.createCertification(data.titleId, data.certification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "certifications"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      titleId: string;
      certId: string;
      updates: {
        rating?: string;
        descriptors?: string[];
        certified_date?: string;
        certificate_url?: string;
        age_restriction?: number;
      };
    }) => api.compliance.updateCertification(data.titleId, data.certId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "certifications"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (data: { titleId: string; certId: string }) =>
      api.compliance.deleteCertification(data.titleId, data.certId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "certifications"] });
      setDeleteCertId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingCert(null);
    setSelectedTitleId("");
    setRatingSystem("MPAA");
    setRating("");
    setRegion("US");
    setCertificationBody("");
    setSelectedDescriptors([]);
    setCertifiedDate("");
    setCertificateUrl("");
    setAgeRestriction("");
  };

  const openEditModal = (cert: ContentCertification) => {
    setEditingCert(cert);
    setSelectedTitleId(cert.title_id);
    setRatingSystem(cert.rating_system);
    setRating(cert.rating);
    setRegion(cert.region);
    setCertificationBody(cert.certification_body);
    setSelectedDescriptors(cert.descriptors || []);
    setCertifiedDate(cert.certified_date || "");
    setCertificateUrl(cert.certificate_url || "");
    setAgeRestriction(cert.age_restriction?.toString() || "");
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const certData = {
      rating,
      rating_system: ratingSystem,
      region,
      certification_body: certificationBody,
      descriptors: selectedDescriptors.length > 0 ? selectedDescriptors : undefined,
      certified_date: certifiedDate || undefined,
      certificate_url: certificateUrl || undefined,
      age_restriction: ageRestriction ? parseInt(ageRestriction) : undefined,
    };

    if (editingCert) {
      updateMutation.mutate({
        titleId: selectedTitleId,
        certId: editingCert.id,
        updates: certData,
      });
    } else {
      createMutation.mutate({
        titleId: selectedTitleId,
        certification: certData,
      });
    }
  };

  const toggleDescriptor = (descriptor: string) => {
    setSelectedDescriptors((prev) =>
      prev.includes(descriptor)
        ? prev.filter((d) => d !== descriptor)
        : [...prev, descriptor]
    );
  };

  // Get available ratings based on system
  const getAvailableRatings = () => {
    switch (ratingSystem) {
      case "MPAA":
        return MPAA_RATINGS;
      case "BBFC":
        return BBFC_RATINGS;
      case "FSK":
        return FSK_RATINGS;
      default:
        return [];
    }
  };

  // DataTable columns
  const columns = [
    {
      header: "Title",
      accessor: "title_id" as keyof ContentCertification,
      cell: (value: any) => (
        <span className="font-mono text-xs text-slate-400">
          {value.toString().slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Rating",
      accessor: "rating" as keyof ContentCertification,
      cell: (value: any, row: ContentCertification) => (
        <div>
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold rounded">
            {value}
          </span>
          <div className="text-xs text-slate-400 mt-1">{row.rating_system}</div>
        </div>
      ),
    },
    {
      header: "Region",
      accessor: "region" as keyof ContentCertification,
      cell: (value: any) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-white font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: "Age Restriction",
      accessor: "age_restriction" as keyof ContentCertification,
      cell: (value: any) => (
        <span className="text-white">
          {value ? `${value}+` : "No restriction"}
        </span>
      ),
    },
    {
      header: "Certified",
      accessor: "certified_date" as keyof ContentCertification,
      cell: (value: any) => (
        <span className="text-sm text-slate-300">
          {value ? new Date(value).toLocaleDateString() : "Not certified"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof ContentCertification,
      cell: (value: any, row: ContentCertification) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteCertId(value.toString())}
            className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="h-96 bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-400" />
              Content Certification Manager
            </h1>
            <p className="text-slate-400">
              Manage age ratings and content certifications by region
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Certification
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">
                {certifications.length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Total Certifications</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {new Set(certifications.map((c: ContentCertification) => c.region)).size}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Regions Covered</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {certifications.filter((c: ContentCertification) => c.certified_date).length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Officially Certified</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {new Set(certifications.map((c: ContentCertification) => c.rating_system)).size}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Rating Systems</p>
          </div>
        </motion.div>

        {/* Certifications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
        >
          <DataTable
            data={certifications}
            columns={columns}
            searchPlaceholder="Search by title, rating, region..."
            emptyMessage="No certifications found"
          />
        </motion.div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingCert ? "Edit" : "Add"} Certification
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Title ID */}
                  {!editingCert && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title ID *
                      </label>
                      <input
                        type="text"
                        value={selectedTitleId}
                        onChange={(e) => setSelectedTitleId(e.target.value)}
                        required
                        placeholder="Enter title UUID"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Rating System */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Rating System *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {RATING_SYSTEMS.map((system) => (
                        <button
                          key={system.value}
                          type="button"
                          onClick={() => {
                            setRatingSystem(system.value);
                            setRegion(system.region);
                            setRating("");
                          }}
                          className={`p-3 rounded-lg border transition-all ${
                            ratingSystem === system.value
                              ? "border-amber-500 bg-amber-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-sm font-medium text-white text-center">
                            {system.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Certification Body */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Rating *
                      </label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Select rating</option>
                        {getAvailableRatings().map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Certification Body *
                      </label>
                      <input
                        type="text"
                        value={certificationBody}
                        onChange={(e) => setCertificationBody(e.target.value)}
                        required
                        placeholder="e.g., MPAA, BBFC"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Region & Age Restriction */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Region *
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                        placeholder="e.g., US, GB, JP"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Age Restriction (Optional)
                      </label>
                      <input
                        type="number"
                        value={ageRestriction}
                        onChange={(e) => setAgeRestriction(e.target.value)}
                        min="0"
                        max="21"
                        placeholder="e.g., 13, 17, 18"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Content Descriptors */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Content Descriptors (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {DESCRIPTORS.map((descriptor) => (
                        <button
                          key={descriptor}
                          type="button"
                          onClick={() => toggleDescriptor(descriptor)}
                          className={`p-3 rounded-lg border text-sm transition-all ${
                            selectedDescriptors.includes(descriptor)
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          {descriptor}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Certified Date & Certificate URL */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Certified Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={certifiedDate}
                        onChange={(e) => setCertifiedDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Certificate URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={certificateUrl}
                        onChange={(e) => setCertificateUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingCert
                          ? "Update Certification"
                          : "Add Certification"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteCertId !== null}
          onClose={() => setDeleteCertId(null)}
          onConfirm={() => {
            const cert = certifications.find((c: any) => c.id === deleteCertId);
            if (cert && deleteCertId) {
              deleteMutation.mutate({
                titleId: cert.title_id,
                certId: deleteCertId,
              });
            }
          }}
          title="Delete Certification"
          message="Are you sure you want to delete this certification? This action cannot be undone."
          confirmText="Delete Certification"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
