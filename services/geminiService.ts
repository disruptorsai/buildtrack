// Gemini API service - calls Netlify function to keep API key secure

const GEMINI_FUNCTION_URL = "/.netlify/functions/gemini";

// Check if we're in development mode without Netlify
const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

async function callGeminiFunction<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(GEMINI_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

export const analyzeSafetyImage = async (base64Image: string): Promise<string> => {
  // Return mock response in development without Netlify functions
  if (isDev) {
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
    const result = await callGeminiFunction<{ text: string }>("analyzeSafetyImage", { base64Image });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing image. Please try again.";
  }
};

export const predictProjectRisks = async (projectSummary: string): Promise<string> => {
  if (isDev) {
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
    const result = await callGeminiFunction<{ text: string }>("predictProjectRisks", { projectSummary });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing project risks.";
  }
};

export const analyzeBlueprint = async (imageUrl: string): Promise<string> => {
  if (isDev) {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(`
**Blueprint Analysis**
*   **Room Detection**: Detected 4 main rooms and 1 corridor.
*   **Potential Clash**: Grid line C-4 shows a potential conflict between structural column and HVAC supply.
*   **Measurement**: Main corridor width appears to be 8ft.
      `),
        2000
      )
    );
  }

  try {
    const result = await callGeminiFunction<{ text: string }>("analyzeBlueprint", { imageUrl });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing blueprint.";
  }
};

export const generateRFI = async (
  roughNotes: string,
  context: string
): Promise<{ subject: string; question: string; impact: string }> => {
  if (isDev) {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            subject: "Clarification on Rebar Spacing at Grid C-4",
            question:
              "Regarding the column schedule on S-201, the rebar spacing is listed as 4 inches on center, but the architectural detail A-505 shows a 6-inch assembly. Please clarify the correct spacing to proceed with fabrication.",
            impact: "Cost: Neutral | Schedule: Potential 2-day delay for fabrication",
          }),
        2500
      )
    );
  }

  try {
    const result = await callGeminiFunction<{ subject: string; question: string; impact: string }>("generateRFI", {
      roughNotes,
      rfiContext: context,
    });
    return result;
  } catch (error) {
    console.error("Gemini RFI Error", error);
    return {
      subject: "Error Generating RFI",
      question: "Could not generate RFI from notes.",
      impact: "Unknown",
    };
  }
};
