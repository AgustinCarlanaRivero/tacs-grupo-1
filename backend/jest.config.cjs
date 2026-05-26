/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    transform: {
        "^.+\\.ts$": ["babel-jest", { configFile: "./babel.config.cjs" }],
    },
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
    clearMocks: true,
};
