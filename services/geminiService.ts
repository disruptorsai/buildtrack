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
**Project Risk Assessment - Eaglewood Retail Center**

*   **Schedule Risk (High)**: Current burn rate suggests a 2-week delay in Metal Stud Framing due to crew shortages in Davis County area.
*   **Budget (Medium)**: Steel material costs from Staker Parson trending 8% over baseline.
*   **Weather**: Snow forecast for Wednesday may impact the Building B concrete pour. Consider rescheduling with Geneva Rock.
*   **Inspection**: Davis County inspection Dec 5th - ensure fire sprinkler RFI #007 is resolved.
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
**Blueprint Analysis - Eaglewood Retail A-101**
*   **Tenant Spaces**: Detected 5 retail suites and common corridor per Orchard Drive frontage.
*   **Potential Clash**: Grid line C-4 shows conflict between HVAC supply duct and structural beam. Coordinate with Hughes GC.
*   **ADA Compliance**: Verify entrance ramp slope meets Utah accessibility code (max 8.33%).
*   **Fire Safety**: Suite 102 dropped ceiling requires sprinkler head spacing verification per Davis County Fire Authority.
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
            subject: "Storefront Glazing Header Detail at Suite 103",
            question:
              "Drawing A-301 shows a 6\" steel header above the storefront glazing at Suite 103, but structural drawing S-102 indicates an 8\" beam at this location. Please clarify the correct header size to coordinate with Orchard Drive elevation requirements and proceed with Wasatch Steel fabrication.",
            impact: "Cost: Potential $3,200 | Schedule: 3-day delay for steel re-fabrication if 8\" required",
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
