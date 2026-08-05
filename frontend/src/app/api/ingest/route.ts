import { NextResponse } from 'next/server';

const ALLOWED_CATEGORIES = [
  "World / Geopolitics",
  "Technology & AI",
  "Economy & Business",
  "Science & Space",
  "Health & Biotech",
  "Environment & Energy",
  "Arts & Entertainment",
  "Sports",
  "Crime & Law"
];

const LANG_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  de: 'German'
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          status: 'error',
          error_code: 'MISSING_API_KEY',
          message: 'GEMINI_API_KEY environment variable is not configured on the server.'
        },
        { status: 500 }
      );
    }

    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/png';
    let filename = 'document_upload.png';
    let targetLanguage = 'English';
    let rawText = '';
    let rawUrl = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const lang = (formData.get('target_language') as string) || 'en';
      targetLanguage = LANG_MAP[lang.toLowerCase()] || 'English';

      if (file) {
        filename = file.name || filename;
        mimeType = file.type || mimeType;
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await req.json();
      rawText = body.text || '';
      rawUrl = body.url || '';
      const lang = body.target_language || 'en';
      targetLanguage = LANG_MAP[lang.toLowerCase()] || 'English';
    }

    const contentsParts: any[] = [];

    // System prompt instructing Gemini Vision OCR & Deep Multilingual Analysis
    const systemPrompt = `You are a multilingual news analyst and OCR vision intelligence synthesizer for NextPulse AI.
Examine the provided content/document/image payload and produce a structured JSON response strictly in the target language: "${targetLanguage}".
Do not keep the summary, title, ELI5 points, or deep dive in English unless targetLanguage is "English".

Required JSON Schema:
{
  "title": "Main headline found in the image or text payload in ${targetLanguage}",
  "summary": [
    "Executive summary bullet takeaway 1 in ${targetLanguage}",
    "Executive summary bullet takeaway 2 in ${targetLanguage}",
    "Executive summary bullet takeaway 3 in ${targetLanguage}"
  ],
  "category": "One of: World / Geopolitics, Technology & AI, Economy & Business, Science & Space, Health & Biotech, Environment & Energy, Arts & Entertainment, Sports, Crime & Law",
  "source": "Name of the news publication visible in the image/text (e.g. 'The Hindu', 'Times of India', 'Reuters', 'TechCrunch')",
  "readTime": "1 min read",
  "biasRating": "Neutral",
  "biasScore": 90,
  "summaryEli5": [
    "Simple Explain-Like-I-Am-5 bullet point 1 in ${targetLanguage}",
    "Simple Explain-Like-I-Am-5 bullet point 2 in ${targetLanguage}"
  ],
  "summaryDeepDive": "Detailed narrative deep-dive synthesis in ${targetLanguage}.",
  "smartGlossary": [
    {"term": "Key Term 1", "definition": "1-sentence definition in ${targetLanguage}"}
  ]
}

Return ONLY valid raw JSON matching the exact schema above without markdown formatting.`;

    if (fileBuffer) {
      const base64Data = fileBuffer.toString('base64');
      contentsParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
      contentsParts.push({
        text: `${systemPrompt}\n\nFile Name: ${filename}`
      });
    } else if (rawText) {
      contentsParts.push({
        text: `${systemPrompt}\n\nArticle Text:\n${rawText}`
      });
    } else if (rawUrl) {
      contentsParts.push({
        text: `${systemPrompt}\n\nArticle URL:\n${rawUrl}`
      });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'No file, text, or URL payload provided.' },
        { status: 400 }
      );
    }

    // Call Google AI Studio REST endpoint for gemini-1.5-flash / gemini-2.5-flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResp = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: contentsParts
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error('Gemini REST API error:', errText);
      return NextResponse.json(
        {
          status: 'error',
          message: `Gemini API call failed with status ${geminiResp.status}.`
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiResp.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let cleanedJson = candidateText.trim();
    if (cleanedJson.startsWith('```')) {
      const lines = cleanedJson.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines.length && lines[lines.length - 1].startsWith('```')) lines.pop();
      cleanedJson = lines.join('\n').trim();
    }

    const parsed = JSON.parse(cleanedJson);

    let category = parsed.category || "World / Geopolitics";
    if (!ALLOWED_CATEGORIES.includes(category)) {
      category = "World / Geopolitics";
    }

    const docId = `card-ingest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const storyResult = {
      id: docId,
      title: parsed.title || parsed.headline || filename,
      category: category,
      readTime: parsed.readTime || "1 min read",
      publishedAt: "Just now",
      source: parsed.source || "Scanned News Document",
      originalUrl: rawUrl || undefined,
      summary60w: parsed.summary || parsed.summary_60w || [
        "OCR text and content extracted from document.",
        "Synthesized executive takeaways via Gemini Vision.",
        "Verified news metrics and source details."
      ],
      summaryEli5: parsed.summaryEli5 || [
        "We scanned your news document image and converted it into a simple brief!"
      ],
      summaryDeepDive: parsed.summaryDeepDive || "Document OCR Vision synthesis completed.",
      biasRating: parsed.biasRating || "Neutral",
      biasScore: parsed.biasScore || 90,
      perspectives: [
        { perspective: parsed.source || "Document OCR", sentiment: "Extracted article layout." }
      ],
      smartGlossary: parsed.smartGlossary || [
        { term: "OCR Vision", definition: "Optical character recognition technology to convert document images to text." }
      ],
      voiceAudioText: `${parsed.title || filename}. ${(parsed.summary || []).join(' ')}`,
      isBookmarked: false
    };

    return NextResponse.json(storyResult);
  } catch (error: any) {
    console.error('Server error in /api/ingest route:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error?.message || 'Failed to process document with Gemini Vision.'
      },
      { status: 500 }
    );
  }
}
