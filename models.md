# Model Tracking Document

This document tracks the exact model names and usage examples as specified by the user.

## Chat & Prompt Enhancement Model

- **Model Name:** `gemini-2.5-flash`

## Image Generation Models

1.  **Imagen 4.0**
    -   **Model Name:** `imagen-4.0-generate-001`
    -   **Notes:** No usage example provided yet. Will need to research the correct API (likely Vertex AI).

2.  **Gemini 2.5 Flash Image Preview**
    -   **Model Name:** `gemini-2.5-flash-image-preview`
    -   **Notes:** The response from this model contains inline image data that must be parsed.
    -   **Usage Example (Python):**
        ```python
        from google import genai
        from google.genai import types
        from PIL import Image
        from io import BytesIO

        client = genai.Client()

        prompt = (
            "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=[prompt],
        )

        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image = Image.open(BytesIO(part.inline_data.data))
                image.save("generated_image.png")
        ```
