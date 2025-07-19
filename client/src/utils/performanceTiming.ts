
export interface ServerTimingEntry {
  name: string;
  duration: number;
  description: string;
}

export class PerformanceTimingMonitor {
  private static instance: PerformanceTimingMonitor;

  static getInstance(): PerformanceTimingMonitor {
    if (!PerformanceTimingMonitor.instance) {
      PerformanceTimingMonitor.instance = new PerformanceTimingMonitor();
    }
    return PerformanceTimingMonitor.instance;
  }

  /**
   * Extract Server-Timing data from Performance API
   */
  getServerTimingData(url?: string): ServerTimingEntry[] {
    if (!window.performance || !window.performance.getEntriesByType) {
      return [];
    }

    const entries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    let targetEntry: PerformanceResourceTiming | PerformanceNavigationTiming | null = null;

    if (url) {
      targetEntry = resourceEntries.find(entry => entry.name.includes(url)) || null;
    } else {
      targetEntry = entries[0] || null;
    }

    if (!targetEntry || !('serverTiming' in targetEntry)) {
      return [];
    }

    return (targetEntry as any).serverTiming?.map((timing: any) => ({
      name: timing.name,
      duration: timing.duration,
      description: timing.description || ''
    })) || [];
  }

  /**
   * Log server timing metrics to console
   */
  logServerTiming(url?: string): void {
    const timings = this.getServerTimingData(url);
    
    if (timings.length === 0) {
      console.log('🕐 No server timing data available');
      return;
    }

    console.group('🕐 Server Timing Metrics');
    timings.forEach(timing => {
      console.log(`${timing.name}: ${timing.duration.toFixed(2)}ms ${timing.description ? `(${timing.description})` : ''}`);
    });
    console.groupEnd();
  }

  /**
   * Monitor API calls and log their server timing
   */
  monitorApiCalls(): void {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.entryType === 'resource' && 
            (entry.name.includes('/api/') || entry.name.includes('/midi/'))) {
          
          setTimeout(() => {
            this.logServerTiming(entry.name);
          }, 100); // Small delay to ensure serverTiming is available
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Get performance summary for API calls
   */
  getApiPerformanceSummary(): Record<string, { calls: number; avgDuration: number; totalDuration: number }> {
    const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const apiEntries = resourceEntries.filter(entry => 
      entry.name.includes('/api/') || entry.name.includes('/midi/')
    );

    const summary: Record<string, { calls: number; avgDuration: number; totalDuration: number }> = {};

    apiEntries.forEach(entry => {
      const url = new URL(entry.name);
      const endpoint = url.pathname;

      if (!summary[endpoint]) {
        summary[endpoint] = { calls: 0, avgDuration: 0, totalDuration: 0 };
      }

      const duration = entry.responseEnd - entry.requestStart;
      summary[endpoint].calls++;
      summary[endpoint].totalDuration += duration;
      summary[endpoint].avgDuration = summary[endpoint].totalDuration / summary[endpoint].calls;
    });

    return summary;
  }
}

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  const monitor = PerformanceTimingMonitor.getInstance();
  monitor.monitorApiCalls();
  
  // Add global helper
  (window as any).performanceTiming = monitor;
}

export default PerformanceTimingMonitor;
