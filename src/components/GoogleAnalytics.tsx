'use client';

import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/gtag';

export default function GoogleAnalytics() {
  // Don't load GA in development
  if (process.env.NODE_ENV !== 'production' || !GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Set default consent state (denied until user accepts)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 2000,
            });
            
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
            
            // Check for existing consent and apply it
            const consent = localStorage.getItem('cookie-consent');
            if (consent) {
              const preferences = JSON.parse(consent);
              if (preferences.analytics) {
                gtag('consent', 'update', {
                  'analytics_storage': 'granted',
                  'ad_storage': 'denied',
                });
              }
            }
          `,
        }}
      />
    </>
  );
}
