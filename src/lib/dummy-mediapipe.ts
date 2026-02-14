// Dummy mediapipe module to resolve import issues
// This is a fallback when the actual mediapipe module cannot be resolved

// Dummy MediaPipe class
export class MediaPipe {
  constructor() {}
  init() {}
  process() {}
  dispose() {}
  reset() {}
  setOptions() {}
  onResults() {}
}

// Dummy Pose class
export class Pose {
  constructor() {}
  setOptions() {}
  send() {}
  onResults() {}
}

// Dummy Hands class
export class Hands {
  constructor() {}
  setOptions() {}
  send() {}
  onResults() {}
}

// Dummy FaceMesh class
export class FaceMesh {
  constructor() {}
  setOptions() {}
  send() {}
  onResults() {}
}

// Dummy SelfieSegmentation class
export class SelfieSegmentation {
  constructor() {}
  setOptions() {}
  send() {}
  onResults() {}
}

// Dummy drawing utilities
export const drawConnectors = () => {}
export const drawLandmarks = () => {}
export const drawRectangle = () => {}

// Dummy camera utilities
export class Camera {
  constructor() {}
  start() {}
  stop() {}
}

// Default export
const MediaPipeDefault = {
  Pose,
  Hands,
  FaceMesh,
  SelfieSegmentation,
  Camera,
  drawConnectors,
  drawLandmarks,
  drawRectangle,
}

export default MediaPipeDefault

