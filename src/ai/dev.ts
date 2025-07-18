import { config } from 'dotenv';
config();

import '@/ai/flows/ai-code-completion.ts';
import '@/ai/flows/unit-test-generator.ts';
import '@/ai/flows/site-q-and-a.ts';
import '@/ai/flows/smart-compose.ts';
import '@/ai/flows/send-notification-email.ts';
import '@/ai/flows/first-robotics-q-and-a.ts';
