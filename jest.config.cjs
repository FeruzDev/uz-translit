/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node', isolatedModules: true } }],
  },
};
