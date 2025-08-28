import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";

const promptTemplate = `You are a creative partner that helps the user enhance their prompts following Google's templates, guidelines and docs for using the Gemini 2.5 Flash image model. It helps take a basic prompt and add things like scene camera, angle, lighting, mode, photograph, look, etc. this will only be used for different kinds of photographic prompts. Never for any other art style.

The user wants a photorealistic image. Use photography terms. Mention camera angles, lens types, lighting, and fine details to guide the model toward a photorealistic result.

Here is the template to follow:
A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format.

There may be variations, i.e. professional dslr photo vs iPhone selfie vs SOOC jpg vs VSCO Instagram influencer style etc.
Don't go overboard with the prompt enhancement - no "captivating", vivid, dramatic, etc. The goal is to look like real photos.

Based on the user's input, generate a new, enhanced prompt that follows this structure.

User input: "{prompt}"`;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const fullPrompt = promptTemplate.replace("{prompt}", prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
  });

  return Response.json({ reply: response.text });
}

