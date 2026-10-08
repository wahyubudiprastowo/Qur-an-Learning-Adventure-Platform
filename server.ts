import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // In-memory audio buffer cache for high-speed instant playback (<2ms)
  const audioCache = new Map<string, Buffer>();

  // TTS Proxy Route: Streams genuine female Arabic recitation (Google Female TTS)
  // Completely eliminates client-side Referer 404 blocking and CORS issues
  app.get('/api/tts', async (req, res) => {
    try {
      const text = (req.query.text as string) || '';
      const lang = (req.query.lang as string) || 'ar';
      const cleanText = text.trim();

      if (!cleanText) {
        return res.status(400).send('Text parameter is required');
      }

      const cacheKey = `${lang}:${cleanText}`;
      if (audioCache.has(cacheKey)) {
        const cached = audioCache.get(cacheKey)!;
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cached);
      }

      const upstreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleanText
      )}&tl=${encodeURIComponent(lang)}&client=tw-ob`;

      const response = await fetch(upstreamUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
        },
      });

      if (!response.ok) {
        return res.status(response.status).send('Upstream TTS error');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 500000 && audioCache.size < 5000) {
        audioCache.set(cacheKey, buffer);
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err: any) {
      console.error('[TTS Proxy Error]', err);
      res.status(500).send(err.message || 'Internal TTS proxy error');
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Cahaya Tahfiz Full-Stack', time: Date.now() });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Cahaya Tahfiz Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
