// Chart utilities for OceanEye

export interface ChartConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
  };
  theme: 'light' | 'dark';
}

export const defaultChartConfig: ChartConfig = {
  colors: {
    primary: '#1E90FF',
    secondary: '#4682B4',
    success: '#2E7D32',
    warning: '#F59E0B',
    danger: '#E53935'
  },
  theme: 'light'
};

export const getChartColors = (config: ChartConfig = defaultChartConfig) => [
  config.colors.primary,
  config.colors.secondary,
  config.colors.success,
  config.colors.warning,
  config.colors.danger
];

// Weather data for charts
export const mockWeatherData = [
  { name: 'Mon', temperature: 28, humidity: 65, windSpeed: 12 },
  { name: 'Tue', temperature: 30, humidity: 70, windSpeed: 15 },
  { name: 'Wed', temperature: 32, humidity: 75, windSpeed: 18 },
  { name: 'Thu', temperature: 29, humidity: 68, windSpeed: 14 },
  { name: 'Fri', temperature: 31, humidity: 72, windSpeed: 16 },
  { name: 'Sat', temperature: 33, humidity: 78, windSpeed: 20 },
  { name: 'Sun', temperature: 30, humidity: 70, windSpeed: 17 }
];

// Resource allocation data
export const mockResourceData = [
  { name: 'Food', available: 150, allocated: 75, remaining: 75 },
  { name: 'Water', available: 200, allocated: 120, remaining: 80 },
  { name: 'Medical', available: 50, allocated: 30, remaining: 20 },
  { name: 'Blankets', available: 100, allocated: 60, remaining: 40 },
  { name: 'Tents', available: 25, allocated: 15, remaining: 10 }
];

// Incident trends data
export const mockTrendsData = [
  { month: 'Jan', incidents: 12, severity: 2.5 },
  { month: 'Feb', incidents: 15, severity: 3.1 },
  { month: 'Mar', incidents: 18, severity: 2.8 },
  { month: 'Apr', incidents: 22, severity: 3.5 },
  { month: 'May', incidents: 25, severity: 3.2 },
  { month: 'Jun', incidents: 28, severity: 3.8 },
  { month: 'Jul', incidents: 32, severity: 4.1 },
  { month: 'Aug', incidents: 30, severity: 3.9 },
  { month: 'Sep', incidents: 26, severity: 3.6 },
  { month: 'Oct', incidents: 24, severity: 3.3 },
  { month: 'Nov', incidents: 20, severity: 3.0 },
  { month: 'Dec', incidents: 16, severity: 2.7 }
];

// Predictive analytics data
export const mockPredictiveData = [
  { date: '2024-01-01', actual: 15, predicted: 16, confidence: 0.85 },
  { date: '2024-01-02', actual: 18, predicted: 17, confidence: 0.82 },
  { date: '2024-01-03', actual: 22, predicted: 19, confidence: 0.78 },
  { date: '2024-01-04', actual: 25, predicted: 21, confidence: 0.75 },
  { date: '2024-01-05', actual: 28, predicted: 24, confidence: 0.72 },
  { date: '2024-01-06', actual: 32, predicted: 27, confidence: 0.68 },
  { date: '2024-01-07', actual: 30, predicted: 29, confidence: 0.65 },
  { date: '2024-01-08', actual: 26, predicted: 26, confidence: 0.62 },
  { date: '2024-01-09', actual: 24, predicted: 23, confidence: 0.58 },
  { date: '2024-01-10', actual: 20, predicted: 20, confidence: 0.55 }
];

// Common chart options
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#003366',
      bodyColor: '#003366',
      borderColor: '#1E90FF',
      borderWidth: 1,
    }
  }
};

// Area chart options for weather
export const weatherChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    }
  }
};

// Bar chart options for resources
export const resourceChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      stacked: true,
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    }
  }
};

// Line chart options for trends
export const trendsChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(30, 144, 255, 0.1)'
      }
    }
  }
};

export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey]
  }));
};
