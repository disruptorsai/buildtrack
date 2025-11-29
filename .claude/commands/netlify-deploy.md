# AI Studio to Netlify Deployment

Convert this Google AI Studio exported project into a Netlify-deployable application with proper API key security.

## Step 1: Analyze the Current Setup

First, investigate and report:
1. **Framework**: Is this React, Vue, vanilla JS, Vite, Next.js, etc.?
2. **Build system**: Check package.json for build commands and output directory
3. **Gemini integration**: Find where the Gemini/Generative AI API is called:
   - Look for `@google/genai`, `@google/generative-ai`, or direct fetch calls to `generativelanguage.googleapis.com`
   - Check for API key references in config files (vite.config, webpack.config, .env usage)
4. **API key exposure**: Identify if/how the API key is being bundled into client code

## Step 2: Create Netlify Configuration

Create `netlify.toml` at the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"  # Adjust based on actual build output (could be "build", "out", etc.)
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

Adjust `publish` directory based on the actual build output folder you discovered.

## Step 3: Create Netlify Function(s) for Gemini API

Create `netlify/functions/` directory and add function(s) to proxy Gemini API calls.

### For Chat/Streaming Applications

Create `netlify/functions/chat.js`:

```javascript
const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
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

  try {
    const { history, userMessage, systemInstruction } = JSON.parse(event.body || "{}");

    if (!userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing 'userMessage' in request body" }),
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

    const client = new GoogleGenAI({ apiKey });

    const chat = client.chats.create({
      model: "gemini-2.0-flash",  // Adjust model as needed
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant.",
        temperature: 0.7,
      },
      history: (history || []).map((h) => ({
        role: h.role === "model" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage({ message: userMessage });
    const responseText = result.text || "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: responseText }),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to get AI response",
        detail: error.message
      }),
    };
  }
};
```

### For Simple Generate/Prompt Applications

Create `netlify/functions/generate.js`:

```javascript
const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

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

  try {
    const { prompt, config } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing 'prompt' in request body" }),
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

    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: config?.model || "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: config?.temperature || 0.7,
        responseMimeType: config?.responseMimeType || "text/plain",
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: response.text || "" }),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate content",
        detail: error.message
      }),
    };
  }
};
```

## Step 4: Update Frontend to Call Netlify Functions

Modify the existing Gemini service file to call the Netlify function instead of the Gemini API directly.

Replace direct `@google/genai` usage with fetch calls:

```javascript
// Before: Direct Gemini SDK call
// const client = new GoogleGenAI({ apiKey });
// const result = await chat.sendMessageStream({ message });

// After: Call Netlify function
const response = await fetch("/.netlify/functions/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    history: messageHistory,
    userMessage: userInput,
    systemInstruction: "Your system prompt here...",
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.error);
const aiResponse = data.response;
```

Key changes to make:
1. Remove `@google/genai` import from frontend code
2. Remove any API key references from frontend
3. Replace streaming with single request/response (or implement polling)
4. Update UI to handle non-streaming gracefully

## Step 5: Remove API Key Exposure

Check and clean these common exposure points:

### Vite Projects (vite.config.ts/js)
Remove `define` blocks that inject API keys:
```javascript
// REMOVE THIS:
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}
```

### Webpack Projects
Remove DefinePlugin entries for API keys.

### Environment Files
- Keep `.env` and `.env.local` in `.gitignore`
- Remove any committed `.env` files with real keys
- API key should ONLY exist in Netlify dashboard environment variables

## Step 6: Update Dependencies

In `package.json`, move `@google/genai` to dependencies (it's needed by Netlify functions):

```json
{
  "dependencies": {
    "@google/genai": "^1.0.0"
  }
}
```

Netlify will install dependencies before running functions.

## Step 7: Update Documentation

Add deployment instructions to README.md:

```markdown
## Deployment to Netlify

1. Push this repo to GitHub
2. Connect to Netlify (New site from Git)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable in Netlify dashboard:
   - Key: `GEMINI_API_KEY`
   - Value: Your Google AI Studio API key
5. Deploy!

### Local Development with Netlify Functions

```bash
npm install -g netlify-cli
netlify dev
```

This runs both the frontend (port 3000) and functions locally.
```

## Step 8: Test the Build

Run these commands to verify everything works:

```bash
# Install dependencies
npm install

# Test production build
npm run build

# Test with Netlify CLI (optional but recommended)
npm install -g netlify-cli
netlify dev
```

## Summary Checklist

After completing all steps, verify:

- [ ] `netlify.toml` exists with correct build/publish settings
- [ ] `netlify/functions/` directory exists with Gemini proxy function(s)
- [ ] Frontend calls `/.netlify/functions/*` instead of Gemini API directly
- [ ] No API keys in any frontend code or config files
- [ ] No API keys committed to git (check `.gitignore`)
- [ ] `npm run build` succeeds without errors
- [ ] README has Netlify deployment instructions

## Environment Variables for Netlify Dashboard

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google AI Studio API key |

Set this in: Netlify Dashboard → Site Settings → Environment Variables
