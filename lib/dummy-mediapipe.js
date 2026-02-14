// Dummy module for @mediapipe/selfie_segmentation
// This is a stub to prevent build errors when the feature is disabled
// The 100ms SDK still tries to import it even when virtual background is disabled
// Works with both Webpack and Turbopack

// Dummy SelfieSegmentation class
class DummySelfieSegmentation {
  constructor(options) {
    this.options = options || {};
    console.warn('[DummyMediaPipe] SelfieSegmentation is disabled. Virtual background feature is not available.');
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  onResults(callback) {
    // No-op: feature is disabled
  }

  send(data) {
    // No-op: feature is disabled
    return Promise.resolve();
  }

  reset() {
    // No-op: feature is disabled
  }

  close() {
    // No-op: feature is disabled
  }
}

// Export the dummy class (ESM format for Turbopack)
export { DummySelfieSegmentation as SelfieSegmentation };

// Also export as default for compatibility
export default DummySelfieSegmentation;

// CommonJS export for compatibility (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DummySelfieSegmentation;
  module.exports.SelfieSegmentation = DummySelfieSegmentation;
}

