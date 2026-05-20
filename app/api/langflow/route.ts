import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const targetUrl = process.env.LANGFLOW_URL || "http://localhost:7860/api/v1/run/2db123bf-c4f4-4d08-957f-83f69aff1356";
    const token = process.env.LANGFLOW_TOKEN || "sk-AguW-yCN35zE7ynGOc9rI8rHFuC36ZI-vjGEVJJk3pg";

    // This forwards your message to Langflow securely while bypassing the ngrok security blocker
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': token,
        'ngrok-skip-browser-warning': 'true' // BYPASSES THE NGROK FREE TIER INTERSTITIAL WARNING
      },
      body: JSON.stringify({
        input_value: message,
        output_type: 'chat',
        input_type: 'chat'
      })
    });

    const data = await response.json();
    
    // Extracts the clean text response
    const cleanText = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || "No output returned.";
    
    return NextResponse.json({ text: cleanText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}