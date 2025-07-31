import { Groq } from "groq-sdk";
import dotenv from "dotenv";
import { JobTitle } from "../../models/user.model";
import { Difficulty } from "../../models/mcq.model";
import { ServiceResult } from "../../types/type";
dotenv.config();
class AiService {
  private readonly groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  private getMcqPrompt(
    jobTitle: string,
    difficulty: Difficulty,
    topics: string[]
  ) {
    return `
Generate 5 multiple-choice questions for the role of "${jobTitle}", focused on: ${topics.join(", ")}.
Difficulty: ${difficulty}.

Requirements:
- Each question must have 4 options and only 1 correct answer.
- Include a short explanation for each correct answer.
- Format the result as a JSON array of objects.
- Each object must follow this format:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "explanation": "string"
}

Respond ONLY with the raw JSON array. Do NOT include any extra text, markdown, or explanation.
`;
  }

  public async generateMcqQuestions(
    jobTitle: JobTitle,
    difficulty: Difficulty,
    topics: Array<string>,
    saveToDb: boolean = false
  ): Promise<ServiceResult<any>> {
    const prompt = this.getMcqPrompt(jobTitle, difficulty, topics);

    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-70b-8192",
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.9,
        stream: false,
      });

      const rawContent = response.choices[0]?.message?.content;

      if (!rawContent) throw new Error("Empty response from AI.");

      let mcqs: any[] = [];

      try {
        const parsed = JSON.parse(rawContent);
        mcqs = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        const match = rawContent.match(/\[.*\]/g);
        if (match) {
          mcqs = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to extract MCQ array from AI response.");
        }
      }

      if (!Array.isArray(mcqs) || mcqs.length === 0) {
        throw new Error("Parsed data is not a valid array of questions.");
      }

      return {
        success: true,
        data: mcqs,
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export default AiService;
