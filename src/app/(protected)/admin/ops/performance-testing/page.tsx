"use client";

/**
 * =============================================================================
 * Performance Testing Suite Dashboard
 * =============================================================================
 * Automated performance regression testing with baseline comparison
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Play,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  LineChart,
  PlayCircle,
  Target,
  Activity,
  Database,
  Gauge,
  RefreshCw,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { performanceTestingService } from "@/lib/api/services/performance-testing";
import type {
  TestCase,
  TestExecution,
  TestSuiteResult,
} from "@/lib/api/services/performance-testing";

export default function PerformanceTestingPage() {
  const queryClient = useQueryClient();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [reportDays, setReportDays] = useState(7);

  // Queries
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["performance-testing", "dashboard"],
    queryFn: () => performanceTestingService.getDashboard(),
  });

  const { data: testCases } = useQuery({
    queryKey: ["performance-testing", "test-cases"],
    queryFn: () => performanceTestingService.getTestCases(),
  });

  const { data: trends } = useQuery({
    queryKey: ["performance-testing", "trends", trendDays],
    queryFn: () => performanceTestingService.getExecutionTrends(trendDays),
  });

  const { data: historyData } = useQuery({
    queryKey: ["performance-testing", "history", showHistory],
    queryFn: () =>
      showHistory ? performanceTestingService.getTestHistory(showHistory, 50) : null,
    enabled: !!showHistory,
  });

  // Mutations
  const runSingleTestMutation = useMutation({
    mutationFn: (testId: string) => performanceTestingService.runSingleTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-testing"] });
    },
  });

  const runSuiteMutation = useMutation({
    mutationFn: () =>
      performanceTestingService.runTestSuite({
        test_ids: selectedTests.length > 0 ? selectedTests : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-testing"] });
      setSelectedTests([]);
    },
  });

  const establishBaselineMutation = useMutation({
    mutationFn: (params: { test_case_id: string; description: string }) =>
      performanceTestingService.establishBaseline(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-testing"] });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: () =>
      performanceTestingService.generateReport({
        days: reportDays,
        include_trends: true,
        include_recommendations: true,
      }),
  });

  const getResultColor = (result: string) => {
    switch (result) {
      case "passed":
        return "text-emerald-400";
      case "warning":
        return "text-amber-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "passed":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return TrendingDown;
      case "degrading":
        return TrendingUp;
      case "stable":
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-emerald-400";
      case "degrading":
        return "text-red-400";
      case "stable":
      default:
        return "text-blue-400";
    }
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300">Loading performance tests...</p>
        </motion.div>
      </div>
    );
  }

  const testingOverview = dashboard?.testing_overview;
  const testingStatus = dashboard?.testing_status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Zap className="w-10 h-10 text-purple-400" />
              Performance Testing Suite
            </h1>
            <p className="text-slate-400 mt-2">
              Automated regression detection and performance baseline management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runSuiteMutation.mutate()}
              disabled={runSuiteMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-lg"
            >
              <PlayCircle className="w-5 h-5 inline mr-2" />
              Run {selectedTests.length > 0 ? "Selected" : "All"} Tests
            </button>
          </div>
        </motion.div>

        {/* Testing Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Target className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {testingOverview?.total_test_cases || 0}
              </p>
              <p className="text-slate-400 text-sm">Total Test Cases</p>
              <p className="text-xs text-slate-500 mt-1">
                {testingOverview?.enabled_test_cases || 0} enabled
              </p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Gauge className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {((testingOverview?.test_coverage || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-slate-400 text-sm">Test Coverage</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Activity className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {testingStatus?.health_score || 0}
              </p>
              <p className="text-slate-400 text-sm">Health Score</p>
              <p
                className={`text-xs mt-1 font-medium capitalize ${
                  testingStatus?.health_status === "excellent"
                    ? "text-emerald-400"
                    : testingStatus?.health_status === "good"
                    ? "text-blue-400"
                    : testingStatus?.health_status === "fair"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {testingStatus?.health_status || "Unknown"}
              </p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Clock className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-sm font-medium text-white">
                {testingStatus?.last_suite_run
                  ? new Date(testingStatus.last_suite_run).toLocaleDateString()
                  : "Never"}
              </p>
              <p className="text-slate-400 text-sm">Last Suite Run</p>
            </div>
          </div>
        </motion.div>

        {/* Test Suite Results (if just ran) */}
        {runSuiteMutation.data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Test Suite Results
              </h3>
              <span className="text-sm text-slate-400">
                Execution ID: {runSuiteMutation.data.suite_execution_id}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">
                  {runSuiteMutation.data.total_tests}
                </p>
                <p className="text-slate-400 text-xs">Total Tests</p>
              </div>
              <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-emerald-300">
                  {runSuiteMutation.data.passed}
                </p>
                <p className="text-emerald-400 text-xs">Passed</p>
              </div>
              <div className="backdrop-blur-sm bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-amber-300">
                  {runSuiteMutation.data.warnings}
                </p>
                <p className="text-amber-400 text-xs">Warnings</p>
              </div>
              <div className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-300">
                  {runSuiteMutation.data.failed}
                </p>
                <p className="text-red-400 text-xs">Failed</p>
              </div>
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">
                  {(runSuiteMutation.data.success_rate * 100).toFixed(0)}%
                </p>
                <p className="text-slate-400 text-xs">Success Rate</p>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {runSuiteMutation.data.executions.map((execution: TestExecution) => {
                const ResultIcon = getResultIcon(execution.result);
                return (
                  <div
                    key={execution.execution_id}
                    className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <ResultIcon
                        className={`w-5 h-5 ${getResultColor(execution.result)}`}
                      />
                      <div>
                        <p className="font-medium text-white">{execution.test_name}</p>
                        <p className="text-xs text-slate-400">
                          {execution.measured_value.toFixed(2)}ms (threshold:{" "}
                          {execution.expected_threshold}ms)
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getResultColor(
                        execution.result
                      )} bg-current/20`}
                    >
                      {execution.result.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Test Cases List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-400" />
                Test Cases
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {selectedTests.length} selected
                </span>
                {selectedTests.length > 0 && (
                  <button
                    onClick={() => setSelectedTests([])}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {testCases?.map((test) => (
              <motion.div
                key={test.test_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`backdrop-blur-sm border rounded-xl p-4 transition-all cursor-pointer ${
                  selectedTests.includes(test.test_id)
                    ? "bg-purple-500/20 border-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => toggleTestSelection(test.test_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{test.name}</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {test.test_type}
                      </span>
                      {!test.enabled && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{test.description}</p>
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <span>
                        Target: <span className="text-slate-300">{test.target_metric}</span>
                      </span>
                      <span>
                        Expected: <span className="text-slate-300">{test.expected_threshold}</span>
                      </span>
                      <span>
                        Critical: <span className="text-red-400">{test.critical_threshold}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHistory(test.test_id);
                      }}
                      className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all"
                      title="View history"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runSingleTestMutation.mutate(test.test_id);
                      }}
                      disabled={runSingleTestMutation.isPending}
                      className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                      title="Run test"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Trends */}
        {trends && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <LineChart className="w-6 h-6 text-purple-400" />
                Performance Trends
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={trendDays}
                  onChange={(e) => setTrendDays(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                <TrendingDown className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {trends.trend_summary.improving}
                </p>
                <p className="text-emerald-400 text-sm">Improving</p>
              </div>
              <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <Minus className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">{trends.trend_summary.stable}</p>
                <p className="text-blue-400 text-sm">Stable</p>
              </div>
              <div className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <TrendingUp className="w-6 h-6 text-red-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {trends.trend_summary.degrading}
                </p>
                <p className="text-red-400 text-sm">Degrading</p>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(trends.test_trends).map(([testId, trend]: [string, any]) => {
                const TrendIcon = getTrendIcon(trend.trend);
                return (
                  <div
                    key={testId}
                    className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendIcon className={`w-5 h-5 ${getTrendColor(trend.trend)}`} />
                        <div>
                          <p className="font-medium text-white">{trend.test_name}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                            <span>Avg: {trend.avg_value.toFixed(2)}ms</span>
                            <span>Min: {trend.min_value.toFixed(2)}ms</span>
                            <span>Max: {trend.max_value.toFixed(2)}ms</span>
                            <span>StdDev: {trend.std_dev.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTrendColor(
                          trend.trend
                        )} bg-current/20`}
                      >
                        {trend.trend}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Test History Modal */}
        {showHistory && historyData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setShowHistory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="backdrop-blur-sm bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Test Execution History</h3>
                <button
                  onClick={() => setShowHistory(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2">
                {historyData.map((item, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{item.value.toFixed(2)}ms</p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getResultColor(
                        item.result
                      )} bg-current/20`}
                    >
                      {item.result}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
