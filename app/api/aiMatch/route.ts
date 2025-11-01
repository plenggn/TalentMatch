// app/api/aiMatch/route.ts
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

// --- Configuration ---
// (ใช้ Model Name เดิมของคุณ)
const GEMINI_MODEL_NAME = "gemini-2.5-pro"; 
const MAX_APPLICANTS_TO_PROCESS = 10;
const MAX_JOBS_TO_PROCESS = 20;
type MatchMode = 'jobToApplicants' | 'applicantToJobs';

// --- Setup API Keys ---
const geminiApiKey = process.env.GOOGLE_API_KEY;
const visionApiKey = process.env.GOOGLE_VISION_API_KEY;

if (!geminiApiKey) { throw new Error("Missing GOOGLE_API_KEY (for Gemini) from .env.local"); }
if (!visionApiKey) { throw new Error("Missing GOOGLE_VISION_API_KEY (for Vision) from .env.local"); }

// (Helper Functions: getTextFromPDF_VisionAPI)
async function getTextFromPDF_VisionAPI(pdfBuffer: Buffer): Promise<string> { 
  console.log("Calling Google Vision REST API (using Vision Key) to extract text..."); 
  const pdfBufferAsBase64 = pdfBuffer.toString('base64'); 
  const visionApiUrl = `https://vision.googleapis.com/v1/files:annotate?key=${visionApiKey}`; 
  const requestPayload = { requests: [{ inputConfig: { content: pdfBufferAsBase64, mimeType: 'application/pdf' }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }], }], }; 
  try { const visionResponse = await fetch(visionApiUrl, { method: 'POST', body: JSON.stringify(requestPayload), headers: { 'Content-Type': 'application/json' }, }); const result = await visionResponse.json(); if (!visionResponse.ok) { const errorDetails = result.error?.message || JSON.stringify(result); throw new Error(`Google Vision API Error: ${errorDetails}`); } const fileResponseData = result.responses?.[0]; let extractedText = ""; if (fileResponseData?.responses) { for (const pageResponse of fileResponseData.responses) { if (pageResponse.fullTextAnnotation) { extractedText += pageResponse.fullTextAnnotation.text + "\n"; } } } if (!extractedText) { if (fileResponseData?.error) throw new Error(`Google Vision API Error: ${fileResponseData.error.message}`); console.warn("Vision API did not return text.", JSON.stringify(result, null, 2)); throw new Error("Vision API could not extract text."); } console.log("Google Vision API extracted text successfully."); return extractedText; } catch (error: any) { console.error("Vision API call failed:", error.message); throw error; } 
}

// (Helper Function: getAIRankingFromText_Fetch)
async function getAIRankingFromText_Fetch(cvText: string, jdText: string): Promise<{ 
  score: number; 
  summary: string; 
  overview?: string; 
  strengths?: string[]; 
  potential_gaps?: string[];
  potential_prediction?: string; 
  personality_inference?: string; 
}> { 
  console.log(`Calling Gemini API (${GEMINI_MODEL_NAME}) via Fetch with English prompt...`); 
  // (ใช้ v1beta ตามเดิม)
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent?key=${geminiApiKey}`; 
  const promptText = `
    Analyze the following CV text and Job Description (JD) text carefully.
    JD: """${jdText}"""
    CV: """${cvText}"""
    Your response MUST be ONLY a valid JSON object. Do not include any introductory text, explanations, markdown formatting, or closing remarks.
    The JSON object must strictly contain these keys and value types:
    1. "matchingScore": A number (integer between 0 and 100) assessing the CV's suitability for the provided JD.
    2. "aiSummary": A string containing a 2-3 sentence summary of the candidate's profile and experience based ONLY on the CV text.
    3. "overview": A string containing a 2-3 sentence overview explaining why the candidate is (or isn't) a good fit for this specific JD.
    4. "strengths": An array of strings (max 5 items) listing the candidate's key strengths that are relevant to this JD.
    5. "potentialGaps": An array of strings (max 3 items) listing important skills or qualifications required by the JD that seem missing or unclear in the CV text.
    6. "potentialPrediction": A string containing a short prediction (1-2 sentences) about the candidate's growth potential in this role or company. (NEW)
    7. "personalityInference": A string containing a short inference (1-2 sentences) about the candidate's personality/work style based on the tone and content of the CV. (NEW)
  `; 
  const requestBody = { contents: [{ parts: [{ text: promptText }] }] }; 
  let responseText = ''; 
  try { 
    const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }); 
    if (!response.ok) { let errorBody = {}; try { errorBody = await response.json(); } catch (e) {} const errorDetails = (errorBody as any)?.error?.message || `HTTP error! Status: ${response.status}`; throw new Error(`Gemini API Fetch Error: ${errorDetails}`); } 
    const data = await response.json(); 
    responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text; 
    if (!responseText) { console.warn("Gemini API (Fetch) returned empty text.", JSON.stringify(data, null, 2)); throw new Error("AI response was empty."); } 
    let cleanedText = responseText.trim(); 
    if (cleanedText.startsWith("```json")) { cleanedText = cleanedText.substring(7); } 
    else if (cleanedText.startsWith("```")) { cleanedText = cleanedText.substring(3); }
    if (cleanedText.endsWith("```")) { cleanedText = cleanedText.substring(0, cleanedText.length - 3); }
    cleanedText = cleanedText.trim(); 
    const aiResult = JSON.parse(cleanedText); 
    if (typeof aiResult.matchingScore === 'undefined' || typeof aiResult.aiSummary === 'undefined') { console.warn("AI response JSON missing required keys:", cleanedText); throw new Error("AI response JSON missing required keys."); } 
    return { 
      score: parseInt(aiResult.matchingScore) || 0, 
      summary: aiResult.aiSummary || "No summary provided.", 
      overview: aiResult.overview || undefined, 
      strengths: Array.isArray(aiResult.strengths) ? aiResult.strengths : [], 
      potential_gaps: Array.isArray(aiResult.potentialGaps) ? aiResult.potentialGaps : [],
      potential_prediction: aiResult.potentialPrediction || undefined,
      personality_inference: aiResult.personalityInference || undefined,
    }; 
  } catch (error: any) { 
    console.error(`Gemini (${GEMINI_MODEL_NAME}) Fetch call processing failed:`, error.message); 
    if (error instanceof SyntaxError && responseText) { console.error("--- Raw AI Response (Still Invalid JSON after cleaning attempt) ---"); console.error(responseText); console.error("------------------------------------"); } 
    let errorMessage = `Error during AI analysis (Gemini ${GEMINI_MODEL_NAME} via Fetch).`; 
    if (error.message.includes("API key not valid") || error.message.includes("blocked") || error.message.includes("permission denied") || error.message.includes("API not enabled") || error.message.includes("not found")) { errorMessage = `Gemini API Key/Model Error: ${error.message}. Check Key and API permissions.`; } 
    else if (error instanceof SyntaxError) { errorMessage = "AI returned invalid JSON after cleaning attempt."; } 
    else if (error.message.includes("AI response JSON missing required keys")) { errorMessage = error.message; } 
    return { score: 0, summary: errorMessage }; 
  } 
}


