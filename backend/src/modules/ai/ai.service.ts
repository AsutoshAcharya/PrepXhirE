import { Groq } from "groq-sdk";
import dotenv from "dotenv";

import { IMcqDocument } from "../../models/mcq.model";
import {
  AiFeedbackDto,
  GenerateMcqDto,
  InsertDto,
  InterviewOnGoingDto,
  InterviewStartDto,
  ServiceResult,
  UpdateConversationDto,
} from "../../types/type";
import { Dependencies } from "../../container";

import Some from "../../utils/Some";
import pick from "../../utils/pick";
import ErrorUtils from "../../utils/ErrorUtils";
import {
  Difficulty,
  InterviewUser,
  JobTitle,
  QuestionSource,
  UserRole,
} from "../../enums";
import { IInterviewDocument } from "../../models/interview.model";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import moment from "moment";
import { aiInterviewResponseSchema } from "./ai.schema";

dotenv.config();
class AiService {
  private readonly groq;
  private readonly mcqService;
  private readonly interviewService;
  private readonly socketServer;

  constructor({ mcqService, interviewService, socketServer }: Dependencies) {
    this.mcqService = mcqService;
    this.interviewService = interviewService;
    this.socketServer = socketServer;
    console.log("here");
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  private getMcqPrompt(
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
  "explanation": "string",
  "questionTopic":"string"
}

Respond ONLY with the raw JSON array. Do NOT include any extra text, markdown, or explanation.
`;
  }

  private getMcqFeedbackPrompt(data: Array<AiFeedbackDto>): string {
    let corectMcqs: Array<AiFeedbackDto> = [];
    let incorrectMcqs: Array<AiFeedbackDto> = [];
    data.forEach((d) => {
      if (d.isCorrect) corectMcqs.push(d);
      else incorrectMcqs.push(d);
    });

    const topicStats = (items: typeof data) => {
      const topicCount: Record<string, number> = {};
      items.forEach((item) => {
        topicCount[item.questionTopic.toLowerCase()] =
          (topicCount[item.questionTopic.toLowerCase()] || 0) + 1;
      });
      return topicCount;
    };

    const strengths = topicStats(corectMcqs);
    const weaknesses = topicStats(incorrectMcqs);

    const summarizeTopics = (topics: Record<string, number>) => {
      const entries = Object.entries(topics);
      return entries.length === 0
        ? "None"
        : entries
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => `${topic} (${count})`)
            .join(", ");
    };

    const intro = `Analyze the user's performance on a multiple-choice quiz. Provide a brief summary of their overall performance, including areas of strength and areas to improve. Keep the tone encouraging and professional.\n\n`;

    const summaryData =
      `Total Questions: ${data.length}\n` +
      `Correct Answers: ${corectMcqs.length}\n` +
      `Incorrect Answers: ${incorrectMcqs.length}\n` +
      `Strong Topics: ${summarizeTopics(strengths)}\n` +
      `Needs Improvement: ${summarizeTopics(weaknesses)}\n`;

    return intro + summaryData;
  }

  public getInterviewPrompt(
    jobTitle: JobTitle,
    candidateSkills: string[],
    data?: IInterviewDocument
  ): string {
    const skillsList = candidateSkills.join(", ");
    const conversation = data
      ? data.conversation
          .map((pair, index) => {
            const question = pair.question?.message || "";
            const answer = pair.answer?.message || "[No answer yet]";
            return `Q${index + 1}: ${question}\nA${index + 1}: ${answer}`;
          })
          .join("\n\n")
      : "No conversation has started yet.";

    const prompt = `
You are a professional interviewer at **PrepXhirE**, an AI-driven interview platform built to simulate real-world interviews and evaluate candidates.

Candidate is applying for the role of **${jobTitle}** with these skills: ${skillsList}.

Below is the current conversation:

${conversation}

Your task is to:
1. Briefly **analyze the candidate's most recent answer**.
2. Offer **concise, professional feedback** (positive or constructive).
3. Then, **ask the next interview question** based on the candidate's response, skills, and job role.

- Keep feedback helpful and professional (2-3 sentences max).
- Keep the tone friendly yet evaluative.
- If this is the first question, return an empty string for "feedback".
- Response must follow this format:

{
  "feedback": "string",
  "nextQuestion":"string"
}

Respond ONLY with the raw JSON object. Do NOT include any extra text, markdown, or explanation.
`;

    return prompt.trim();
  }

