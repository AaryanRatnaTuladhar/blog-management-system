import serverlessExpress from '@codegenie/serverless-express';
import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/main.js';

let cachedHandler:
  | ((req: IncomingMessage, res: ServerResponse) => Promise<unknown> | unknown)
  | undefined;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }
  return cachedHandler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const requestHandler = await getHandler();
  if (!requestHandler) {
    throw new Error('Server handler was not initialized.');
  }
  return requestHandler(req, res);
}
