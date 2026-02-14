// Dummy module for modules we want to ignore
// Provides minimal stubs for common Node.js module methods

const dummyModule = {
  // For path module
  parse: () => ({}),
  join: (...args) => args.join('/'),
  resolve: (...args) => args.join('/'),
  dirname: () => '',
  basename: () => '',
  extname: () => '',
  // For fs module
  readFile: () => Promise.resolve(''),
  writeFile: () => Promise.resolve(),
  existsSync: () => false,
  readFileSync: () => '',
  writeFileSync: () => {},
};

// ESM export
export default dummyModule;
export const parse = dummyModule.parse;
export const join = dummyModule.join;
export const resolve = dummyModule.resolve;
export const dirname = dummyModule.dirname;
export const basename = dummyModule.basename;
export const extname = dummyModule.extname;
export const readFile = dummyModule.readFile;
export const writeFile = dummyModule.writeFile;
export const existsSync = dummyModule.existsSync;
export const readFileSync = dummyModule.readFileSync;
export const writeFileSync = dummyModule.writeFileSync;

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dummyModule;
  module.exports.default = dummyModule;
}

