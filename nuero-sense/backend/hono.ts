import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => {
  return c.json({
    message: 'NeuroSense API Bridge',
    pythonBackend: 'http://localhost:8000',
    note: 'Python FastAPI backend handles ML processing'
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'neurosense-bridge' });
});

export default app;
