export default {
  testEnvironment: 'node',
  transform: { '^.+\\.js$': 'babel-jest' },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/app.js',
    'src/index.js',
    'src/db/index.js',
    'src/utils/retryConnection.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};