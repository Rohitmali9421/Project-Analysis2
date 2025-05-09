import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { jsonrepair } from "jsonrepair";

dotenv.config();

pdfjsLib.GlobalWorkerOptions.workerSrc = null;

const extractTextFromPDF = async (buffer) => {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    fullText += text + "\n\n";
  }

  return fullText.trim();
};

// 🤖 Analyze Resume Based on Job Category
const analyzeResumeAgainstCategory = async (resumeText, category ) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert resume evaluator. Given the following resume text, analyze how suitable the candidate is for the job role: "${category}".

Evaluate and return a clean JSON in this format:
{
  "matchPercentage": 0-100,
  "missingKeywords": [],
  "strengths": [],
  "suggestions": [],
  "summary": "short paragraph"
}

Only return the valid JSON. No markdown, no extra text.

Resume Text:
${resumeText}
`;
  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    if (responseText.startsWith("```json")) {
      responseText = responseText
        .replace(/^```json\s*/, "")
        .replace(/```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = JSON.parse(jsonrepair(responseText));
    }

    return parsed;
  } catch (error) {
    console.error("❌ Analysis error:", error.message);
    throw new Error("Failed to analyze resume for job category");
  }
};

  

// 📤 API Endpoint
const handleanalyzepdf = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const category = req.body.category;
    if (!category) {
      return res.status(400).json({ error: "Job category is required" });
    }
    const resumeText = await extractTextFromPDF(req.file.buffer);
    const evaluation = await analyzeResumeAgainstCategory(resumeText, category );

    res.json(evaluation);
  } catch (error) {
    console.error("📄 Resume analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      details: error.message,
    });
  }
};

export { handleanalyzepdf };
