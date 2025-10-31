import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";


const GEMINI_CHAT_MODEL = "gemini-2.5-flash"; 
const MAX_TOKENS = 1500;


const geminiApiKey = process.env.GOOGLE_API_KEY;
const visionApiKey = process.env.GOOGLE_VISION_API_KEY;

if (!geminiApiKey) {
    throw new Error("Missing GOOGLE_API_KEY for Gemini Chat API.");
}
if (!visionApiKey) {
    throw new Error("Missing GOOGLE_VISION_API_KEY for Vision API.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey); 


async function getTextFromPDF_VisionAPI(pdfBuffer: Buffer): Promise<string> { 
  const pdfBufferAsBase64 = pdfBuffer.toString('base64'); 
  const visionApiUrl = `https://vision.googleapis.com/v1/files:annotate?key=${visionApiKey}`; 
  const requestPayload = { requests: [{ inputConfig: { content: pdfBufferAsBase64, mimeType: 'application/pdf' }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }], }], }; 
  try { 
    const visionResponse = await fetch(visionApiUrl, { method: 'POST', body: JSON.stringify(requestPayload), headers: { 'Content-Type': 'application/json' }, }); 
    const result = await visionResponse.json(); 
    if (!visionResponse.ok) { const errorDetails = result.error?.message || JSON.stringify(result); throw new Error(`Google Vision API Error: ${errorDetails}`); } 
    const fileResponseData = result.responses?.[0]; 
    let extractedText = ""; 
    if (fileResponseData?.responses) { 
      for (const pageResponse of fileResponseData.responses) { 
        if (pageResponse.fullTextAnnotation) { extractedText += pageResponse.fullTextAnnotation.text + "\n"; } 
      } 
    } 
    if (!extractedText) { 
        if (fileResponseData?.error) throw new Error(`Google Vision API Error: ${fileResponseData.error.message}`); 
        throw new Error("Vision API could not extract text."); 
    } 
    return extractedText; 
  } catch (error: any) { 
    console.error("Vision API call failed:", error.message); 
    throw error; 
  } 
}


export async function POST(req: NextRequest) {
  try {
    const { applicantId, userQuery } = await req.json();

    if (!applicantId || !userQuery) {
      return NextResponse.json(
        { error: "Missing applicantId or userQuery" },
        { status: 400 }
      );
    }


    const { data: applicantData, error: appError } = await supabaseAdminClient
        .from("applicants")
        .select("firstName, lastName, cv_url")
        .eq("id", applicantId)
        .maybeSingle();

 if (appError || !applicantData?.cv_url) {
        const name = applicantData 
            ? `${applicantData.firstName} ${applicantData.lastName}`
            : `Applicant ID ${applicantId}`;

        const errorMessage = appError
            ? `Database Error (applicants table): ${appError.message}`
            : `Error: Candidate ${name} (ID: ${applicantId}) does not have a CV URL.`;

        return NextResponse.json({ 
            responseText: errorMessage 
        });
 }

    const cvUrl = applicantData.cv_url;
    let cvText: string;

    try {
        const fileResponse = await fetch(cvUrl);
        if (!fileResponse.ok) throw new Error(`Failed to download CV from URL.`);
        const pdfBuffer = Buffer.from(await fileResponse.arrayBuffer());

        cvText = await getTextFromPDF_VisionAPI(pdfBuffer);
    } catch (processError: any) {
        console.error("CV Processing Error:", processError);
        return NextResponse.json({ 
            responseText: `Error: Failed to process CV. Vision API Error: ${processError.message.substring(0, 150)}` 
        });
    }



 const prompt = `
You are a concise, highly insightful AI HR Analyst. Your task is to analyze and synthesize the CV text to answer the user's questions based ONLY on the provided document.

**STRICT SYNTHESIS RULE (CRITICAL):**
If the user's question requires analysis, synthesis, or inference (e.g., "What are their key strengths?", "Summarize their work experience"), you MUST analyze and infer the best answer based on the facts presented in the CV. Do NOT limit your answer to only explicitly stated facts.

**ABSENCE RULE (No more "Not mentioned in CV."):**
If the information requested is entirely absent and cannot be inferred from the CV, you must state this clearly using a professional alternative.
**DO NOT use the exact phrase "Not mentioned in CV."** Use alternatives like "This information is not available in the provided CV." or "The CV does not contain this detail."

**STRICT FORMATTING RULES:**
1. Keep the answer as brief as possible, focusing only on the requested information.
2. Use **Markdown** (e.g., **bold**, lists, headers) to structure the response clearly.
3. If the answer is long, use **bullet points** or **subheadings (###)**.
4. Never return long, dense paragraphs.

--- CV TEXT ---
${cvText}

--- USER QUESTION ---
${userQuery}
`;


 const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_MODEL });
    
    // Config สำหรับ generateContent
    const config = {
        generationConfig: {
            maxOutputTokens: MAX_TOKENS,
        }
    };

 const result = await model.generateContent(
        prompt, 
        config  
    );

 const responseText = result?.response?.text()?.trim() ?? "AI did not return any response.";


 return NextResponse.json({ responseText });
 } catch (error: any) {
 console.error("Error in /api/cvChat:", error);
return NextResponse.json(
{ error: `AI server processing failed: ${error.message}` },
 { status: 500 }
);
 }
}