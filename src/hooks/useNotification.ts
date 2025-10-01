import { useNotifications } from '@/contexts/NotificationContext';

// Simple hook that provides easy-to-use notification methods
export function useNotification() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return {
    // Success notifications (green)
    success: (message: string, title?: string) => {
      showSuccess(message, title);
    },
    
    // Error notifications (red)
    error: (message: string, title?: string) => {
      showError(message, title);
    },
    
    // Warning notifications (yellow)
    warning: (message: string, title?: string) => {
      showWarning(message, title);
    },
    
    // Info notifications (blue)
    info: (message: string, title?: string) => {
      showInfo(message, title);
    },
    
    // Convenience methods for common scenarios
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Alternative hook with more explicit naming
export function useToast() {
  return useNotification();
}

// Hook for form validation errors
export function useFormNotifications() {
  const { showError, showSuccess } = useNotifications();

  return {
    // Show validation error
    validationError: (message: string) => {
      showError(message, 'Validation Error');
    },
    
    // Show field-specific error
    fieldError: (field: string, message: string) => {
      showError(`${field}: ${message}`, 'Field Error');
    },
    
    // Show form submission success
    submitSuccess: (message: string = 'Form submitted successfully!') => {
      showSuccess(message, 'Success');
    },
    
    // Show form submission error
    submitError: (message: string = 'Failed to submit form. Please try again.') => {
      showError(message, 'Submission Error');
    },
  };
}

// Hook for API-related notifications
export function useApiNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return {
    // API success
    apiSuccess: (message: string, title: string = 'Success') => {
      showSuccess(message, title);
    },
    
    // API error
    apiError: (message: string, title: string = 'Error') => {
      showError(message, title);
    },
    
    // Network error
    networkError: () => {
      showError('Network error. Please check your connection and try again.', 'Connection Error');
    },
    
    // Server error
    serverError: (message: string = 'Server error. Please try again later.') => {
      showError(message, 'Server Error');
    },
    
    // Loading state (info)
    loading: (message: string = 'Loading...') => {
      showInfo(message, 'Loading');
    },
  };
}
