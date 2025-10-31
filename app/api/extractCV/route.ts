// app/api/extractCV/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
// 1. (ลบออก) ไม่ต้อง import { ImageAnnotatorClient } อีกต่อไป
import { supabaseAdminClient } from "../../../lib/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

// Client สำหรับ Gemini (ยังใช้เหมือนเดิม)
const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  // 3. (แก้ไข) เปลี่ยนข้อความ Error ให้ชัดเจน
  throw new Error("Missing GOOGLE_API_KEY from .env.local (This key is used for both Gemini and Vision API)");
}
const genAI = new GoogleGenerativeAI(googleApiKey);

// 2. (ลบออก) ไม่ต้องสร้าง visionClient

export async function POST(req: NextRequest) {
  try {
    const { applicantId, fileUrl } = await req.json();

    if (!fileUrl || !applicantId) {
      return NextResponse.json({ error: "Missing fileUrl or applicantId" }, { status: 400 });
    }

    // --- ดาวน์โหลดไฟล์ PDF (เหมือนเดิม) ---
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }
    const fileBuffer = await fileResponse.arrayBuffer();

    // --- 4. (ใหม่) เรียกใช้ Google Vision REST API ด้วย 'fetch' ---
    console.log("Calling Google Vision REST API (using API Key)...");
    const pdfBufferAsBase64 = Buffer.from(fileBuffer).toString('base64');
    
    // นี่คือ URL ของ Vision REST API
    const visionApiUrl = `https://vision.googleapis.com/v1/files:annotate?key=${googleApiKey}`;

    // นี่คือ Payload ที่เราจะส่ง (เหมือนเดิม)
    const requestPayload = {
      requests: [
        {
          inputConfig: {
            content: pdfBufferAsBase64,
            mimeType: 'application/pdf',
          },
          features: [
            { type: 'DOCUMENT_TEXT_DETECTION' },
          ],
        },
      ],
    };

    // ยิง 'fetch' ไปยัง Google
    const visionResponse = await fetch(visionApiUrl, {
      method: 'POST',
      body: JSON.stringify(requestPayload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await visionResponse.json();

    if (!visionResponse.ok) {
      // ถ้า Error ใหแสดง Error จาก Google โดยตรง
      const errorDetails = result.error?.message || JSON.stringify(result);
      throw new Error(`Google Vision API Error: ${errorDetails}`);
    }
    
    // --- 5. (แก้ไขเล็กน้อย) โครงสร้าง JSON ที่ได้กลับมาจะเหมือนเดิม ---
    const fileResponseData = result.responses?.[0];
    let cvText = "";

    if (fileResponseData && fileResponseData.responses) {
      // วนลูปทุกหน้า (เหมือนเดิม)
      for (const pageResponse of fileResponseData.responses) {
        if (pageResponse.fullTextAnnotation) {
          cvText += pageResponse.fullTextAnnotation.text + "\n"; 
        }
      }
    } else {
      console.warn("Vision API did not return text annotation.", JSON.stringify(result, null, 2));
    }

    if (!cvText) {
      if (fileResponseData && fileResponseData.error) {
          throw new Error(`Google Vision API Error: ${fileResponseData.error.message}`);
      }
      throw new Error("Google Vision API could not extract text from the PDF.");
    }
    
    console.log("Google Vision API extracted text successfully.");
    
    // --- (เหมือนเดิม) เรียกใช้ Gemini เพื่อสกัดข้อมูล ---
    let extractedData = { firstName: null, lastName: null, position: null, experience: null };

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
        วิเคราะห์ข้อความ CV นี้ และสกัดข้อมูลเป็น JSON object ที่ถูกต้อง
        JSON keys: "firstName", "lastName", "position", "experience" (เป็นตัวเลข)
        CV: """${cvText}"""
    `;
    try {
        const geminiResult = await model.generateContent(prompt);
        const textResponse = geminiResult.response.text();
        extractedData = JSON.parse(textResponse);
    } catch (geminiError: any) {
        console.error("Gemini call (for extraction) failed:", geminiError.message);
    }

    // --- (เหมือนเดิม) ส่งข้อมูลกลับไปหน้าเว็บ ---
    return NextResponse.json({
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        position: extractedData.position,
        experience: extractedData.experience,
        text: cvText, 
    });

  } catch (error: any) {
    console.error("Error in /api/extractCV:", error.message);
    // 6. (ลบออก) ไม่ต้องเช็ค Error 'permission' หรือ 'creden' แล้ว
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}