  public async getAiResponse(
    prompt: string,
    systemMessage?: string
  ): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: Some.String(systemMessage) },
      { role: "user", content: prompt },
    ];

    const response = await this.groq.chat.completions.create({
      messages: [messages[1]],
      model: "llama3-70b-8192",
      max_tokens: 2048,
      temperature: 0.8,
      top_p: 1,
      stream: false,
    });

    const rawContent = response.choices[0]?.message?.content;
    return Some.String(rawContent);
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
      const serviceResult = await this.mcqService.getMcqsByJobTitle(
        jobTitle,
        createdById
      );
      if (serviceResult.success) {
        const existingQuestions = serviceResult.data.map((d) => d.question);

        const prompt = this.getMcqPrompt(
          jobTitle,
          difficulty,
          topics,
          existingQuestions,
          questionCount
        );

        const rawContent = await this.getAiResponse(prompt);

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
            source: QuestionSource.Ai,
            createdById: createdById,
            questionTopic: Some.String(mcq?.questionTopic),
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

  public async getMcqFeedBack(
    data: Array<AiFeedbackDto>
  ): Promise<ServiceResult<string>> {
    try {
      const prompt = this.getMcqFeedbackPrompt(data);
      const rawContent = await this.getAiResponse(prompt);

      console.log("rawContent", rawContent);
      return {
        success: true,
        data: Some.String(rawContent),
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error generating feedback"),
      };
    }
  }

  public async startInterview({
    candidateId,
    jobTitle,
    candidateSkills,
    interviewerId,
    sessionId,
  }: InterviewStartDto): Promise<ServiceResult<IInterviewDocument>> {
    const prompt = this.getInterviewPrompt(jobTitle, candidateSkills);

    try {
      const rawContent = await this.getAiResponse(prompt);

      const result = aiInterviewResponseSchema.safeParse(
        JSON.parse(rawContent)
      );

      if (result.success) {
        const insertInterviewDataResult =
          await this.interviewService.insertInterviewData({
            candidateId,
            user: InterviewUser.Ai,
            message: result.data.nextQuestion,
            interviewerId,
            sessionId,
          });

        if (insertInterviewDataResult.success)
          return { success: true, data: insertInterviewDataResult.data };

        return {
          success: false,
          message: insertInterviewDataResult.message,
        };
      }

      return {
        success: false,
        message: "Invalid ai response",
      };
    } catch (error) {
      console.log("Error getting ai result", error);
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Something went wrong!"),
      };
    }
  }

  public async onGoingInterview({
    interviewId,
    candidateId,
    jobTitle,
    candidateSkills,
    interviewerId,
    sessionId,
    userResponse,
  }: InterviewOnGoingDto): Promise<ServiceResult<IInterviewDocument>> {
    try {
      const interviewServiceResult =
        await this.interviewService.getInterviewById(interviewId);

      if (!interviewServiceResult.success) {
        return {
          success: false,
          message: "Interview not found",
        };
      }

      let temporaryConversation = [...interviewServiceResult.data.conversation];

      const lastIndex = temporaryConversation.length - 1;
      if (lastIndex >= 0) {
        temporaryConversation[lastIndex].answer = {
          message: userResponse,
          user: InterviewUser.User,
          timestamp: moment.utc().toDate(),
        };
      }

      const prompt = this.getInterviewPrompt(jobTitle, candidateSkills, {
        ...interviewServiceResult.data,
        conversation: temporaryConversation,
      } as IInterviewDocument);

      const aiResponse = await this.getAiResponse(prompt);
      // console.log("AI Response:", JSON.parse(aiResponse));

      const result = aiInterviewResponseSchema.safeParse(
        JSON.parse(aiResponse)
      );

      if (result.success) {
        const updateConversationDto: UpdateConversationDto = {
          id: interviewId,
          userMessage: {
            message: userResponse,
            user: InterviewUser.User,
          },
          interviewerMessage: {
            message: result.data.nextQuestion,
            user: InterviewUser.Ai,
          },
          aiFeedback: result.data.feedback,
        };

        this.socketServer.sendInterviewResponse({
          joinRoomDto: {
            candidateId: String(candidateId),
            interviewId: String(interviewId),
          },
          message: pick(
            updateConversationDto,
            "interviewerMessage",
            "aiFeedback"
          ),
        });

        const updateResult = await this.interviewService.updateConversation(
          updateConversationDto
        );

        if (updateResult.success)
          return {
            success: true,
            data: updateResult.data,
          };

        return {
          success: false,
          message: updateResult.message,
        };
      }

      return {
        success: false,
        message: "Invalid ai response",
      };
    } catch (error) {
      console.log("Error in ongoing interview", error);
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Something went wrong!"),
      };
    }
  }

  public async interviewEnd() {}
}

export default AiService;
