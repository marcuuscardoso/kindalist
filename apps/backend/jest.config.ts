import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
      diagnostics: {
        ignoreCodes: [151002],
      },
      },
    ],
  },
  clearMocks: true,
}

export default config
