// Dummy module for @100mslive/hms-video-store
// This provides missing exports that other 100ms packages might need

// Export DomainCategory enum
export const DomainCategory = {
  CUSTOM: 'custom',
  ANALYTICS: 'analytics',
  PEER: 'peer',
  TRACK: 'track',
  ROOM: 'room',
};

// Export other common exports that might be needed
export const HMSNotificationSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

// Default export
export default {
  DomainCategory,
  HMSNotificationSeverity,
};

