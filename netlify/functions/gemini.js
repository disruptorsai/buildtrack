const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
    };
  }

  try {
    const { action, payload } = JSON.parse(event.body || "{}");
    const ai = new GoogleGenAI({ apiKey });

    let result;

    switch (action) {
      case "analyzeSafetyImage": {
        const { base64Image } = payload;
        if (!base64Image) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing base64Image" }),
          };
        }
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType: "image/jpeg",
                },
              },
              {
                text: "Analyze this construction site image for safety violations according to OSHA standards. List any missing PPE, trip hazards, or unsafe practices. Format as a concise markdown list.",
              },
            ],
          },
        });
        result = { text: response.text || "No analysis generated." };
        break;
      }

      case "predictProjectRisks": {
        const { projectSummary } = payload;
        if (!projectSummary) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing projectSummary" }),
          };
        }
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Analyze the following project summary for risks regarding schedule, budget, and safety: ${projectSummary}`,
        });
        result = { text: response.text || "No prediction generated." };
        break;
      }

      case "generateRFI": {
        const { roughNotes, rfiContext } = payload;
        if (!roughNotes) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing roughNotes" }),
          };
        }
        const prompt = `
You are a construction Project Manager. Draft a formal Request for Information (RFI) based on these rough notes: "${roughNotes}".
Context: ${rfiContext || "General construction project"}.

Return a JSON object with:
- subject (concise title)
- question (professional, contract-safe language)
- impact (estimated cost/schedule impact based on standard construction knowledge)
`;
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text || "{}";
        result = JSON.parse(text);
        break;
      }

      case "analyzeBlueprint": {
        const { imageUrl } = payload;
        // Blueprint analysis - for now returns intelligent mock
        // In production, you'd fetch the image and analyze it
        result = {
          text: `
**Blueprint Intelligence Scan**
*   **Grid System**: Detected radial grid system A-F / 1-10.
*   **Area Identification**:
    *   Room 101 (Office)
    *   Room 102 (Conf)
    *   Room 104 (Corridor)
*   **Annotations**: 2 Existing Field Issues detected in this sector.
*   **Suggestion**: Verify door swing clearance in Room 102 against ADA requirements.
          `.trim(),
        };
        break;
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process request",
        detail: error.message,
      }),
    };
  }
};
