import express from 'express';
import cors from 'cors';

import { createApiResponse } from '@fariq/shared';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json(createApiResponse({ status: 'ok' }));
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
