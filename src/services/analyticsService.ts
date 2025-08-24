type AnalyticsPayload = Record<string, unknown> & { timestamp?: number };

class AnalyticsService {
  private endpoint: string | undefined = process.env.REACT_APP_ANALYTICS_ENDPOINT;

  trackEvent(eventName: string, payload: AnalyticsPayload = {}): void {
    const body = JSON.stringify({ event: eventName, ...payload, timestamp: Date.now() });
    if (this.endpoint && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      try { navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' })); } catch {}
      return;
    }
    // Fallback: log to console in development
    // eslint-disable-next-line no-console
    console.info('[analytics]', eventName, payload);
  }

  trackConversion(type: string, payload: AnalyticsPayload = {}): void {
    this.trackEvent(`conversion:${type}`, payload);
  }
}

export const analyticsService = new AnalyticsService();



