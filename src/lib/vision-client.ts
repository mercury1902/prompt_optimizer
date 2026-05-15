import type { OptimizeResult } from "./router-client";
import { parseAIJSON } from "./utils";

export interface VisionResult extends OptimizeResult {
  imageDescription?: string;
  imageAnalysis?: {
    objects: string[];
    text: string[];
    context: string;
  };
}

export interface ImageAttachment {
  id: string;
  dataUrl: string;
  file: File;
  name: string;
}

const VISION_SYSTEM_PROMPT = `Bạn là Vision AI Assistant với khả năng phân tích hình ảnh chuyên nghiệp.

NHIỆM VỤ: Phân tích hình ảnh được cung cấp và:
1. Mô tả chi tiết nội dung hình ảnh
2. Trích xuất text nếu có (OCR)
3. Xác định các đối tượng chính
4. Đề xuất lệnh ClaudeKit phù hợp nếu liên quan

Định dạng JSON response:
{
  "optimizedPrompt": "Prompt tối ưu dựa trên hình ảnh",
  "suggestedCommand": "/xxx",
  "commandReason": "Giải thích tại sao chọn lệnh này",
  "alternativeCommands": ["/yyy"],
  "confidence": 0.9,
  "needsWorkflow": false,
  "imageDescription": "Mô tả chi tiết hình ảnh",
  "imageAnalysis": {
    "objects": ["đối tượng 1", "đối tượng 2"],
    "text": ["text trong ảnh"],
    "context": "Ngữ cảnh/bối cảnh"
  }
}`;

/**
 * Convert image file to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image if it exceeds max size
 */
export async function compressImage(
  dataUrl: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine format based on original
      const format = dataUrl.includes("image/png") ? "image/png" : "image/jpeg";
      const compressed = canvas.toDataURL(format, quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Analyze image using AI vision API
 */
export async function analyzeImage(
  imageDataUrl: string,
  userPrompt?: string
): Promise<VisionResult> {
  const apiKey = import.meta.env.PUBLIC_NINEROUTER_API_KEY;
  const model = import.meta.env.PUBLIC_VISION_MODEL || "claude-3-5-sonnet-20240620";
  const baseUrl = import.meta.env.PUBLIC_NINEROUTER_BASE_URL || "http://localhost:20128/v1";

  // Extract base64 data
  const base64Data = imageDataUrl.split(",")[1];
  const mimeType = imageDataUrl.split(":")[1]?.split(";")[0] || "image/jpeg";

  const content = [
    {
      type: "text",
      text: userPrompt || "Phân tích hình ảnh này và đề xuất lệnh ClaudeKit phù hợp nếu có.",
    },
    {
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${base64Data}`,
      },
    },
  ];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const content_ = data.choices[0]?.message?.content;

  if (!content_) {
    throw new Error("Empty response from Vision API");
  }

  const parsed = parseAIJSON<VisionResult>(content_);
  if (!parsed) {
    throw new Error("Failed to parse Vision API response as JSON");
  }
  
  return parsed;
}


/**
 * Optimize prompt with optional image attachment
 */
export async function optimizeWithVision(
  textPrompt: string,
  imageDataUrl?: string
): Promise<VisionResult> {
  if (!imageDataUrl) {
    // Fall back to regular optimize
    const { optimizePrompt } = await import("./router-client");
    const result = await optimizePrompt(textPrompt);
    return { ...result, imageDescription: undefined, imageAnalysis: undefined };
  }

  return analyzeImage(imageDataUrl, textPrompt);
}
