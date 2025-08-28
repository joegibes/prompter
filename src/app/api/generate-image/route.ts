import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { VertexAI } from "@google-cloud/vertexai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt, model: modelName } = await req.json();

  if (modelName === "gemini-2.5-flash-image-preview") {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }
    try {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const inlineDataPart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData
      )?.inlineData;

      if (!inlineDataPart) {
        throw new Error("No image data found in the response.");
      }

      const imageBase64 = inlineDataPart.data;
      const mimeType = inlineDataPart.mimeType;
      const imageUrl = `data:${mimeType};base64,${imageBase64}`;

      return NextResponse.json({ imageUrl });

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error generating image with Gemini:", error);
      return NextResponse.json(
        { error: "Failed to generate image.", details: message },
        { status: 500 }
      );
    }
  }

  if (modelName === "imagen-4.0-generate-001") {
    try {
      if (!process.env.GOOGLE_CLOUD_PROJECT) {
        return NextResponse.json(
          { error: "GOOGLE_CLOUD_PROJECT is not set" },
          { status: 500 }
        );
      }

      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
      });

      const model = vertexAI.preview.getGenerativeModel({ model: modelName });

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const inlineDataPart = response.response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData
      )?.inlineData;

      if (!inlineDataPart) {
        throw new Error("No image data found in the response.");
      }

      const imageBase64 = inlineDataPart.data;
      const mimeType = inlineDataPart.mimeType;
      const imageUrl = `data:${mimeType};base64,${imageBase64}`;

      return NextResponse.json({ imageUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error generating image with Imagen:", error);
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
