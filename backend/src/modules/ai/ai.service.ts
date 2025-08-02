import { Groq } from "groq-sdk";
import dotenv from "dotenv";
import { JobTitle, UserRole } from "../../models/user.model";
import {
  Difficulty,
  IMcqDocument,
  QuestionSource,
} from "../../models/mcq.model";
import { GenerateMcqDto, InsertDto, ServiceResult } from "../../types/type";
import { Dependencies } from "../../container";

import Some from "../../utils/Some";
import pick from "../../utils/pick";
import { Types } from "mongoose";
import ErrorUtils from "../../utils/ErrorUtils";

dotenv.config();
class AiService {
  private readonly groq;
  private readonly mcqService;

  constructor({ mcqService }: Dependencies) {
    this.mcqService = mcqService;

    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  public getMcqPrompt(
    jobTitle: JobTitle,
    difficulty: Difficulty,
    topics: string[],
    existingMcqs?: Array<string>,
    questionCount: number = 5
  ): string {
    return `Generate ${questionCount} multiple-choice questions for the role of "${jobTitle}", focused on: ${topics.join(", ")}.
Difficulty: ${difficulty}.

Requirements:
- Don't include questions similar to "${JSON.stringify(existingMcqs)}".
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

  public async generateMcqQuestions({
    jobTitle,
    difficulty,
    topics,
    role,
    createdById,
    saveToDb = false,
    questionCount,
  }: GenerateMcqDto): Promise<ServiceResult<Array<Partial<IMcqDocument>>>> {
    try {
      const serviceResult = await this.mcqService.getMcqsByJobTitle(jobTitle);
      if (serviceResult.success) {
        const existingQuestions = serviceResult.data.map((d) => d.question);

        const prompt = this.getMcqPrompt(
          jobTitle,
          difficulty,
          topics,
          existingQuestions,
          questionCount
        );

        const response = await this.groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama3-70b-8192",
          max_tokens: 2048,
          temperature: 0.8,
          top_p: 1,
          stream: false,
        });

        const rawContent = response.choices[0]?.message?.content;

        if (!rawContent) throw new Error("Empty response from AI.");

        let mcqs: any[] = [];

        const parsed = JSON.parse(rawContent);
        mcqs = Array.isArray(parsed) ? parsed : [parsed];

        if (!Array.isArray(mcqs) || mcqs.length === 0) {
          throw new Error("Parsed data is not a valid array of questions.");
        }

        let insertMcqData: Array<InsertDto> = [];
        mcqs.forEach((mcq) => {
          const insertData: InsertDto = {
            jobTitle: jobTitle,
            difficulty: difficulty,
            question: Some.String(mcq?.question),
            options: Some.Array(mcq?.options),
            correctIndex: Some.Number(mcq?.correctIndex),
            explanation: Some.String(mcq?.explanation),
            source: QuestionSource.ai,
            createdById: createdById,
          };
          insertMcqData.push(insertData);
        });

        const insertResult = await this.mcqService.addBulkMcqs(insertMcqData);
        // console.log(insertResult);
        if (insertResult.success) {
          const data = insertResult.data.map((mcq) =>
            role === UserRole.Candidate
              ? pick(
                  mcq,
                  "_id",
                  "difficulty",
                  "createdAt",
                  "question",
                  "options"
                )
              : mcq
          );
          return {
            success: true,
            data: data,
          };
        } else {
          throw new Error("Error inserting questions to db");
        }
      } else {
        throw new Error("Error fetching questions from db");
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Unknown error occurred"),
      };
    }
  }
}

export default AiService;
