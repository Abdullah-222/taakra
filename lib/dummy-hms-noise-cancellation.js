// Dummy module for @100mslive/hms-noise-cancellation
// This is a stub to prevent build errors when the feature is disabled

export class HMSKrispPlugin {
  constructor() {
    console.warn('[DummyHMS] HMSKrispPlugin is disabled. Noise cancellation feature is not available.');
  }
  
  // No-op methods
  enable() {
    return Promise.resolve();
  }
  
  disable() {
    return Promise.resolve();
  }
  
  destroy() {
    return Promise.resolve();
  }
  
  getName() {
    return 'dummy-krisp-plugin';
  }
  
  isSupported() {
    return false;
  }
  
  getVersion() {
    return '0.0.0';
  }
}

// Default export
export default HMSKrispPlugin;

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HMSKrispPlugin;
  module.exports.HMSKrispPlugin = HMSKrispPlugin;
  module.exports.default = HMSKrispPlugin;
}

