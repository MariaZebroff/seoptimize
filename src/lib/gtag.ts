// Google Analytics configuration and utilities
import { hasAnalyticsConsent } from './cookieConsent';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views (only if analytics consent is given)
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events (only if analytics consent is given)
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'consent' | 'config' | 'event' | 'js',
      action: 'default' | 'update' | string,
      config?: Record<string, any>
    ) => void;
  }
}
