import { TextSegment } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_VOICE, voiceOptions } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Serialize Mongoose documents to plain JSON objects (strips ObjectId, Date, etc.)
export const serializeData = <T>(data: T): T =>
  JSON.parse(JSON.stringify(data));

// Auto generate slug
export function generateSlug(text: string): string {
  return text
    .replace(/\.[^/.]+$/, "") // Remove file extension (.pdf, .txt, etc.)
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from both ends
    .replace(/[^\w\s-]/g, "") // Remove special characters (keep letters, numbers, spaces, hyphens)
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Escape regex special characters to prevent ReDoS attacks
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 根据文本语言智能计算词数：中文按字符，英文按空格分词
const countWords = (text: string): number => {
  // 如果包含中文字符，按字符数算（去除空白）
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  if (hasChinese) {
    return [...text.replace(/\s/g, "")].length;
  }
  // 纯英文/拉丁语系：按空格分词
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

// Splits text content into segments for MongoDB storage and search
export const splitIntoSegments = (
  text: string,
  segmentSize: number = 500, // Maximum characters per segment
  overlapSize: number = 50 // Characters to overlap between segments for context
): TextSegment[] => {
  // Validate parameters to prevent infinite loops
  if (segmentSize <= 0) {
    throw new Error("segmentSize must be greater than 0");
  }
  if (overlapSize < 0 || overlapSize >= segmentSize) {
    throw new Error("overlapSize must be >= 0 and < segmentSize");
  }

  // const words = text.split(/\s+/).filter((word) => word.length > 0);
  // 针对中文分段情景优化
  const chars = [...text]; // Unicode-safe
  const segments: TextSegment[] = [];
  let segmentIndex = 0;
  let startIndex = 0;

  while (startIndex < chars.length) {
    let endIndex = Math.min(startIndex + segmentSize, chars.length);

    // +
    if (endIndex < chars.length) {
      const maxLookBack = Math.min(
        Math.max(Math.floor(segmentSize * 0.2), 1),
        30
      );
      let bestSplit = endIndex;

      for (
        let i = endIndex;
        i > endIndex - maxLookBack && i > startIndex;
        i--
      ) {
        if (/[。！？.!?;；,，\n]/.test(chars[i - 1])) {
          bestSplit = i;
          break;
        }
      }
      endIndex = bestSplit;
    }

    const segmentText = chars.slice(startIndex, endIndex).join("");

    segments.push({
      text: segmentText,
      segmentIndex,
      wordCount: countWords(segmentText),
    });

    segmentIndex++;
    if (endIndex >= chars.length) break;
    startIndex = endIndex - overlapSize;
  }

  return segments;
};

// Get voice data by persona key or voice ID
export const getVoice = (persona?: string) => {
  if (!persona) return voiceOptions[DEFAULT_VOICE];

  // Find by voice ID
  const voiceEntry = Object.values(voiceOptions).find((v) => v.id === persona);
  if (voiceEntry) return voiceEntry;

  // Find by key
  const voiceByKey = voiceOptions[persona as keyof typeof voiceOptions];
  if (voiceByKey) return voiceByKey;

  // Default fallback
  return voiceOptions[DEFAULT_VOICE];
};

// Format duration in seconds to MM:SS format
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export async function parsePDFFile(file: File) {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }

    // File -> 二进制数据（arrayBuffer）
    const arrayBuffer = await file.arrayBuffer();

    // 创建PDF加载任务，等待加载完成
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    // 生成封面文件
    const firstPage = await pdfDocument.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2 }); // 2x 图片尺寸以提高清晰度

    // 创建canvas元素，将PDF页面渲染到canvas中
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not get canvas context");
    }

    await firstPage.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    // 转换为Base 64格式的PNG图片
    const coverDataURL = canvas.toDataURL("image/png");

    // 提取PDF中所有的文本（Text）
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");
      fullText += pageText + "\n";
    }

    // 分割为segment，便于搜索。
    const segments = splitIntoSegments(fullText);

    // 释放内存，清理任务
    await pdfDocument.destroy();

    return {
      content: segments,
      cover: coverDataURL,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      `Failed to parse PDF file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
