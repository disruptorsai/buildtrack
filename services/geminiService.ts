
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

export const analyzeBlueprint = async (imageUrl: string): Promise<string> => {
   if (!ai) {
      return new Promise(resolve => setTimeout(() => resolve(`
**Blueprint Analysis**
*   **Room Detection**: Detected 4 main rooms and 1 corridor.
*   **Potential Clash**: Grid line C-4 shows a potential conflict between structural column and HVAC supply.
*   **Measurement**: Main corridor width appears to be 8ft.
      `), 2000));
   }

   // Note: In a real app, we would fetch the image bytes. 
   // For this demo, we'll assume the model can reason about the URL or we mock it if it's a generic placeholder.
   // To keep it simple for the demo without CORS issues, we will return a simulated strong response if it's a URL, 
   // or use the model if we had base64. 
   
   return new Promise(resolve => setTimeout(() => resolve(`
**Blueprint Intelligence Scan**
*   **Grid System**: Detected radial grid system A-F / 1-10.
*   **Area Identification**:
    *   Room 101 (Office)
    *   Room 102 (Conf)
    *   Room 104 (Corridor)
*   **Annotations**: 2 Existing Field Issues detected in this sector.
*   **Suggestion**: Verify door swing clearance in Room 102 against ADA requirements.
   `), 1500));
};

export const generateRFI = async (roughNotes: string, context: string): Promise<{subject: string, question: string, impact: string}> => {
   if (!ai) {
      return new Promise(resolve => setTimeout(() => resolve({
         subject: "Clarification on Rebar Spacing at Grid C-4",
         question: "Regarding the column schedule on S-201, the rebar spacing is listed as 4 inches on center, but the architectural detail A-505 shows a 6-inch assembly. Please clarify the correct spacing to proceed with fabrication.",
         impact: "Cost: Neutral | Schedule: Potential 2-day delay for fabrication"
      }), 2500));
   }

   try {
      const prompt = `
      You are a construction Project Manager. Draft a formal Request for Information (RFI) based on these rough notes: "${roughNotes}".
      Context: ${context}.
      
      Return a JSON object with:
      - subject (concise title)
      - question (professional, contract-safe language)
      - impact (estimated cost/schedule impact based on standard construction knowledge)
      `;

      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt,
         config: { responseMimeType: 'application/json' }
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
   } catch (error) {
      console.error("Gemini RFI Error", error);
      return {
         subject: "Error Generating RFI",
         question: "Could not generate RFI from notes.",
         impact: "Unknown"
      };
   }
}
