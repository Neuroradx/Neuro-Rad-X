import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * @file Centralized Genkit configuration for the application.
 * Following Genkit 1.x best practices with version 1.0.4 stable.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
