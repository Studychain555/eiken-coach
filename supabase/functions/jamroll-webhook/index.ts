// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface JamRollWebhook {
  id: string;
  type: string;
  data: {
    sessionId: string;
    transcription?: string;
    duration?: number;
    recordedAt?: string;
    summary?: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
  teamId?: string;
}

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const payload: JamRollWebhook = await req.json();

    console.log("📨 JamRoll Webhook 受信:", {
      type: payload.type,
      sessionId: payload.data.sessionId,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 文字起こしデータを保存
    const { data: saved, error: err } = await supabase
      .from("jamroll_transcriptions")
      .insert({
        transcription_id: payload.data.sessionId,
        session_type: payload.type,
        transcript_text: payload.data.transcription || "",
        duration_minutes: payload.data.duration || 0,
        recorded_at: payload.data.recordedAt || new Date().toISOString(),
        metadata: { webhookId: payload.id, teamId: payload.teamId },
      })
      .select();

    if (err) throw err;

    console.log("✅ 保存完了:", saved[0]?.id);

    // Claude で非同期分析
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (payload.data.transcription && anthropicKey) {
      analyzeWithClaude(
        payload.data.transcription,
        saved[0]?.id,
        anthropicKey,
        supabaseUrl,
        supabaseKey
      ).catch(console.error);
    }

    return new Response(
      JSON.stringify({ success: true, id: saved[0]?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ エラー:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function analyzeWithClaude(
  text: string,
  transcriptionId: string,
  anthropicKey: string,
  supabaseUrl: string,
  supabaseKey: string
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: `Analyze this English tutoring session. Return ONLY valid JSON:
{"persona":{"age_group":"string","goal":"string","challenge":["string"],"motivation":"string"},"usage_purpose":{"primary":"string","secondary":["string"],"frequency":"string","session_focus":["string"]},"sentiment":"positive|neutral|negative","key_phrases":["string"],"confidence":0.0}`,
      messages: [
        {
          role: "user",
          content: `Analyze:\n${text.substring(0, 3000)}`,
        },
      ],
    }),
  });

  const data = (await response.json()) as any;
  const analysis = JSON.parse(data.content?.[0]?.text || "{}");

  const supabase = createClient(supabaseUrl, supabaseKey);
  await supabase.from("user_analysis_cache").insert({
    transcription_id: transcriptionId,
    extracted_persona: analysis.persona,
    extracted_purpose: analysis.usage_purpose,
    keywords: analysis.key_phrases || [],
    sentiment: analysis.sentiment,
    confidence: analysis.confidence || 0,
  });

  console.log("✅ 分析完了");
}
