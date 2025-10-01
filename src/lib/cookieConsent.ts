// Cookie consent utility functions

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
}

export const getCookieConsent = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return null;
  
  try {
    return JSON.parse(consent);
  } catch {
    return null;
  }
};

export const hasAnalyticsConsent = (): boolean => {
  const preferences = getCookieConsent();
  return preferences?.analytics === true;
};

export const hasFunctionalConsent = (): boolean => {
  const preferences = getCookieConsent();
  return preferences?.functional === true;
};

export const hasEssentialConsent = (): boolean => {
  const preferences = getCookieConsent();
  return preferences?.essential === true;
};

export const hasAnyConsent = (): boolean => {
  return getCookieConsent() !== null;
};

export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('cookie-consent');
  localStorage.removeItem('functional-cookies');
  
  // Reload the page to reset all consent states
  window.location.reload();
};

export const updateAnalyticsConsent = (granted: boolean): void => {
  if (typeof window === 'undefined') return;
  
  const preferences = getCookieConsent();
  if (!preferences) return;
  
  const updatedPreferences = {
    ...preferences,
    analytics: granted,
  };
  
  localStorage.setItem('cookie-consent', JSON.stringify(updatedPreferences));
  
  // Update Google Analytics consent
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
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
