"use server";
import { connToDB } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { escapeRegex, generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export const createBook = async (data: CreateBook) => {
  try {
    await connToDB();
    // 为书籍生成slug，利用slug的唯一性查重。
    const slug = generateSlug(data.title);
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        success: true,
        // 每当传递对象时需要序列化清洗。
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }
    // todo: 检查用户的创建Book是否达到订阅限制
    // 这里创建的只是一个"书皮"，实际内容需要在后续的分段中创建。
    const book = await Book.create({ ...data, slug, totalSegments: 0 });

    revalidatePath("/");

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (error) {
    console.error(`Error creating book: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[]
) => {
  try {
    await connToDB();
    console.log(`Saving book segments ...`);
    // 插入segments
    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId: clerkId,
        bookId: bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      })
    );

    await BookSegment.insertMany(segmentsToInsert);

    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

    console.log(`Book segments saved successfully.`);

    return {
      success: true,
      data: { segmentsCreated: segments.length },
    };
  } catch (error) {
    console.error("Error saving book segements, Deleting book ...", error);
    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);
    console.log(
      "Deleted book segments and book due to failure to save segments."
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const checkBookExists = async (title: string) => {
  try {
    await connToDB();

    const slug = generateSlug(title);
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        exists: true,
        data: serializeData(existingBook),
      };
    }
    return {
      exists: false,
    };
  } catch (error) {
    console.log(`Error checking book exists:`, error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const getAllBooks = async (search?: string) => {
  try {
    await connToDB();

    let query = {};

    if (search) {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");
      query = {
        $or: [{ title: { $regex: regex } }, { author: { $regex: regex } }],
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books),
    };
  } catch (error) {
    console.error(`Error getting books: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    await connToDB();
    const book = await Book.findOne({ slug }).lean();
    if (!book) {
      return { success: false, error: "Book not found" };
    }
    return {
      success: true,
      data: serializeData(book),
    };
  } catch (error) {
    console.error(`Error getting books: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Searches book segments using MongoDB text search with regex fallback
export const searchBookSegments = async (
  bookId: string,
  query: string,
  limit: number = 5
) => {
  try {
    await connToDB();

    console.log(`Searching for: "${query}" in book ${bookId}`);

    const bookObjectId = new mongoose.Types.ObjectId(bookId);

    // Try MongoDB text search first (requires text index)
    let segments: Record<string, unknown>[] = [];
    try {
      segments = await BookSegment.find({
        bookId: bookObjectId,
        $text: { $search: query },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();
    } catch {
      // Text index may not exist — fall through to regex fallback
      segments = [];
    }

    // Fallback: regex search matching ANY keyword
    if (segments.length === 0) {
      const keywords = query.split(/\s+/).filter((k) => k.length > 2);
      if (keywords.length === 0) {
        return {
          success: true,
          data: [],
        };
      }
      const pattern = keywords.map(escapeRegex).join("|");

      segments = await BookSegment.find({
        bookId: bookObjectId,
        content: { $regex: pattern, $options: "i" },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ segmentIndex: 1 })
        .limit(limit)
        .lean();
    }

    console.log(`Search complete. Found ${segments.length} results`);

    return {
      success: true,
      data: serializeData(segments),
    };
  } catch (error) {
    console.error("Error searching segments:", error);
    return {
      success: false,
      error: (error as Error).message,
      data: [],
    };
  }
};
