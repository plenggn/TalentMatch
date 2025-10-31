// app/api/matchCVtoJD/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

// 2. ตรวจสอบ API Keys (ย้ายมาไว้ด้านนอก)
const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error("Missing GOOGLE_API_KEY");
}
const genAI = new GoogleGenerativeAI(googleApiKey);


// 3. สร้างฟังก์ชัน POST (ไม่ใช่ handler)
export async function POST(req: NextRequest) {
  try {
    const { applicantId, jobId } = await req.json(); // 4. รับ body แบบใหม่

    if (!applicantId || !jobId) {
      return NextResponse.json({ error: "ApplicantID and JobID are required" }, { status: 400 });
    }

    // === ส่วนที่ 1: ดึงข้อมูลจาก Supabase ===
    const { data: cvData, error: cvError } = await supabaseAdminClient
      .from('cvs')
      .select('text')
      .eq('upload_by', applicantId)
      .single();

    if (cvError || !cvData) {
      throw new Error(`CV text not found for applicant ${applicantId}. ${cvError?.message || ''}`);
    }
    const cvText = cvData.text;

    // (***สำคัญ***: แก้ 'description' ให้เป็นชื่อคอลัมน์ JD จริงของคุณ)
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from('job_descriptions')
      .select('title, description') // <-- ตรวจสอบชื่อคอลัมน์ 'description'
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      throw new Error(`Job Description not found for job ${jobId}. ${jobError?.message || ''}`);
    }
    const jdText = jobData.description;
    const jobTitle = jobData.title;

    // === ส่วนที่ 2: เรียกใช้ Google AI (Gemini) ===
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // ✅ Prompt ภาษาอังกฤษ (ขยาย Prompt เดิม)
    const prompt = `
      You are a Senior HR Expert.
      Analyze the following CV text and Job Description (JD) text carefully, and respond ONLY with a valid JSON object.
      The JSON object must strictly contain these keys:
      1. "matchingScore": A number (0-100) assessing suitability.
      2. "aiSummary": (General CV Summary) 2-3 sentence summary of the candidate's profile (e.g., "Software Engineer with 5 years experience...") *without* reference to the JD.
      3. "overview": (Job Fit Summary) 2-3 sentence explanation why the candidate is (or isn't) a *good fit for this specific JD*.
      4. "strengths": Array of strings listing key strengths *relevant to this JD*.
      5. "potentialGaps": Array of strings listing required skills from the JD that are *missing from the CV*.
      6. "potentialPrediction": String containing prediction of the candidate's growth potential (e.g., "Likely to be ready for Senior Data Analyst within 12-18 months"). (NEW)
      7. "personalityInference": String containing inference about the candidate's personality/work style (e.g., "Tone is decisive and focused on results."). (NEW)
    `;

    const result = await model.generateContent([prompt, `CV: """${cvText}"""`, `JD: """${jdText}"""`]);
    const response = result.response;
    const textResponse = response.text();

    let aiResult;
    try {
      aiResult = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("AI response is not valid JSON:", textResponse);
      throw new Error("AI returned invalid JSON.");
    }

    // === ส่วนที่ 3: อัปเดตข้อมูลลงตาราง 'applicants' ===
    const { data: updatedApplicant, error: updateError } = await supabaseAdminClient
      .from('applicants')
      .update({
        matching_score: aiResult.matchingScore,
        ai_summary: aiResult.aiSummary,
        overview: aiResult.overview,
        strengths: aiResult.strengths,
        potential_gaps: aiResult.potentialGaps, 
    
        potential_prediction: aiResult.potentialPrediction,
        personality_inference: aiResult.personalityInference,
      })
      .eq('id', applicantId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update applicant data: ${updateError.message}`);
    }

    // 5. ส่ง Response กลับแบบใหม่
    return NextResponse.json({
      message: "Matching complete!",
      updatedApplicant: updatedApplicant,
    });

  } catch (error: any) {
    console.error("Error in /api/matchCVtoJD:", error);
    // 6. ส่ง Error กลับแบบใหม่
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}