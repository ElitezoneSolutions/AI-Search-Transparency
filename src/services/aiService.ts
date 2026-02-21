import { GoogleGenAI } from "@google/genai";

// Initialize the client
const getAIClient = () => {
  // In Vite, environment variables are accessed via import.meta.env
  // For production builds (like Vercel), VITE_ prefix is required
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  
  if (!apiKey) {
    throw new Error("API Key Missing: Please set VITE_GEMINI_API_KEY in your Vercel Environment Variables and redeploy.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export interface SearchResult {
  keyword: string;
  title: string;
  url: string;
  snippet: string;
}

export interface TransparencyResponse {
  keywords: string[];
  results: SearchResult[];
  actualQueries?: string[];
  isFastMode?: boolean;
  answer?: string;
}

export async function performTransparentSearch(userQuery: string, isFastMode: boolean = false): Promise<TransparencyResponse> {
  const model = "gemini-3-flash-preview";
  const ai = getAIClient();
  
  const prompt = isFastMode ? `
    You are an AI Search Strategy engine. Your goal is to show the user how you would break down their query to find information.
    
    User Query: "${userQuery}"

    Task:
    1. Analyze the query and generate 4-6 precise, distinct search keywords or sub-queries to research this topic thoroughly.
    2. Return the data in a strict JSON format.

    Output Format (JSON only, no markdown):
    {
      "keywords": ["keyword 1", "keyword 2", ...],
      "results": [],
      "answer": "I would research this by looking into [X], [Y], and [Z] to provide a comprehensive answer."
    }
  ` : `
    You are an AI Search Transparency engine. Your goal is to show the user how you break down their query, find information, and provide a synthesized answer.
    
    User Query: "${userQuery}"

    Task:
    1. Analyze the query and generate 4-6 precise, distinct search keywords or sub-queries to research this topic thoroughly.
    2. Use the Google Search tool to find actual, relevant information for these keywords.
    3. Based on the search results, provide a concise, factual answer to the user's query.
    4. Return the data in a strict JSON format.

    Output Format (JSON only, no markdown):
    {
      "keywords": ["keyword 1", "keyword 2", ...],
      "results": [
        { 
          "keyword": "keyword 1", 
          "title": "Page Title", 
          "url": "https://...", 
          "snippet": "Brief relevant excerpt..." 
        },
        ...
      ],
      "answer": "A synthesized answer based on the results found..."
    }

    Ensure the "keyword" field in the results matches one of the generated keywords.
    Try to find at least 1-2 results per keyword.
  `;

  const config: any = {
    responseMimeType: "application/json",
  };

  if (!isFastMode) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Extract actual search queries from grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const actualQueries = groundingMetadata?.webSearchQueries || [];

    // Parse JSON
    try {
      const data = JSON.parse(text) as TransparencyResponse;
      // Add actual queries to the response
      data.actualQueries = isFastMode ? data.keywords : actualQueries;
      data.isFastMode = isFastMode;
      return data;
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("AI response was not valid JSON");
    }
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
