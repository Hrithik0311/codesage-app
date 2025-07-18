import {genkit, GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];

if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI({apiKey: process.env.GOOGLE_API_KEY}));
} else {
  console.warn(
    'GOOGLE_API_KEY environment variable not set. Genkit will not be able to use Google AI models.'
  );
}

export const ai = genkit({
  plugins,
});
