import { z } from 'zod';

const Env = z.object({
  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof Env> {}
  }
}
