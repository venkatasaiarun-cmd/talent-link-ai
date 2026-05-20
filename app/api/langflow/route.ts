import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const targetUrl = process.env.LANGFLOW_URL || "http://localhost:7860/api/v1/run/2db123bf-c4f4-4d08-957f-83f69aff1356";
    const token = process.env.LANGFLOW_TOKEN || "sk-AguW-yCN35zE7ynGOc9rI8rHFuC36ZI-vjGEVJJk3pg";

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': token,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        input_value: message,
        output_type: 'chat',
        input_type: 'chat'
      })
    });

    const data = await response.json();
    console.log("Raw Langflow Response Data:", JSON.stringify(data));
    
    // FAIL-SAFE EXTRACTION LADDER
    let cleanText = "";
    
    if (data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
      cleanText = data.outputs[0].outputs[0].results.message.text;
    } else if (data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message) {
      cleanText = data.outputs[0].outputs[0].messages[0].message;
    } else if (data?.result) {
      cleanText = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
    } else if (data?.output) {
      cleanText = data.output;
    } else {
      // If we got valid data but formatting is off, show a fallback excerpt instead of dropping
      cleanText = data ? "Response processed. Try viewing results via evaluation cards." : "No output returned.";
    }
    
    return NextResponse.json({ text: cleanText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}