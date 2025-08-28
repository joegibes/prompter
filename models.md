# Model Tracking Document

This document tracks the exact model names and usage examples as specified by the user.

## Chat & Prompt Enhancement Model

- **Model Name:** `gemini-2.5-flash`

## Image Generation Models

1.  **Imagen 4.0**
    -   **Model Name:** `imagen-4.0-generate-001`
    -   **Usage Example (Node.js):**
        ```ts
        import { VertexAI } from "@google-cloud/vertexai";

        const vertexAI = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT!,
            location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
        });

        const model = vertexAI.preview.getGenerativeModel({
            model: "imagen-4.0-generate-001",
        });

        const resp = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "A tiny banana in a grand restaurant" }] }],
        });

        const inlineData = resp.response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        ```

2.  **Gemini 2.5 Flash Image Preview**
    -   **Model Name:** `gemini-2.5-flash-image-preview`
    -   **Notes:** The response from this model contains inline image data that must be parsed.
    -   **Usage Example (Node.js):**
        ```ts
        import { GoogleGenAI, Modality } from "@google/genai";
        import * as fs from "node:fs";

        async function main() {

          const ai = new GoogleGenAI({});

          const prompt =
            "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image-preview",
            contents: prompt,
          });
          for (const part of response.candidates[0].content.parts) {
            if (part.text) {
              console.log(part.text);
            } else if (part.inlineData) {
              const imageData = part.inlineData.data;
              const buffer = Buffer.from(imageData, "base64");
              fs.writeFileSync("gemini-native-image.png", buffer);
              console.log("Image saved as gemini-native-image.png");
            }
          }
        }

        main();
        ```
