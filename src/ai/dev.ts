import { config } from 'dotenv';
config();

import '@/ai/flows/ai-code-completion.ts';
import '@/ai/flows/unit-test-generator.ts';
import '@/ai/flows/refactor-code-flow.ts';
