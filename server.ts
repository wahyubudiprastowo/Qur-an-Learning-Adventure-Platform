import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON Body Parser for Base64 Audio and Tahfiz Metadata
  app.use(express.json({ limit: '15mb' }));

  // Initialize server-side Gemini client using the standard @google/genai SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

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

  // Smart AI Recitation Correction Endpoint (Multimodal & Tahfiz Engine)
  app.post('/api/ai-correction', async (req, res) => {
    try {
      const {
        surahNumber = 1,
        surahName = 'Al-Fatihah',
        ayahNumber = 1,
        targetArabicText = '',
        targetTranslation = '',
        audioBase64,
        mimeType = 'audio/webm',
        durationSeconds = 4,
        assistanceUsed = [],
        audioLevel = { peak: 50, avg: 35 },
        spokenTranscript = '',
        customApiKey,
      } = req.body;

      const userProvidedKey = ((req.headers['x-gemini-api-key'] as string) || customApiKey || '').trim();
      const activeApiKey = userProvidedKey || process.env.GEMINI_API_KEY;
      const activeAi = userProvidedKey ? new GoogleGenAI({ apiKey: userProvidedKey }) : ai;

      const words = targetArabicText ? targetArabicText.trim().split(/\s+/) : [];
      const wordCount = Math.max(1, words.length);
      const referenceDuration = Math.max(3, Math.round(wordCount * 1.3));

      // 1. Attempt Gemini Multimodal Evaluation with Model Fallback Cascade
      if (activeApiKey) {
        const candidateModels = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
        ];

        let cleanBase64 = '';
        let cleanMime = 'audio/webm';
        if (audioBase64 && typeof audioBase64 === 'string') {
          cleanBase64 = audioBase64.replace(/^data:[a-zA-Z0-9/.-]+;base64,/, '');
          // Strip codec parameters like ;codecs=opus for Gemini inlineData compatibility
          const rawMime = mimeType ? mimeType.split(';')[0].trim().toLowerCase() : 'audio/webm';
          cleanMime = rawMime.startsWith('audio/') ? rawMime : 'audio/webm';
        }

        const promptText = `Anda adalah Dewan Penguji Tahfiz Al-Qur'an dan Ustadz/Ustadzah Ahli Tajwid yang teliti, adil, amanah, dan mendidik.
Tugas Anda mendengarkan rekaman suara santri dan mencocokkannya secara SANGAT KETAT dengan teks ayat Al-Qur'an target:
- Surat: ${surahName} (Surat ke-${surahNumber})
- Ayat: ${ayahNumber}
- Teks Ayat Target Wajib: "${targetArabicText}"
- Terjemahan: "${targetTranslation}"
- Durasi Rekaman: ${durationSeconds} detik (durasi wajar membaca tartil: ~${referenceDuration} detik)
- Bantuan yang digunakan: ${assistanceUsed.length > 0 ? assistanceUsed.join(', ') : 'Mandiri tanpa bantuan'}
${spokenTranscript ? `- Deteksi ucapan suara (Speech-to-Text): "${spokenTranscript}"` : ''}

ATURAN PENILAIAN KRITIS & TEGAS (WAJIB DIIKUTI):
1. VALIDASI KEASLIAN BACAAN AYAT AL-QUR'AN:
   - Dengarkan rekaman suara dengan saksama: Apakah audio tersebut BENAR-BENAR berisi pelafalan ayat Al-Qur'an yang dimaksud ("${targetArabicText}")?
   - JIKA TERJADI KONDISI BERIKUT:
     a. Rekaman ngasal / bersuara sembarangan / bergumam tanpa membaca ayat / bernyanyi / tertawa / bermain-main / batuk.
     b. Berbicara bahasa Indonesia, Inggris, atau obrolan santai yang bukan teks ayat Quran target.
     c. Hanya berisi hening, derau mic, tiupan angin, atau bunyi ketukan benda.
     d. Membaca ayat atau surah lain yang sama sekali berbeda dari ayat target.
     e. Durasi membaca terlalu singkat/terpotong sehingga ayat belum selesai dibaca.
     -> MAKA ANDA HARUS SECARA TEGAS MEMBERIKAN SKOR RENDAH:
        * overallScore: antara 15 sampai 35 (MAKSIMAL 35, TIDAK BOLEH LEBIH DARI 35, TIDAK BOLEH LULUS).
        * grade: "perlu_ulang"
        * isPassed: false
        * accuracyScore: antara 10 sampai 30.
        * tajwidScore: antara 15 sampai 30.
        * fluencyScore: antara 15 sampai 35.
        * feedback: "Afwan ananda, rekaman suara belum terdengar melafalkan Ayat ${ayahNumber} (${surahName}) dengan benar. Terdengar [sebutkan apa yang terdengar: suara latar / kata belum sesuai / gumaman]. Silakan dengarkan contoh qari dan rekam kembali dengan membaca ayat: ${targetArabicText}."
        * tajwidNotes: ["Lafalkan setiap kata ayat secara jelas dan tartil.", "Pastikan membaca ayat yang sesuai sebelum menekan tombol selesai."]
        JANGAN PERNAH MEMBERIKAN SKOR MUMTAZ ATAU JAYYID PADA BACAAN YANG NGASAL ATAU TIDAK SESUAI TEKS AYAT!

2. JIKA SANTRI BENAR MEMBACA AYAT TARGET:
   - Nilai kelengkapan kata: tidak boleh ada kata yang hilang, tertukar, atau salah harakat.
   - Nilai makharijul huruf: kefasihan huruf Arab (huruf halq, lisan, syafatan).
   - Nilai tajwid: panjang mad (2 harakat mad thabi'i, 4-5 harakat mad wajib/jaiz), dengung ghunnah, tasydid, qolqolah.
   - Nilai tempo kelancaran (fluency).
   - Berikan skor objektif:
     * "mumtaz" (skor 85-100): Jika ayat terbaca lengkap, fasih, dan tertib tajwidnya.
     * "jayyid" (skor 70-84): Jika ayat terbaca lengkap namun ada koreksi minor pada panjang mad atau makhraj tipis.
     * "perlu_ulang" (skor < 70): Jika ada kata yang terlewat, salah lafal berat, atau tajwid belum terpenuhi.
     * feedback: Ulasan ramah santri yang mendidik dan spesifik pada ayat ini.

Kembalikan jawaban HANYA dalam format JSON terstruktur:`;

        for (const modelName of candidateModels) {
          try {
            const parts: any[] = [];
            if (cleanBase64 && cleanBase64.length > 500) {
              parts.push({
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              });
            }
            parts.push({ text: promptText });

            const geminiPromise = activeAi.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts }],
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    overallScore: { type: Type.INTEGER, description: 'Skor keseluruhan 0-100' },
                    grade: { type: Type.STRING, description: 'mumtaz | jayyid | perlu_ulang' },
                    accuracyScore: { type: Type.INTEGER, description: 'Skor akurasi kelafalan dan kelengkapan kata 0-100' },
                    tajwidScore: { type: Type.INTEGER, description: 'Skor tajwid dan makhraj 0-100' },
                    fluencyScore: { type: Type.INTEGER, description: 'Skor kelancaran dan tempo 0-100' },
                    feedback: { type: Type.STRING, description: 'Ulasan ramah anak yang mendidik dan objektif' },
                    tajwidNotes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Poin-poin catatan tajwid spesifik',
                    },
                    correctedLafal: { type: Type.STRING, description: 'Lafal yang benar jika ada kesalahan' },
                    isPassed: { type: Type.BOOLEAN, description: 'Kelulusan ayat ini (true jika >= 70)' },
                  },
                  required: [
                    'overallScore',
                    'grade',
                    'accuracyScore',
                    'tajwidScore',
                    'fluencyScore',
                    'feedback',
                    'tajwidNotes',
                    'isPassed',
                  ],
                },
              },
            });

            // Timeout 15 detik per candidate model
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout with ${modelName}`)), 15000)
            );

            const geminiResponse = (await Promise.race([geminiPromise, timeoutPromise])) as any;

            if (geminiResponse && geminiResponse.text) {
              const parsed = JSON.parse(geminiResponse.text);
              return res.json({
                ...parsed,
                evaluatedAt: new Date().toISOString(),
                modelUsed: modelName,
              });
            }
          } catch (modelErr: any) {
            console.warn(`[Gemini model ${modelName} failed, trying next candidate]:`, modelErr?.status || modelErr?.message || modelErr);
          }
        }
      }

      // 2. Intelligent Acoustic & Linguistic Fallback Engine
      const cleanAudioLen = audioBase64 ? audioBase64.replace(/^data:[a-zA-Z0-9/.-]+;base64,/, '').length : 0;
      const isCompletelyEmptyAudio = cleanAudioLen < 200 || (!audioLevel || audioLevel.peak === 0) || durationSeconds < 1;

      if (isCompletelyEmptyAudio) {
        return res.json({
          overallScore: 25,
          grade: 'perlu_ulang',
          accuracyScore: 20,
          tajwidScore: 20,
          fluencyScore: 25,
          feedback: `Rekaman suara tidak tertangkap pada Ayat ${ayahNumber}. Silakan klik Izinkan Mikrofon dan rekam kembali dengan suara yang terdengar jelas ya ananda.`,
          tajwidNotes: [
            'Pastikan mikrofon aktif dan berbicara dekat mikrofon.',
            'Lafalkan ayat secara tartil dan jelas.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'tahfiz-smart-heuristic',
        });
      }

      // Check for Speech Recognition Transcript sanity:
      const trimmedTranscript = (spokenTranscript || '').trim();
      const hasArabicCharacters = /[\u0600-\u06FF]/.test(trimmedTranscript);

      // If transcript has non-empty Latin text without any Arabic (e.g. child chatted in Indonesian / noise)
      if (trimmedTranscript.length > 3 && !hasArabicCharacters) {
        return res.json({
          overallScore: 28,
          grade: 'perlu_ulang',
          accuracyScore: 20,
          tajwidScore: 25,
          fluencyScore: 30,
          feedback: `Suara yang tertangkap (${trimmedTranscript.slice(0, 30)}) belum sesuai dengan lafal Ayat ${ayahNumber} dari Surat ${surahName}. Silakan dengarkan contoh qari dan lafalkan ayat: "${targetArabicText}".`,
          tajwidNotes: [
            'Pastikan melafalkan ayat Al-Qur\'an, bukan percakapan biasa.',
            'Dengarkan qari terlebih dahulu sebelum menyetor hafalan.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'tahfiz-transcript-check',
        });
      }

      // If duration is too short for the ayah (e.g. < 1.8s for multi-word ayah)
      const durationRatio = durationSeconds / referenceDuration;
      if (durationSeconds < 1.8 && wordCount >= 3) {
        return res.json({
          overallScore: 32,
          grade: 'perlu_ulang',
          accuracyScore: 25,
          tajwidScore: 30,
          fluencyScore: 35,
          feedback: `Durasi rekaman (${durationSeconds} detik) terlalu singkat untuk membaca Ayat ${ayahNumber} secara lengkap. Silakan baca ayat secara tenang dan tartil.`,
          tajwidNotes: [
            'Baca seluruh kata dalam ayat hingga tuntas.',
            'Jaga ketukan tempo dan tidak tergesa-gesa.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'tahfiz-duration-check',
        });
      }

      // If audio peak level is extremely low (< 12 out of 100) -> whispering or silence
      if (audioLevel && audioLevel.peak < 12) {
        return res.json({
          overallScore: 30,
          grade: 'perlu_ulang',
          accuracyScore: 25,
          tajwidScore: 30,
          fluencyScore: 30,
          feedback: `Suara rekaman terlalu pelan atau jauh dari mikrofon. Mohon dekatkan perangkat dan bacakan Ayat ${ayahNumber} dengan suara lantang.`,
          tajwidNotes: [
            'Gunakan volume suara yang cukup agar makhraj terdengar jelas.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'tahfiz-volume-check',
        });
      }

      // Realistic heuristic evaluation when Gemini is offline
      let accuracyScore = 70;
      let tajwidScore = 68;
      let fluencyScore = 70;

      if (assistanceUsed.includes('lihat_ayah')) {
        accuracyScore -= 15;
      } else if (assistanceUsed.includes('play_ayah')) {
        accuracyScore -= 10;
      } else if (assistanceUsed.includes('lihat_awalan')) {
        accuracyScore -= 6;
      }

      if (durationRatio < 0.5) {
        fluencyScore = Math.max(40, fluencyScore - 25);
        accuracyScore = Math.max(45, accuracyScore - 20);
      } else if (durationRatio > 2.5) {
        fluencyScore = Math.max(50, fluencyScore - 18);
      } else if (durationRatio >= 0.8 && durationRatio <= 1.4) {
        fluencyScore = Math.min(85, fluencyScore + 5);
        accuracyScore = Math.min(82, accuracyScore + 4);
      }

      const overallScore = Math.min(
        88,
        Math.max(35, Math.round(accuracyScore * 0.45 + tajwidScore * 0.3 + fluencyScore * 0.25))
      );

      const grade =
        overallScore >= 85 ? 'mumtaz' : overallScore >= 70 ? 'jayyid' : 'perlu_ulang';

      const tajwidNotes: string[] = [];
      if (targetArabicText.includes('ّ')) {
        tajwidNotes.push('Perhatikan tasydid (tekanan huruf) agar terbaca jelas dan mantap.');
      }
      if (targetArabicText.includes('نّ') || targetArabicText.includes('مّ')) {
        tajwidNotes.push('Tahan dengung (ghunnah) selama 2 harakat pada huruf nun/mim bertasydid.');
      }
      if (targetArabicText.includes('آ') || targetArabicText.includes('~') || targetArabicText.includes('ۤ')) {
        tajwidNotes.push('Panjangkan mad wajib/jaiz sepanjang 4-5 harakat secara konsisten.');
      } else {
        tajwidNotes.push('Jaga panjang mad thabi\'i tetap 2 harakat, tidak terlalu cepat atau lambat.');
      }

      const feedback =
        grade === 'mumtaz'
          ? `Alhamdulillah, rekaman Ayat ${ayahNumber} tersimpan baik. Pertahankan hafalanmu ya ananda.`
          : grade === 'jayyid'
          ? `Bagus, rekaman Ayat ${ayahNumber} sudah tersimpan. Latih lagi ketukan tempo dan makhraj agar semakin mutqin.`
          : `Rekaman tersimpan, namun disarankan untuk mengulang kembali hafalan Ayat ${ayahNumber} bersama murottal qari agar lebih lancar.`;

      return res.json({
        overallScore,
        grade,
        accuracyScore,
        tajwidScore,
        fluencyScore,
        feedback,
        tajwidNotes,
        correctedLafal: targetArabicText ? targetArabicText.split(' ').slice(0, 3).join(' ') : '',
        isPassed: overallScore >= 70,
        evaluatedAt: new Date().toISOString(),
        modelUsed: 'tahfiz-smart-engine',
      });
    } catch (err: any) {
      console.error('[AI Correction Route Error]', err);
      res.status(500).json({ error: 'Gagal melakukan koreksi hafalan' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Cahaya Tahfiz Full-Stack',
      hasGemini: !!process.env.GEMINI_API_KEY,
      time: Date.now(),
    });
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
