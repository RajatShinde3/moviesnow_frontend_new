/**
 * =============================================================================
 * Performance Testing Service
 * =============================================================================
 * API service for running and managing performance regression tests
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TestCase {
  test_id: string;
  name: string;
  description: string;
  test_type: string;
  target_metric: string;
  expected_threshold: number;
  critical_threshold: number;
  enabled: boolean;
}

export interface TestExecution {
  execution_id: string;
  test_case_id: string;
  test_name: string;
  result: 'passed' | 'warning' | 'failed';
  measured_value: number;
  expected_threshold: number;
  critical_threshold: number;
  duration: number;
  timestamp: string;
  details: Record<string, any>;
}

export interface TestSuiteResult {
  suite_execution_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_tests: number;
  passed: number;
  warnings: number;
  failed: number;
  success_rate: number;
  executions: TestExecution[];
}

export interface PerformanceHistory {
  test_case_id: string;
  timestamp: string;
  value: number;
  result: string;
  details?: Record<string, any>;
}

export interface RegressionAnalysis {
  has_regression: boolean;
  current_value: number;
  baseline_value?: number;
  deviation_percent: number;
  threshold: number;
  analysis: string;
}

export interface PerformanceReport {
  report_generated: string;
  analysis_period_days: number;
  health_score: number;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  test_summary: {
    total_tests: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  performance_trends?: {
    improving: number;
    stable: number;
    degrading: number;
  };
  recommendations?: string[];
}

export interface PerformanceDashboard {
  testing_overview: {
    total_test_cases: number;
    enabled_test_cases: number;
    test_coverage: number;
  };
  recent_performance: PerformanceReport;
  system_health: any;
  testing_status: {
    last_suite_run: string;
    health_score: number;
    health_status: string;
  };
}

export interface TestTrend {
  test_name: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  std_dev: number;
  trend: 'improving' | 'stable' | 'degrading';
  data_points: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Testing Service
// ─────────────────────────────────────────────────────────────────────────────

export const performanceTestingService = {
  /**
   * Get all available test cases
   */
  async getTestCases(): Promise<TestCase[]> {
    const response = await apiClient.get('/performance-testing/test-cases');
    return response.data;
  },

  /**
   * Run a single performance test
   */
  async runSingleTest(
    testId: string,
    storeAsBaseline: boolean = false
  ): Promise<{
    execution: TestExecution;
    baseline_stored: boolean;
    test_summary: any;
  }> {
    const response = await apiClient.post(`/performance-testing/run-test/${testId}`, null, {
      params: { store_as_baseline: storeAsBaseline },
    });
    return response.data;
  },

  /**
   * Run performance test suite
   */
  async runTestSuite(params: {
    test_ids?: string[];
    include_regression_check?: boolean;
    store_baseline?: boolean;
  }): Promise<TestSuiteResult> {
    const response = await apiClient.post('/performance-testing/run-suite', {
      test_ids: params.test_ids || null,
      include_regression_check: params.include_regression_check ?? true,
      store_baseline: params.store_baseline ?? false,
    });
    return response.data;
  },

  /**
   * Establish performance baseline
   */
  async establishBaseline(params: {
    test_case_id: string;
    description: string;
    force_update?: boolean;
  }): Promise<{
    baseline_established: boolean;
    test_case_id: string;
    baseline_value: number;
    description: string;
    established_at: string;
  }> {
    const response = await apiClient.post('/performance-testing/establish-baseline', {
      test_case_id: params.test_case_id,
      description: params.description,
      force_update: params.force_update ?? false,
    });
    return response.data;
  },

  /**
   * Get test execution history
   */
  async getTestHistory(testCaseId: string, limit: number = 50): Promise<PerformanceHistory[]> {
    const response = await apiClient.get(`/performance-testing/history/${testCaseId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Check for performance regression
   */
  async checkRegression(
    testCaseId: string,
    threshold: number = 0.2
  ): Promise<{
    test_case_id: string;
    current_execution: TestExecution;
    regression_analysis: RegressionAnalysis;
  }> {
    const response = await apiClient.get(`/performance-testing/regression-check/${testCaseId}`, {
      params: { threshold },
    });
    return response.data;
  },

  /**
   * Generate performance report
   */
  async generateReport(params: {
    days?: number;
    include_trends?: boolean;
    include_recommendations?: boolean;
  }): Promise<PerformanceReport> {
    const response = await apiClient.post('/performance-testing/generate-report', {
      days: params.days ?? 7,
      include_trends: params.include_trends ?? true,
      include_recommendations: params.include_recommendations ?? true,
    });
    return response.data;
  },

  /**
   * Get performance testing dashboard
   */
  async getDashboard(): Promise<PerformanceDashboard> {
    const response = await apiClient.get('/performance-testing/dashboard');
    return response.data;
  },

  /**
   * Run automated test suite (for CI/CD)
   */
  async runAutomatedSuite(): Promise<{
    automated_run_completed: boolean;
    deployment_safe: boolean;
    suite_summary: {
      total_tests: number;
      passed: number;
      failed: number;
      success_rate: number;
    };
    critical_issues: TestExecution[];
  }> {
    const response = await apiClient.post('/performance-testing/automated-suite-run');
    return response.data;
  },

  /**
   * Get test execution trends
   */
  async getExecutionTrends(
    days: number = 30
  ): Promise<{
    analysis_period_days: number;
    test_trends: Record<string, TestTrend>;
    trend_summary: {
      improving: number;
      stable: number;
      degrading: number;
    };
  }> {
    const response = await apiClient.get('/performance-testing/metrics/test-execution-trends', {
      params: { days },
    });
    return response.data;
  },
};
