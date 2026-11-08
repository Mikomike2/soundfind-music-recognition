import { NextRequest, NextResponse } from 'next/server';
import { recognizeWithAudD, getDemoRecognitionResult } from '@/lib/music-api';

// In-memory sliding window rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const ipRequestTimestamps = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestTimestamps.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  ipRequestTimestamps.set(ip, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMITED',
          error: 'Rate limit exceeded. Please wait a minute before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Parse multipart form data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_AUDIO',
          error: 'Invalid request: multipart/form-data payload required.',
        },
        { status: 400 }
      );
    }

    // Handle demo recognition request
    const isDemo = formData.get('is_demo') === 'true';
    if (isDemo) {
      // Simulate realistic recognition delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const demoResult = await getDemoRecognitionResult();
      return NextResponse.json(demoResult);
    }

    const audioFile = formData.get('file') as Blob | null;
    const clientCustomToken = formData.get('custom_token') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_AUDIO',
          error: 'No audio recording found in the upload request.',
        },
        { status: 400 }
      );
    }

    // 3. Audio size validation
    const audioSize = audioFile.size;
    const MIN_SIZE_BYTES = 2000; // 2KB minimum
    const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB maximum

    if (audioSize < MIN_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_AUDIO',
          error: 'Audio sample is too short or empty. Please record for at least 5 to 10 seconds.',
        },
        { status: 400 }
      );
    }

    if (audioSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_AUDIO',
          error: 'Audio sample exceeds the maximum allowed size of 15MB.',
        },
        { status: 413 }
      );
    }

    // 4. Convert audio Blob to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || 'audio/webm';

    // If client supplied a custom token in their settings, override temporarily in environment or context
    const previousToken = process.env.AUDD_API_TOKEN;
    if (clientCustomToken && clientCustomToken.trim().length > 0) {
      process.env.AUDD_API_TOKEN = clientCustomToken.trim();
    }

    const allowFallback = formData.get('auto_fallback') === 'true';

    try {
      const result = await recognizeWithAudD(buffer, mimeType);

      // Restore token
      process.env.AUDD_API_TOKEN = previousToken;

      return NextResponse.json(result, {
        status:
          result.success || result.code === 'NO_MATCH' || result.code === 'API_KEY_MISSING'
            ? 200
            : 400,
      });
    } catch (recErr) {
      process.env.AUDD_API_TOKEN = previousToken;
      throw recErr;
    }
  } catch (err) {
    console.error('Recognition API error:', err);
    return NextResponse.json(
      {
        success: false,
        code: 'API_ERROR',
        error: 'An unexpected internal error occurred while processing the audio.',
        details: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
