
import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Parses natural language input into a structured task object.
 * Implements a strict Date Normalization Pipeline using User Local Context.
 */
export const parseTaskFromInput = async (input: string): Promise<AIParseResult> => {
  // --- STEP 0: CAPTURE USER CONTEXT ---
  const now = new Date();
  
  // Detailed context for the AI to understand "today", "next Friday", etc.
  const userContext = {
    currentDate: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    currentTime: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1, // 1-based for AI clarity
    currentDay: now.getDate(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: input,
      config: {
        systemInstruction: `
          You are TaskFlow AI — an expert task parser.
          
          ----------------------------
          CONTEXT (CRITICAL)
          ----------------------------
          Current Reference Date: ${userContext.currentDate}
          Current Reference Time: ${userContext.currentTime}
          Timezone: ${userContext.timezone}

          ----------------------------
          DATE PARSING RULES
          ----------------------------
          1. **Relative Dates**: Calculate dates relative to the "Current Reference Date".
             - "Tomorrow" = Reference Day + 1
             - "Next Friday" = The next occurrence of Friday starting from Reference Date.
             - "2 days after today" = Reference Date + 2 days.
          
          2. **Missing Components**:
             - If user says "June 5" (no year), return year: null (we will fix in post-processing).
             - If user says "Friday" (no time), return time: null.
             - If user specifies time "at 5pm", return time: "17:00".

          3. **Ambiguity**:
             - "Buy milk" (no date) -> returns null for all date fields.
             - "Call Mom" (no date) -> returns null for all date fields.

          ----------------------------
          OUTPUT FORMAT
          ----------------------------
          Return JSON only.
          Extract raw date components separately for the normalization pipeline.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            // Step 2: Extract Raw Fields
            date_components: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                year: { type: Type.INTEGER, nullable: true },
                month: { type: Type.INTEGER, nullable: true, description: "1-12" },
                day: { type: Type.INTEGER, nullable: true },
                time: { type: Type.STRING, nullable: true, description: "HH:mm in 24h format" }
              }
            },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "auto"] },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            subtasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            reminder: { type: Type.STRING, nullable: true, description: "ISO string if explicit reminder requested" },
            duration_minutes: { type: Type.INTEGER, nullable: true }
          },
          required: ["title", "priority", "category", "description", "subtasks", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const rawResult = JSON.parse(text);

    // --- PIPELINE STEP 3 & 4: NORMALIZE & FILL MISSING VALUES ---
    let finalIsoDate: string | null = null;

    if (rawResult.date_components && (rawResult.date_components.day || rawResult.date_components.month)) {
      const comps = rawResult.date_components;
      
      // Default to current year/month/day if missing, BUT rely on what Gemini extracted first
      let year = comps.year || userContext.currentYear;
      let month = comps.month || userContext.currentMonth;
      let day = comps.day || userContext.currentDay;
      
      // Handle "Time" (Step 3: missing time -> null)
      let hours = 9; // Default to 9:00 AM if purely date based
      let minutes = 0;

      if (comps.time) {
        const [h, m] = comps.time.split(':').map(Number);
        hours = h;
        minutes = m;
      }

      // --- LOGIC: SMART YEAR INFERENCE ---
      // If user said "June 5" and it is currently "July", assume next year.
      // But only if Gemini returned null year (meaning user didn't explicitly say "2024").
      if (!comps.year) {
        // Construct a temp date to check if it's in the past
        const constructedDate = new Date(year, month - 1, day, 23, 59, 59); // End of that day
        const nowBuffer = new Date();
        nowBuffer.setHours(0, 0, 0, 0); // Start of today
        
        // If the constructed date is strictly in the past, promote to next year
        if (constructedDate < nowBuffer) {
           year += 1;
        }
      }

      // --- STEP 5: CONSTRUCT LOCAL ISO STRING ---
      // We use the standard JS Date constructor which uses Local Time by default.
      // Note: Month is 0-indexed in JS Date constructor.
      const dateObj = new Date(year, month - 1, day, hours, minutes);
      
      // Convert to "YYYY-MM-DDTHH:mm" for html datetime-local input
      // We create a string manually to avoid UTC conversion issues with toISOString()
      const pad = (n: number) => n.toString().padStart(2, '0');
      finalIsoDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    }

    return {
      title: rawResult.title,
      datetime: finalIsoDate, // The calculated local ISO string
      priority: rawResult.priority,
      category: rawResult.category,
      description: rawResult.description,
      subtasks: rawResult.subtasks || [],
      tags: rawResult.tags || [],
      reminder: rawResult.reminder, // Gemini can pass this through directly or we could normalize it too
      duration_minutes: rawResult.duration_minutes
    };

  } catch (error) {
    console.error("AI Parse Error:", error);
    // Fallback
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
