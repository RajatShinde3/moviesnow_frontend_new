// types/analytics.ts
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface PlatformOverview {
  totalUsers: number;
  userGrowth: number;
  activeSubscriptions: number;
  subscriptionGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  concurrentStreams: number;
  totalViews: number;
  totalDownloads: number;
  totalWatchTimeHours: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  userGrowthData: Array<{ date: string; users: number }>;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'signup' | 'subscription' | 'upload' | 'stream' | 'download';
  user: string;
  description: string;
  timestamp: string;
}

export interface ContentPerformance {
  topContent: Array<{
    id: string;
    title: string;
    type: 'movie' | 'series' | 'anime' | 'documentary';
    views: number;
    completionRate: number;
    averageWatchTime: number;
    thumbnail: string;
  }>;
  qualityDistribution: {
    '480p': number;
    '720p': number;
    '1080p': number;
  };
  contentTypeBreakdown: {
    movies: number;
    series: number;
    anime: number;
    documentaries: number;
  };
}

export interface RevenueAnalytics {
  mrr: number;
  arr: number;
  churnRate: number;
  ltv: number;
  revenueTimeline: Array<{ date: string; amount: number }>;
  planDistribution: {
    monthly: number;
    yearly: number;
  };
  recentSubscriptions: Array<{
    id: string;
    user: string;
    plan: string;
    amount: number;
    date: string;
  }>;
  trialConversionRate: number;
}

export interface CostAnalytics {
  totalCost: number;
  costBreakdown: {
    s3: number;
    cloudfront: number;
    ses: number;
    ec2: number;
    rds: number;
  };
  costTrend: Array<{ date: string; cost: number }>;
  recommendations: string[];
}

export interface UserAnalytics {
  demographics: {
    premium: number;
    free: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
    tv: number;
  };
  topRegions: Array<{ region: string; users: number; country: string }>;
  retentionRate: number;
}

export interface MetricCardData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}
