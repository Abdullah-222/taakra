// Dummy module for @100mslive/hms-virtual-background
// This is a stub to prevent build errors when the feature is disabled

export const HMSVirtualBackgroundTypes = {
  NONE: 'none',
  BLUR: 'blur',
  IMAGE: 'image',
  VIDEO: 'video',
};

// Default export
export default {
  HMSVirtualBackgroundTypes,
};

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HMSVirtualBackgroundTypes };
  module.exports.default = { HMSVirtualBackgroundTypes };
}

