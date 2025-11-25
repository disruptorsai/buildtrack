import { GoogleGenAI } from "@google/genai";

// Initialize the API client only if the key is available
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const analyzeSafetyImage = async (base64Image: string): Promise<string> => {
  if (!ai) {
    // Return mock response if no API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
**Safety Analysis Report**

1.  **Positive**: Hard hats are visible on 3/4 workers.
2.  **Violation**: One worker near the trench is missing a high-visibility vest.
3.  **Hazard**: Debris detected in the walkway (Zone B).
4.  **Action Required**: Clear walkway immediately and ensure all personnel have vests.
        `);
      }, 2000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg', 
            },
          },
          {
            text: 'Analyze this construction site image for safety violations according to OSHA standards. List any missing PPE, trip hazards, or unsafe practices. Format as a concise markdown list.',
          },
        ],
      },
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing image. Please try again.";
  }
};

export const predictProjectRisks = async (projectSummary: string): Promise<string> => {
  if (!ai) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
**Project Risk Assessment**

*   **Schedule Risk (High)**: Current burn rate suggests a 2-week delay in the 'Framing' phase due to crew shortages.
*   **Budget (Medium)**: Material costs for steel are trending 5% over baseline.
*   **Weather**: Upcoming storm front next week may impact the concrete pour scheduled for Tuesday.
        `);
      }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following project summary for risks regarding schedule, budget, and safety: ${projectSummary}`,
    });
    return response.text || "No prediction generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing project risks.";
  }
};