import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawText = (formData.get("text") as string) || "";
    const targetLanguage = (formData.get("target_language") as string) || "en";

    if (!file && !rawText.trim()) {
      return NextResponse.json({ error: "Please provide an image or text snippet." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const promptText = `You are an expert news editor and OCR document parser.
Carefully inspect and read ALL text present in the provided document image or text input.
Generate the output strictly in the language code: ${targetLanguage}.

YOUR INSTRUCTIONS:
1. Extract the primary news headline/title directly from the image content. Translate it to '${targetLanguage}' if necessary. DO NOT use generic titles like "Scanned Document".
2. Extract 3 specific, highly factual key takeaway bullet points based STRICTLY on the actual body text. Write them in '${targetLanguage}'.
3. Identify the news source publication name visible (e.g. "The Hindu", "BBC", "Reuters") or default to "E-Paper Clipping".
4. Identify the primary category from: ["World / Geopolitics", "Technology & AI", "Economy & Business", "Science & Space", "Health & Biotech", "Environment & Energy", "Arts & Entertainment", "Sports", "Crime & Justice"].

Return ONLY a raw JSON object (no markdown fences) with this exact structure:
{
  "title": "Actual headline from image in ${targetLanguage}",
  "summary": [
    "First factual key takeaway in ${targetLanguage}.",
    "Second factual key takeaway in ${targetLanguage}.",
    "Third factual key takeaway in ${targetLanguage}."
  ],
  "source": "Extracted News Outlet Name",
  "category": "World / Geopolitics"
}`;

    let messages: any[];

    if (file) {
      // Convert file to base64 for Groq vision
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";

      messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: "text",
              text: promptText,
            },
          ],
        },
      ];
    } else {
      // Text-only mode
      messages = [
        {
          role: "user",
          content: `${promptText}\n\nArticle Text:\n${rawText}`,
        },
      ];
    }

    // Use Groq vision model for images, fast text model for text-only
    const model = file
      ? "llama-3.2-11b-vision-preview"
      : "llama-3.3-70b-versatile";

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API Error:", errText);
      return NextResponse.json(
        { error: `Groq API failed: ${groqResponse.status} - ${errText}` },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();
    const responseText = groqData?.choices?.[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json({ error: "Could not extract text from image." }, { status: 500 });
    }

    let parsedData: any;
    try {
      const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanJsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response as JSON." }, { status: 500 });
    }

    const summaryBullets = Array.isArray(parsedData.summary)
      ? parsedData.summary
      : [parsedData.summary || "Summary generated."];

    const articleObj = {
      id: `scanned-${Date.now()}`,
      title: parsedData.title || (file ? file.name : "Analyzed Document"),
      summary: summaryBullets,
      summary60w: summaryBullets,
      summaryEli5: summaryBullets.slice(0, 2),
      summaryDeepDive: `Document OCR Synthesis for ${parsedData.title || (file ? file.name : "Analyzed Document")}.\n\nExtracted headline, text, and publication metadata from scanned image/document payload.`,
      source: parsedData.source || "Scanned E-Paper",
      category: parsedData.category || "World / Geopolitics",
      publishedAt: "Just now",
      readTime: "1 min read",
      biasRating: "Neutral",
      biasScore: 90,
      isScanned: true,
      isBookmarked: false,
    };

    return NextResponse.json({
      success: true,
      article: articleObj,
      ...articleObj,
    });

  } catch (err: any) {
    console.error("Ingest processing error:", err);
    return NextResponse.json({ error: err.message || "Failed to process image OCR" }, { status: 500 });
  }
}
