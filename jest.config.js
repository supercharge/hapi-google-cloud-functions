'use strict'

module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  setupFilesAfterEnv: ['jest-extended'],
  testMatch: ['<rootDir>/test/**/*.[jt]s'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/examples']
}
