import User from "../Model/User.js";
import GitHubData from "../Model/GitHubData.js";
import LeetCodeData from "../Model/LeetCodeData.js";
import CodeforcesData from "../Model/CodeforcesData.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Resume from "../Model/Resume.js";

dotenv.config();

const generateAIResponse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { question } = req.body;

    const resumedata = await Resume.findOne({ userId });



    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Fetch data using userId from each collection
    const githubDataEntry = await GitHubData.findOne({ userId });
    const leetcodeDataEntry = await LeetCodeData.findOne({ userId });
    const codeforcesDataEntry = await CodeforcesData.findOne({ userId });

    const combinedData = {
      github: githubDataEntry?.data || null,
      leetcode: leetcodeDataEntry
        ? {
            stats: leetcodeDataEntry.stats,
            submissionCalendar: leetcodeDataEntry.submissionCalendar,
            topicAnalysisStats: leetcodeDataEntry.topicAnalysisStats,
            awards: leetcodeDataEntry.awards,
          }
        : null,
      codeforces: codeforcesDataEntry?.data || null,
    };

    const aiResponse = await generateGeminiResponse(combinedData,resumedata, question, user.name);
    return res.status(200).json({ aiResponse });
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const generateGeminiResponse = async (data,resumedata, question, username) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an AI assistant analyzing a user's coding profile.
User's name: ${username}

Here is the user's stored coding data (do not mention it explicitly):
${JSON.stringify(data)}and
Here is the user's resume  data (do not mention it explicitly):
${JSON.stringify(resumedata)}

Answer this question in a maximum of 5 lines: "${question}"

Instructions:
- Address the user by name.
- Do NOT say "Based on the data".
- Do NOT say "according to your resume or other like this".
- If the question is unrelated, still give a relevant or general answer.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return "An error occurred while generating the AI response.";
  }
};

export { generateAIResponse };
