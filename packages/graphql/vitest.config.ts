/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true, // Enables `describe`, `it`, and `expect` globally
    environment: "node", // Ensures it runs in a Node.js environment
    poolOptions: {
      vmForks: {
        singleFork: true,
      },
      vmThreads: {
        singleThread: true,
      }
    },
    include: ["test/**/*.test.ts"],
  },
});
