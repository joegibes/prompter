import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { prompt, model: modelName } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 }
    );
  }

  if (modelName === "imagen-4.0-generate-001") {
    // TODO: Implement Imagen model via Vertex AI
    return NextResponse.json(
      { error: "The Imagen model is not yet implemented." },
      { status: 501 } // 501 Not Implemented
    );
  }

  if (modelName === "gemini-2.5-flash-image-preview") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          const imageUrl = `data:${mimeType};base64,${imageData}`;
          return NextResponse.json({ imageUrl });
        }
      }
      throw new Error("No image data found in the response.");
      } catch (error: unknown) {
        console.error("Error generating image with Gemini:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
          { error: "Failed to generate image.", details: message },
          { status: 500 }
        );
      }
  }

  return NextResponse.json(
    { error: `Model ${modelName} is not supported.` },
    { status: 400 }
  );
}
