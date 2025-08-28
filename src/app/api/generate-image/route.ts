import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);

      // Based on the user's Python example, we need to find the inlineData part.
      const firstCandidate = response.response.candidates?.[0];
      const inlineDataPart = firstCandidate?.content?.parts?.find(
        (part) => part.inlineData
      )?.inlineData;

      if (!inlineDataPart) {
        throw new Error("No image data found in the response.");
      }

      const imageBase64 = inlineDataPart.data;
      const mimeType = inlineDataPart.mimeType;
      const imageUrl = `data:${mimeType};base64,${imageBase64}`;

      return NextResponse.json({ imageUrl });

    } catch (error: any) {
      console.error("Error generating image with Gemini:", error);
      return NextResponse.json(
        { error: "Failed to generate image.", details: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: `Model ${modelName} is not supported.` },
    { status: 400 }
  );
}
