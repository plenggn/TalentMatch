// app/api/draftEmail/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

// --- Configuration ---
const GEMINI_MODEL = "gemini-2.5-pro"; // (ใช้ Model เดิมของคุณ)
const MAX_TOKENS = 2000;

const geminiApiKey = process.env.GOOGLE_API_KEY;
if (!geminiApiKey) {
    throw new Error("Missing GOOGLE_API_KEY for Gemini API.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// -------------------------------------------------------
// Helper: Get AI Data from DB
// -------------------------------------------------------
async function getApplicantAnalysisData(applicantId: string) {
    // (ดึงข้อมูลผู้สมัคร พร้อม Join ชื่อตำแหน่ง)
    const { data, error } = await supabaseAdminClient
        .from('applicants')
        .select(`
            firstName, lastName, status,
            ai_summary, overview, strengths, potential_gaps,
            job_descriptions ( title )
        `)
        .eq('id', applicantId)
        .single();

    if (error || !data) {
        throw new Error(`Applicant analysis data not found for ID: ${applicantId}.`);
    }
    
    // (จัดการข้อมูลที่ Join มา)
    const positionTitle = (data.job_descriptions as any)?.title || "the position";

    return {
        ...data,
        position: positionTitle, 
    };
}

// -------------------------------------------------------
// Helper: Build Gemini Prompt
// -------------------------------------------------------
// --- [!!! 1. MODIFY PROMPT HELPER !!!] ---
function buildEmailPrompt(data: any, emailType: 'offer' | 'rejection', hrName: string) {
    const { firstName, lastName, position, strengths, potential_gaps } = data;
    const name = `${firstName} ${lastName}`;
    const strengthsList = strengths.map((s: string) => ` - ${s}`).join('\n');
    const gapsList = potential_gaps.map((g: string) => ` - ${g}`).join('\n');
    const signature = hrName || "HR Team"; // (Fallback)

    if (emailType === 'offer') {
        return `
            You are an HR Director drafting a highly personalized and professional **OFFER LETTER** email to a top candidate.
            The tone must be enthusiastic, encouraging, and highlight their specific fit.
            
            **Candidate**: ${name}
            **Position Offered**: ${position}
            **Your (HR) Name**: ${signature}
            
            **Instructions**:
            1. Use a professional and friendly tone.
            2. In the body, reference their core strengths (from the Strengths list) to explain WHY they were chosen.
            3. Clearly state the position and invite them to accept.
            4. The response MUST be ONLY the complete email draft in **Markdown format**.
            5. Sign off using the **Your (HR) Name** (e.g., "Sincerely,\n${signature}").
            
            --- Candidate Strengths ---
            ${strengthsList || "No specific strengths identified, focus on the overall profile."}
        `;
    } else { // rejection
        return `
            You are an HR Manager drafting a professional and constructive **REJECTION EMAIL** to a candidate.
            The goal is to maintain a positive employer brand and offer helpful feedback.
            
            **Candidate**: ${name}
            **Position Applied**: ${position}
            **Your (HR) Name**: ${signature}
            
            **Instructions**:
            1. Use a professional, empathetic tone.
            2. State clearly that they will not be moving forward.
            3. Crucially: Use the Potential Gaps list to provide **CONSTRUCTIVE, ACTIONABLE feedback** on skills they should develop for future opportunities. Avoid negative phrasing.
            4. The response MUST be ONLY the complete email draft in **Markdown format**.
            5. Sign off using the **Your (HR) Name** (e.g., "Sincerely,\n${signature}").
            
            --- Candidate Potential Gaps ---
            ${gapsList || "No specific gaps were identified in the analysis."}
        `;
    }
}
// --- [!!! END MODIFY !!!] ---


// -------------------------------------------------------
// Main API Handler
// -------------------------------------------------------
export async function POST(req: NextRequest) {
    try {
        // --- [!!! 2. MODIFY API BODY !!!] ---
        const { applicantId, emailType, hrName } = await req.json(); // (ADDED hrName)
        // --- [!!! END MODIFY !!!] ---

        if (!applicantId || !emailType) {
            return NextResponse.json({ error: "Missing applicantId or emailType" }, { status: 400 });
        }

        const analysisData = await getApplicantAnalysisData(applicantId);
        // --- [!!! 3. MODIFY PROMPT CALL !!!] ---
        const prompt = buildEmailPrompt(analysisData, emailType, hrName); // (ADDED hrName)
        // --- [!!! END MODIFY !!!] ---

        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { 
                maxOutputTokens: MAX_TOKENS,
                temperature: 0.7, 
            }
        });

        const emailDraft = result.response.text().trim();

        if (!emailDraft) {
            throw new Error("AI failed to generate email draft.");
        }

        // อัปเดตสถานะใน DB ตามประเภทอีเมลที่ดราฟต์
        const newStatus = emailType === 'offer' ? 'Offered' : 'Rejected';
        await supabaseAdminClient.from('applicants').update({ status: newStatus }).eq('id', applicantId);


        return NextResponse.json({
            draft: emailDraft,
            statusUpdate: newStatus,
        });

    } catch (error: any) {
        console.error("Error in /api/draftEmail:", error.message);
        return NextResponse.json({ error: `Drafting failed: ${error.message}` }, { status: 500 });
    }
}