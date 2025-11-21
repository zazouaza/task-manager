import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AIParseResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Parses natural language input into a structured task object.
 */
export const parseTaskFromInput = async (input: string): Promise<AIParseResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: input,
      config: {
        systemInstruction: `
          You are TaskFlow AI — an expert system that converts natural language into structured tasks.

          Your job:
          Take ANY user written sentence and extract clean, organized, database-ready task information.

          ----------------------------
          REQUIREMENTS
          ----------------------------

          When the user writes anything like:
          - "Tomorrow 5pm call Sam"
          - "finish the frontend today"
          - "in 3 days go renew my ID"
          - "Monday morning buy groceries"
          - "prepare for exam next week"

          You must extract:
          - title
          - datetime (ISO format)
          - priority
          - category
          - subtasks (if detected)
          - description
          - estimated duration (if user hints)
          - reminder time
          - tags

          ----------------------------
          RULES
          ----------------------------

          - If the user gives no date, you can auto-detect one based on context:
            - “today” → today’s date
            - “tomorrow” → tomorrow’s date
            - “next week” → approximate date (7 days later)
          - If unclear, set “datetime”: null.
          - If user doesn't specify priority, set "priority": "auto".
          - If user does not specify category, infer it or set "auto".
          - Subtasks are optional — detect only when the sentence suggests multi-step actions.
          - Keep titles short and clean.
          - Keep descriptions concise.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            datetime: { type: Type.STRING, description: "YYYY-MM-DDTHH:mm or null", nullable: true },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "auto"] },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            subtasks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reminder: { type: Type.STRING, description: "YYYY-MM-DDTHH:mm or null", nullable: true },
            duration_minutes: { type: Type.INTEGER, nullable: true }
          },
          required: ["title", "priority", "category", "description", "subtasks", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIParseResult;
  } catch (error) {
    console.error("AI Parse Error:", error);
    // Fallback for error handling
    return {
      title: input,
      priority: 'auto',
      category: 'General',
      datetime: null,
      description: '',
      subtasks: [],
      tags: [],
      reminder: null,
      duration_minutes: null
    };
  }
};

export const generateDailySummary = async (completedCount: number, pendingCount: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `I have completed ${completedCount} tasks today and have ${pendingCount} left. Give me a very short (max 20 words) motivational punchline.`,
    });
    return response.text || "Keep pushing!";
  } catch (e) {
    return "Great work today!";
  }
};