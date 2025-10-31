// app/api/rankForJob/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

// --- (!!! นี่คือจุดแก้ไข TypeScript Error !!!) ---
// (แก้ไข Interface นี้ให้ถูกต้อง)
interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  cv_url: string; // (แก้ไข) ลบ '?' และ '| null' ออก
  matching_score: number;
  ai_summary: string;
  position: string;
  name: string; 
  cvUrl: string; // (แก้ไข) ลบ '?' และ '| null' ออก
}
// --- (!!! สิ้นสุดการแก้ไข !!!) ---


// --- 1. (ตั้งค่า Gemini) ---
const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error("Missing GOOGLE_API_KEY from .env.local");
}
const genAI = new GoogleGenerativeAI(googleApiKey);

// --- 2. (ใช้ 'gemini-1.5-flash' ตามที่คุณต้องการ) ---
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 


// --- 3. (ฟังก์ชัน AI ใหม่) ---
async function getAIRankingFromPDF(pdfBuffer: Buffer, jdText: string) {
  
  const prompt = `
    คุณคือผู้เชี่ยวชาญด้าน HR
    วิเคราะห์ไฟล์ PDF (CV) ที่แนบมานี้ เทียบกับ Job Description (JD) ที่ให้มา
    และตอบกลับเป็น JSON object ที่ถูกต้องเท่านั้น
    JSON object ต้องมี keys:
    1. "matchingScore": ตัวเลข (0-100)
    2. "aiSummary": สรุปโปรไฟล์ของผู้สมัคร 2-3 ประโยค
    
    JD: """${jdText}"""
  `;
  
  const pdfBase64 = pdfBuffer.toString("base64");

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: pdfBase64,
          mimeType: "application/pdf"
        }
      }
    ]);
    
    const textResponse = result.response.text();
    const aiResult = JSON.parse(textResponse);
    
    return {
      score: aiResult.matchingScore || 0,
      summary: aiResult.aiSummary || "No summary."
    };

  } catch (error: any) { 
    console.error("Gemini 1.5 (Flash) call failed:", error.message);
    if (error.response && error.response.promptFeedback?.blockReason) {
      console.error("Blocked by safety settings:", error.response.promptFeedback.blockReason);
      return { score: 0, summary: `Analysis blocked: ${error.response.promptFeedback.blockReason}` };
    }
    // (นี่คือที่มาของ Error)
    return { score: 0, summary: "Error during AI analysis." };
  }
}


// --- 4. (ฟังก์ชัน POST) ---
export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // 1. ดึง JD (เหมือนเดิม)
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("job_descriptions")
      .select("description, title") 
      .eq("id", jobId)
      .single();
    if (jobError || !jobData) throw new Error(`Job Description not found (ID: ${jobId}).`);
    const jdText = jobData.description;
    const jdTitle = jobData.title;


    // 2. ดึง Applicants ที่ยังไม่มีคะแนนสำหรับ Job นี้
    const { data: applicantsToRank, error: appError } = await supabaseAdminClient
      .from("applicants")
      .select("id, firstName, lastName, cv_url") 
      .not("cv_url", "is", null) // (กรองคนมี CV)
      .or(`position.neq.${jdTitle},matching_score.is.null`) 
      .limit(10); 

    if (appError) throw new Error(`Failed to fetch applicants: ${appError.message}`);

    // 3. ถ้าไม่มีคนใหม่ให้ Rank -> ดึงคนเก่ามาแสดง
    if (!applicantsToRank || applicantsToRank.length === 0) {
      console.log(`No new applicants to rank for Job ID ${jobId}. Fetching existing ranks.`);
      const { data: rankedApplicants, error: rankError } = await supabaseAdminClient
        .from("applicants")
        .select("*") 
        .eq("position", jdTitle) 
        .not("matching_score", "is", null) 
        .order("matching_score", { ascending: false })
        .limit(10);
      
      if (rankError) throw new Error(`Failed to fetch existing ranks: ${rankError.message}`);

      const top10 = rankedApplicants?.map(a => ({
        ...a, 
        name: `${a.firstName} ${a.lastName}`, 
        cvUrl: a.cv_url 
      })) || [];
      return NextResponse.json({ top10, message: "Displayed existing ranks." });
    }

    // 4. ถ้ามีคนใหม่ -> วนลูป, ดาวน์โหลด PDF, และเรียก AI
    console.log(`Found ${applicantsToRank.length} new applicants to rank...`);
    
    const rankingPromises = applicantsToRank.map(async (applicant) => {
      if (!applicant.cv_url) return null; 

      try {
        // a. ดาวน์โหลดไฟล์ PDF
        const fileResponse = await fetch(applicant.cv_url);
        if (!fileResponse.ok) throw new Error(`Failed to download CV for ${applicant.id}`);
        const pdfBuffer = Buffer.from(await fileResponse.arrayBuffer());

        // b. เรียก AI
        const { score, summary } = await getAIRankingFromPDF(pdfBuffer, jdText);

        // c. อัปเดตคะแนนลง DB
        const { error: updateError } = await supabaseAdminClient
          .from("applicants")
          .update({
            matching_score: score,
            ai_summary: summary,
          })
          .eq("id", applicant.id);

        if (updateError) console.error(`Failed to update DB for ${applicant.id}: ${updateError.message}`);

        return {
          ...applicant,
          cv_url: applicant.cv_url, 
          matching_score: score,
          ai_summary: summary,
          position: jdTitle,
          name: `${applicant.firstName} ${applicant.lastName}`,
          cvUrl: applicant.cv_url 
        };

      } catch (downloadError: any) {
        console.error(`Failed to process CV for applicant ${applicant.id}: ${downloadError.message}`);
        return null; 
      }
    });

    // (บรรทัดนี้จะไม่ Error แล้ว)
    let allResults = (await Promise.all(rankingPromises)).filter((result): result is Applicant => result !== null);

    // 5. จัดอันดับและส่ง Top 10 กลับ
    allResults.sort((a, b) => (b?.matching_score || 0) - (a?.matching_score || 0));
    const top10 = allResults.slice(0, 10);

    return NextResponse.json({ top10 });

  } catch (error: any) {
    console.error("Error in /api/rankForJob:", error.message);
    if (error.message.includes("API key not valid") || error.message.includes("blocked") || error.message.includes("permission")) {
         return NextResponse.json({ error: `Gemini API Error: ${error.message}. Please check your GOOGLE_API_KEY settings.` }, { status: 500 });
    }
    return NextResponse.json({ error: `API Error: ${error.message}` }, { status: 500 });
  }
}