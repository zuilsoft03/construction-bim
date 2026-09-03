// Shim: web-ifc-three 0.0.126 imports { mergeGeometries } from BufferGeometryUtils
// but three 0.149 (its own declared peer) exports it as mergeBufferGeometries.
// Re-export under the new name so bundling works without touching node_modules.
export { mergeBufferGeometries as mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
