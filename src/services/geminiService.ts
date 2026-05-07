import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const createTaskFunctionDeclaration: FunctionDeclaration = {
  name: "createTask",
  description: "Create a new task with a title, description, category, and options like tags and due date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the task" },
      description: { type: Type.STRING, description: "Detailed description of the task" },
      category: { 
        type: Type.STRING, 
        description: "Category of the task (e.g., Work, Personal, Shopping, Life)",
        enum: ["Work", "Personal", "Shopping", "Life"]
      },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of tags associated with the task"
      },
      dueDate: { 
        type: Type.STRING, 
        description: "When the task is due (e.g., Today, Tomorrow, Oct 25)" 
      }
    },
    required: ["title", "category"]
  }
};

export const createNoteFunctionDeclaration: FunctionDeclaration = {
  name: "createNote",
  description: "Create a new note with a title and content.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the note" },
      content: { type: Type.STRING, description: "The body content of the note" }
    },
    required: ["title", "content"]
  }
};

export const createEventFunctionDeclaration: FunctionDeclaration = {
  name: "createEvent",
  description: "Create a new event with title, time, date, location, and metadata.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the event" },
      time: { type: Type.STRING, description: "Time of the event (e.g., 10:00 AM)" },
      date: { type: Type.STRING, description: "Date of the event (e.g., Oct 25)" },
      location: { type: Type.STRING, description: "Where the event takes place" },
      category: { type: Type.STRING, description: "Category (e.g., Work, Personal)" },
      description: { type: Type.STRING, description: "Additional details about the event" },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags for the event" }
    },
    required: ["title", "time", "date", "category"]
  }
};

export async function chatWithAI(message: string, history: any[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are an AI Assistant for the Aura Productivity app.
        Your goal is to help users manage their life by creating tasks, notes, and events.
        Use the provided tools to perform these actions when the user requests them.
        When a user says something like "Remind me to buy milk", call createTask.
        When they say "Take a note about the meeting", call createNote.
        When they say "Schedule a meeting with Bob tomorrow at 2 PM", call createEvent.
        Always confirm what you've done in a friendly, concise manner.`,
        tools: [{
          functionDeclarations: [
            createTaskFunctionDeclaration,
            createNoteFunctionDeclaration,
            createEventFunctionDeclaration
          ]
        }]
      }
    });

    return response;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
}
