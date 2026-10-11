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
        isSimulated = false,
        customApiKey,
        childName = 'Ananda',
        childAge = 8,
        learningLevel = 'pemula',
      } = req.body;

      const userProvidedKey = ((req.headers['x-gemini-api-key'] as string) || customApiKey || '').trim();
      const activeApiKey = userProvidedKey || process.env.GEMINI_API_KEY;
      const activeAi = userProvidedKey ? new GoogleGenAI({ apiKey: userProvidedKey }) : ai;

      const words = targetArabicText ? targetArabicText.trim().split(/\s+/) : [];
      const wordCount = Math.max(1, words.length);
      const referenceDuration = Math.max(3, Math.round(wordCount * 1.3));

      // Extract clean raw base64 regardless of data URL format (e.g. data:audio/webm;codecs=opus;base64,...)
      const extractRawBase64 = (rawStr: any): string => {
        if (!rawStr || typeof rawStr !== 'string') return '';
        const commaIndex = rawStr.indexOf(',');
        const cleaned = commaIndex !== -1 ? rawStr.slice(commaIndex + 1) : rawStr;
        return cleaned.replace(/\s+/g, '');
      };

      const cleanAudio = extractRawBase64(audioBase64);
      const cleanAudioLen = cleanAudio.length;

      // 1. Strict Simulation Check (Mic was not active)
      if (isSimulated) {
        return res.json({
          overallScore: 35,
          grade: 'perlu_ulang',
          accuracyScore: 30,
          tajwidScore: 30,
          fluencyScore: 35,
          encouragementEmoji: '🎙️',
          makhrajTips: [
            'Gunakan mikrofon asli perangkat santri untuk evaluasi makhraj bibir, lidah, dan tenggorokan.',
            'Lafalkan huruf dengan suara lantang dan jelas agar terdeteksi sempurna.',
          ],
          feedback: `Rekaman terdeteksi sebagai Mode Latihan Mandiri (Simulasi audio). Nilai kelulusan mutqin membutuhkan rekaman suara asli melalui mikrofon santri.`,
          tajwidNotes: [
            'Gunakan mikrofon asli untuk evaluasi makhraj dan tajwid otomatis.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'simulation-check',
        });
      }

      // 2. Strict Empty Audio Check
      const isCompletelyEmptyAudio = cleanAudioLen < 300 || (!audioLevel || audioLevel.peak === 0) || durationSeconds < 1;

      if (isCompletelyEmptyAudio) {
        return res.json({
          overallScore: 20,
          grade: 'perlu_ulang',
          accuracyScore: 15,
          tajwidScore: 20,
          fluencyScore: 20,
          encouragementEmoji: '🔇',
          makhrajTips: [
            'Pastikan mikrofon tidak dalam posisi mute dan izin mikrofon browser aktif.',
            'Dekatkan perangkat sekitar 15-20 cm dari mulut saat melafalkan ayat.',
          ],
          feedback: `Rekaman suara tidak tertangkap pada Ayat ${ayahNumber}. Silakan klik Izinkan Mikrofon dan rekam kembali dengan suara yang terdengar jelas ya ananda.`,
          tajwidNotes: [
            'Pastikan mikrofon aktif dan berbicara dekat mikrofon.',
            'Lafalkan ayat secara tartil dan jelas.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'empty-audio-check',
        });
      }

      // 3. Strict Low Volume Check (peak < 12 means whispering / silence / ambient noise)
      if (audioLevel && audioLevel.peak < 12) {
        return res.json({
          overallScore: 25,
          grade: 'perlu_ulang',
          accuracyScore: 20,
          tajwidScore: 25,
          fluencyScore: 25,
          encouragementEmoji: '🗣️',
          makhrajTips: [
            'Keluarkan suara dengan jelas dari rongga mulut (Jauf) dan tenggorokan (Halq).',
            'Volume suara yang jelas dan lantang membantu Ustadz AI mengoreksi setiap huruf hijaiah.',
          ],
          feedback: `Suara rekaman terlalu pelan atau jauh dari mikrofon (peak: ${audioLevel.peak}%). Mohon dekatkan perangkat dan bacakan Ayat ${ayahNumber} dengan suara lantang dan jelas.`,
          tajwidNotes: [
            'Gunakan volume suara yang cukup agar makhraj terdengar jelas.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'volume-check',
        });
      }

      // 4. Strict Too-Short Duration Check (< minRequiredDuration for multi-word ayah)
      const minRequiredDuration = Math.max(1.8, Math.round(wordCount * 0.7));
      if (durationSeconds < minRequiredDuration && wordCount >= 3) {
        return res.json({
          overallScore: 28,
          grade: 'perlu_ulang',
          accuracyScore: 25,
          tajwidScore: 25,
          fluencyScore: 30,
          encouragementEmoji: '⏱️',
          makhrajTips: [
            'Tenang dan tidak tergesa-gesa saat membaca ayat Al-Qur\'an.',
            'Panjangkan mad thabi\'i sebanyak 2 harakat wajar (ketukan teratur).',
          ],
          feedback: `Durasi rekaman (${durationSeconds} detik) terlalu singkat untuk membaca Ayat ${ayahNumber} (${wordCount} kata) secara tartil. Silakan baca seluruh ayat dengan tenang dan tuntas.`,
          tajwidNotes: [
            'Baca seluruh kata dalam ayat hingga tuntas.',
            'Jaga ketukan tempo dan tidak tergesa-gesa.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'duration-check',
        });
      }

      // 5. Intelligent Speech Recognition Check (support both Arabic script and Latin transliteration)
      const trimmedTranscript = (spokenTranscript || '').trim().toLowerCase();
      // Only flag if transcript clearly contains conversational chit-chat with no Quranic phonetics
      const conversationalKeywords = ['halo', 'ngapain', 'capek', 'main game', 'mama', 'papa', 'tunggu'];
      const isConversationalChitChat = conversationalKeywords.some((w) => trimmedTranscript.includes(w)) && trimmedTranscript.length > 8;

      if (isConversationalChitChat) {
        return res.json({
          overallScore: 35,
          grade: 'perlu_ulang',
          accuracyScore: 30,
          tajwidScore: 35,
          fluencyScore: 35,
          encouragementEmoji: '📖',
          makhrajTips: [
            'Fokuskan bacaan pada teks ayat yang sedang dihafal.',
            'Dengarkan qari terlebih dahulu sebelum menyetor hafalan.',
          ],
          feedback: `Terdeteksi percakapan santai ("${trimmedTranscript.slice(0, 30)}"). Yuk fokus membaca ayat: "${targetArabicText}".`,
          tajwidNotes: [
            'Pastikan melafalkan ayat Al-Qur\'an secara tartil tanpa bersuara lain.',
          ],
          isPassed: false,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'transcript-conversational-check',
        });
      }

      // 6. Attempt Gemini Multimodal Evaluation with Active Non-Deprecated Models
      if (activeApiKey) {
        const candidateModels = [
          'gemini-3.8-flash',
          'gemini-2.5-flash',
          'gemini-flash-latest',
        ];

        let cleanBase64 = cleanAudio;
        let cleanMime = 'audio/webm';
        if (mimeType && typeof mimeType === 'string') {
          const rawMime = mimeType.split(';')[0].trim().toLowerCase();
          cleanMime = rawMime.startsWith('audio/') ? rawMime : 'audio/webm';
        }

        const promptText = `Anda adalah "Dewan Penguji Ustadz AI Cahaya Tahfiz" — Ahli Qira'at dan Tajwid bersanad yang bersikap adil, teliti, amanah, mendidik, dan penuh kasih sayang kepada anak-anak.

PROFIL SANTRI:
- Nama: ${childName}
- Usia: ${childAge} tahun
- Tingkat Belajar: ${learningLevel}
- Kalibrasi Pedagogi Usia: ${
          childAge <= 7 || learningLevel === 'pemula'
            ? 'SANTRI USIA DINI (4-7 TAHUN / PEMULA): Prioritaskan kelengkapan lafal ayat, harakat pokok, dan mad thabi\'i. Maklumi keterbatasan fisiologi pita suara anak balita/usia dini dan pelafalan huruf yang masih dalam masa pertumbuhan lisan. Berikan ulasan hangat bertabur motivasi dan kasih sayang.'
            : childAge <= 11
            ? 'SANTRI USIA SEKOLAH (8-11 TAHUN / MENENGAH): Evaluasi konsistensi panjang mad 2 harakat, dengung ghunnah (nun/mim tasydid), dan pantulan qolqolah. Koreksi makhraj tipis/tebal secara bersahabat.'
            : 'SANTRI USIA REMAJA (12+ TAHUN / MAHIR): Terapkan standar tahsin tajwid mutqin lengkap bersanad.'
        }

TARGET SETORAN AYAT AL-QUR'AN:
- Surat: ${surahName} (Surat ke-${surahNumber})
- Ayat: ${ayahNumber}
- Teks Ayat Target Wajib: "${targetArabicText}"
- Terjemahan: "${targetTranslation}"
- Durasi Rekaman: ${durationSeconds} detik (durasi wajar membaca tartil: ~${referenceDuration} detik)
- Bantuan yang digunakan: ${assistanceUsed.length > 0 ? assistanceUsed.join(', ') : 'Mandiri tanpa bantuan'}
${spokenTranscript ? `- Deteksi ucapan suara (Speech-to-Text): "${spokenTranscript}"` : ''}

RUBRIK PENILAIAN STANDAR USTADZ AI (WAJIB DIIKUTI):
1. VALIDASI KEASLIAN BACAAN AYAT:
   - Pastikan rekaman suara BENAR-BENAR berisi pelafalan ayat Al-Qur'an yang dimaksud ("${targetArabicText}").
   - JIKA TERJADI KONDISI: rekaman ngasal, obrolan bahasa selain Arab, hening, tiupan angin, gumaman, atau membaca ayat/surat lain:
     * overallScore: antara 15 sampai 35 (MAKSIMAL 35, TIDAK BOLEH LULUS).
     * grade: "perlu_ulang"
     * isPassed: false
     * encouragementEmoji: "🤲" atau "💪"
     * feedback: "Afwan ${childName}, rekaman suara belum terdengar melafalkan Ayat ${ayahNumber} (${surahName}) dengan benar. Silakan dengarkan contoh qari dan rekam kembali dengan membaca ayat: ${targetArabicText}."

2. EVALUASI BACAAN SANTRI:
   - Nilai kelengkapan kata & harakat (Accuracy, bobot 40%): tidak boleh ada kata yang hilang atau salah harakat fatal.
   - Nilai makharijul huruf & shifatul huruf (Tajwid, bobot 35%): perhatikan huruf khas di ayat ini (misal huruf halq seperti ع, ح, هـ; lisan seperti ص, ض, ط, ظ, ق; syafatan). Berikan tips makhraj praktis.
   - Nilai tempo kelancaran & nafas (Fluency, bobot 25%): tempo tartil teratur sesuai usia ${childAge} tahun.
   - Kategori Skor:
     * "mumtaz" (skor 85-100, isPassed: true): Ayat terbaca lengkap, fasih, dan tertib tajwidnya. Emoji: "🌟" atau "🎉" atau "🏆".
     * "jayyid" (skor 70-84, isPassed: true): Ayat terbaca lengkap dan benar, ada koreksi ringan pada mad/makhraj. Emoji: "👍" atau "👏" atau "✨".
     * "perlu_ulang" (skor < 70, isPassed: false): Ada kata yang terlewat, salah lafal berat, atau tajwid belum terpenuhi. Emoji: "💪" atau "🤲".
     * feedback: Ulasan ramah santri yang mendidik, hangat, dan spesifik menyebut nama santri (${childName}).
     * makhrajTips: Berikan 1-3 tips makhraj huruf spesifik dari ayat ini.

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
                    makhrajTips: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Tips makharijul huruf atau cara pelafalan bibir/lidah/tenggorokan',
                    },
                    encouragementEmoji: {
                      type: Type.STRING,
                      description: 'Emoji semangat atau apresiasi santri (misal: 🌟, 🎉, 🏆, 💪, 🤲, 🎯)',
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
              // Safety enforcement: If overallScore < 70, isPassed MUST be false
              const verifiedPassed = !!parsed.isPassed && parsed.overallScore >= 70;
              const defaultEmoji = verifiedPassed
                ? (parsed.grade === 'mumtaz' ? '🌟' : '👍')
                : '💪';
              return res.json({
                ...parsed,
                encouragementEmoji: parsed.encouragementEmoji || defaultEmoji,
                makhrajTips: parsed.makhrajTips && parsed.makhrajTips.length > 0
                  ? parsed.makhrajTips
                  : [
                      'Lafalkan setiap huruf dari makhraj aslinya secara tenang.',
                      'Jaga panjang ketukan mad dan dengung ghunnah sesuai kaidah tartil.',
                    ],
                isPassed: verifiedPassed,
                evaluatedAt: new Date().toISOString(),
                modelUsed: modelName,
              });
            }
          } catch (modelErr: any) {
            console.warn(`[Gemini model ${modelName} failed, trying next candidate]:`, modelErr?.status || modelErr?.message || modelErr);
          }
        }
      }

      // 7. Strict Fallback When Gemini is Offline / Unavailable
      // NEVER give a passing score or 70+ to unverified audio!
      return res.json({
        overallScore: 42,
        grade: 'perlu_ulang',
        accuracyScore: 40,
        tajwidScore: 40,
        fluencyScore: 45,
        encouragementEmoji: '🤲',
        makhrajTips: [
          'Dengarkan contoh bacaan qari secara berulang sebelum menyetor hafalan.',
          'Perhatikan makhraj huruf halq (tenggorokan) dan lisan (lidah) agar semakin fasih.',
        ],
        feedback: `Rekaman tersimpan di perangkat. Layanan AI Tartil sedang dalam antrean atau offline. Rekaman belum lulus otomatis dan perlu diverifikasi langsung oleh orang tua atau guru tahfiz di Dasbor Wali.`,
        tajwidNotes: [
          'Dengarkan kembali rekaman Anda di riwayat hafalan.',
          'Minta ustadz atau orang tua mengevaluasi langsung di Dasbor Wali.',
        ],
        correctedLafal: targetArabicText ? targetArabicText.split(' ').slice(0, 3).join(' ') : '',
        isPassed: false,
        evaluatedAt: new Date().toISOString(),
        modelUsed: 'tahfiz-offline-pending',
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