// --- Main API Handler ---
export async function POST(req: NextRequest) {
  try {
    const { mode, targetId }: { mode: MatchMode, targetId: string } = await req.json();
    if (!mode || !targetId) { return NextResponse.json({ error: "Missing 'mode' or 'targetId'" }, { status: 400 }); }

    // --- Mode 1: Find Best Applicants for a Job ---
    if (mode === 'jobToApplicants') {
      const jobId = targetId;
      const { data: jobData, error: jobError } = await supabaseAdminClient.from('job_descriptions').select('description, title').eq('id', jobId).single();
      if (jobError || !jobData) throw new Error(`Job Description not found (ID: ${jobId}).`);
      const jdText = jobData.description; 
      const jobTitle = jobData.title;
      
      // (ดึง Applicants ที่สมัคร "Job นี้" และมี CV - Logic นี้ถูกต้องตามที่คุณต้องการ)
      const { data: applicantsToProcess, error: appError } = await supabaseAdminClient
        .from('applicants')
        .select('id, firstName, lastName, cv_url')
        .not('cv_url', 'is', null) 
        .eq('job_id', jobId) // <-- (FIX) กรองเฉพาะคนที่สมัคร Job นี้
        .limit(MAX_APPLICANTS_TO_PROCESS);
      
      if (appError) console.error("Error fetching applicants:", appError.message);
      
      if (!applicantsToProcess || applicantsToProcess.length === 0) {
           return NextResponse.json({ results: [], message: "No applicants (with CVs) have applied for this specific job." }); 
      }

      // 2. ประมวลผล Applicants
      console.log(`Found ${applicantsToProcess.length} applicants to rank...`);
      
      const rankingPromises = applicantsToProcess.map(async (applicant) => {
        const { id, firstName, lastName, cv_url } = applicant;
        if (!cv_url) return null;
        let score = 0; let summary = `Processing failed for ${id}`; 
        let overview, strengths, potential_gaps, potential_prediction, personality_inference;
        
        try {
          const fileResponse = await fetch(cv_url); if (!fileResponse.ok) throw new Error(`Download failed`); const pdfBuffer = Buffer.from(await fileResponse.arrayBuffer());
          const cvText = await getTextFromPDF_VisionAPI(pdfBuffer);
          const analysisResult = await getAIRankingFromText_Fetch(cvText, jdText);
          score = analysisResult.score; summary = analysisResult.summary; 
          overview = analysisResult.overview; strengths = analysisResult.strengths; 
          potential_gaps = analysisResult.potential_gaps;
          potential_prediction = analysisResult.potential_prediction;
          personality_inference = analysisResult.personality_inference;
          
          // --- [!!! นี่คือจุดแก้ไข (แก้ Error Log) !!!] ---
          // (เปลี่ยนจาก 'applicant_job_matches' เป็น 'applicants' และใช้ .update)
          const { error: updateError } = await supabaseAdminClient
            .from('applicants') // <-- (FIX 1)
            .update({ 
              matching_score: score,
              ai_summary: summary,
              overview: overview, 
              strengths: strengths, 
              potential_gaps: potential_gaps, 
              potential_prediction: potential_prediction,
              personality_inference: personality_inference,
            })
            .eq('id', id); // <-- (FIX 2)

          if (updateError) console.error(`Failed to update applicant ${id} with match results: ${updateError.message}`);
          // --- [!!! สิ้นสุดการแก้ไข !!!] ---

        } catch (processError: any) { 
          console.error(`Failed processing applicant ${id}: ${processError.message}`); 
          summary = `Processing failed: ${processError.message.substring(0, 150)}`; 
          
          // --- [!!! นี่คือจุดแก้ไข (Error Handling) !!!] ---
          try { 
              await supabaseAdminClient
                .from('applicants') // <-- (FIX 3)
                .update({ 
                  matching_score: 0,
                  ai_summary: summary,
                  overview: "Processing failed.",
                  strengths: [],
                  potential_gaps: [],
                })
                .eq('id', id); // <-- (FIX 4)
          } catch (dbError) { console.error(`Failed update DB error status for ${id}:`, dbError); } 
          // --- [!!! สิ้นสุดการแก้ไข !!!] ---
        }
        
        // 4. ส่งผลลัพธ์ใหม่กลับไป Frontend
        return { 
          id, name: `${firstName} ${lastName}`, matching_score: score, ai_summary: summary, cvUrl: cv_url,
          matched_job_id: jobId,
          matched_job_title: jobTitle,
          is_locked: true, 
        };
      });
      
      let finalResults = (await Promise.all(rankingPromises)).filter(r => r !== null);
      
      finalResults.sort((a, b) => (b?.matching_score || 0) - (a?.matching_score || 0));
      const top10 = finalResults.slice(0, 10);
      
      return NextResponse.json({ results: top10 });
    }

    // --- Mode 2: Find Best Jobs for an Applicant (Logic เดิม) ---
    else if (mode === 'applicantToJobs') {
        const applicantId = targetId;
        const { data: applicantData, error: appError } = await supabaseAdminClient.from('applicants').select('id, firstName, lastName, cv_url').eq('id', applicantId).single(); if (appError || !applicantData || !applicantData.cv_url) throw new Error(`Applicant or CV URL not found (ID: ${applicantId}).`); const applicantName = `${applicantData.firstName} ${applicantData.lastName}`; let pdfBuffer: Buffer; try { const fileResponse = await fetch(applicantData.cv_url); if (!fileResponse.ok) throw new Error(`Download failed`); pdfBuffer = Buffer.from(await fileResponse.arrayBuffer()); } catch(downloadError: any) { throw new Error(`CV Download failed: ${downloadError.message}`); }
        const { data: jobs, error: jobError } = await supabaseAdminClient.from('job_descriptions').select('id, title, description').limit(MAX_JOBS_TO_PROCESS); if (jobError) throw new Error(`Failed to fetch jobs: ${jobError.message}`); if (!jobs || jobs.length === 0) return NextResponse.json({ results: [], message: "No jobs found to match against." });
        let cvText: string; try { cvText = await getTextFromPDF_VisionAPI(pdfBuffer); } catch (visionError: any) { console.error(`Vision API failed for applicant ${applicantId} CV: ${visionError.message}`); throw new Error(`Could not read CV using Vision API: ${visionError.message}`); }
        const resultsPromises = jobs.map(async (job) => {
            const jdText = job.description; let score = 0; let summary = `Processing failed for Job ${job.id}`;
            try { 
              const analysisResult = await getAIRankingFromText_Fetch(cvText, jdText); 
              score = analysisResult.score; 
              summary = analysisResult.summary; 
            } catch (geminiError: any) { 
              console.error(`Gemini failed for job ${job.id} / applicant ${applicantId}: ${geminiError.message}`); 
              summary = `AI analysis failed: ${geminiError.message.substring(0, 150)}`; 
            }
            return { id: job.id, title: job.title, matching_score: score, ai_summary: summary }; });
        let results = await Promise.all(resultsPromises); results.sort((a, b) => (b?.matching_score || 0) - (a?.matching_score || 0));
        return NextResponse.json({ results, applicantName });
    }

    else { return NextResponse.json({ error: "Invalid 'mode' specified" }, { status: 400 }); }
  } catch (error: any) { console.error("Error in /api/aiMatch:", error.message); if (error.message.includes("API key not valid") || error.message.includes("blocked") || error.message.includes("permission denied") || error.message.includes("API not enabled") || error.message.includes("not found")) { return NextResponse.json({ error: `API Error: ${error.message}. Please check API Key permissions.` }, { status: 500 }); } return NextResponse.json({ error: `API Error: ${error.message}` }, { status: 500 }); }
}