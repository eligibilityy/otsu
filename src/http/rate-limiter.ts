export interface RateLimitOptions {
  /** Documented osu! limit is 60/min. Default: 60 */
  requestsPerMinute?: number;
  /** Minimum gap between requests. Default: 1000ms (1 req/s, conservative). */
  minIntervalMs?: number;
  onThrottled?: (waitMs: number) => void;
}

export class RateLimiter {
  private readonly minIntervalMs: number;
  private readonly onThrottled?: (waitMs: number) => void;
  private lastRequestAt = 0;
  private queue: Promise<void> = Promise.resolve();

  constructor(options: RateLimitOptions = {}) {
    const rpm = options.requestsPerMinute ?? 60;
    const derivedInterval = Math.ceil(60_000 / rpm);
    this.minIntervalMs = options.minIntervalMs ?? derivedInterval;
    if (options.onThrottled !== undefined) {
      this.onThrottled = options.onThrottled;
    }
  }

  async acquire(): Promise<void> {
    this.queue = this.queue.then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestAt;
      const waitMs = Math.max(0, this.minIntervalMs - elapsed);

      if (waitMs > 0) {
        this.onThrottled?.(waitMs);
        await sleep(waitMs);
      }

      this.lastRequestAt = Date.now();
    });

    await this.queue;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
