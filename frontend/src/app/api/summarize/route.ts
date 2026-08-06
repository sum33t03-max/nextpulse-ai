import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text || body.content || body.cardContent || "";
    const title = body.title || "";
    const targetLanguage = body.targetLanguage || body.target_language || "English";

    if (!text && !title) {
      return NextResponse.json({ error: "No text or title provided for summarization" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      return NextResponse.json({ error: "API Key missing in server env" }, { status: 500 });
    }

    const promptText = `
    You are a multilingual news editor.
    Translate and summarize the following news content strictly into "${targetLanguage}".
    If targetLanguage is "Gujarati" or "gu", output human-readable Gujarati script (ગુજરાતી).
    If targetLanguage is "Hindi" or "hi", output human-readable Hindi script (हिंदी).
    Do NOT leave any text in English unless targetLanguage is "English" or "en".

    Title: ${title}
    Text: ${text}

    INSTRUCTIONS:
    1. Translate the title into "${targetLanguage}".
    2. Extract/translate 3 concise key takeaway bullet points strictly in "${targetLanguage}".
    
    Return ONLY raw valid JSON:
    {
      "title": "Translated Title Here",
      "summary": [
        "First bullet point in ${targetLanguage}",
        "Second bullet point in ${targetLanguage}",
        "Third bullet point in ${targetLanguage}"
      ]
    }
    `;

    // Try Gemini if key available
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);

          const summaryBullets = Array.isArray(parsed.summary)
            ? parsed.summary
            : [parsed.summary || text];

          return NextResponse.json({
            success: true,
            title: parsed.title || title,
            summary: summaryBullets,
            summary60w: summaryBullets,
            summaryEli5: summaryBullets.slice(0, 2),
            summaryDeepDive: summaryBullets.join(" ") || text,
            voiceAudioText: `${parsed.title || title}. ${summaryBullets.join(" ")}`,
          });
        }
      } catch (err) {
        console.warn("Gemini API request failed, falling back to Groq:", err);
      }
    }

    // Fallback/Primary: Groq API
    if (groqKey) {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptText }],
          temperature: 0.2,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        const content = groqData?.choices?.[0]?.message?.content || "{}";
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        const summaryBullets = Array.isArray(parsed.summary)
          ? parsed.summary
          : [parsed.summary || text];

        return NextResponse.json({
          success: true,
          title: parsed.title || title,
          summary: summaryBullets,
          summary60w: summaryBullets,
          summaryEli5: summaryBullets.slice(0, 2),
          summaryDeepDive: summaryBullets.join(" ") || text,
          voiceAudioText: `${parsed.title || title}. ${summaryBullets.join(" ")}`,
        });
      }
    }

    return NextResponse.json({ error: "Summarization API failed" }, { status: 500 });
  } catch (err: any) {
    console.error("Summarize processing error:", err);
    return NextResponse.json({ error: err.message || "Server summarization failed" }, { status: 500 });
  }
}
