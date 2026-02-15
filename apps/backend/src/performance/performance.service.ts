import { Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics

  /**
   * Track operation performance
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        metadata,
      });

      if (duration > 1000) {
        this.logger.warn(
          `Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordMetric({
        operation: `${operation} (failed)`,
        duration,
        timestamp: new Date(),
        metadata: { ...metadata, error: error.message },
      });

      throw error;
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get performance statistics
   */
  getStatistics(operation?: string): {
    operation: string;
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    p99Duration: number;
  }[] {
    const groupedMetrics = this.groupMetricsByOperation();
    
    return Object.entries(groupedMetrics)
      .filter(([op]) => !operation || op === operation)
      .map(([op, metrics]) => this.calculateStats(op, metrics));
  }

  /**
   * Get recent slow operations
   */
  getSlowOperations(threshold: number = 1000, limit: number = 20): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsInRange(startTime: Date, endTime: Date): PerformanceMetric[] {
    return this.metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.logger.log('Performance metrics cleared');
  }

  /**
   * Group metrics by operation
   */
  private groupMetricsByOperation(): Record<string, PerformanceMetric[]> {
    return this.metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = [];
      }
      acc[metric.operation].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);
  }

  /**
   * Calculate statistics for an operation
   */
  private calculateStats(
    operation: string,
    metrics: PerformanceMetric[]
  ): {
    operation: string;
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    
    return {
      operation,
      count,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / count,
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      p95Duration: this.percentile(durations, 0.95),
      p99Duration: this.percentile(durations, 0.99),
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }

  /**
   * Get uptime
   */
  getUptime() {
    return {
      seconds: Math.floor(process.uptime()),
      formatted: this.formatUptime(process.uptime()),
    };
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}
