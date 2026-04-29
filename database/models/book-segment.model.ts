import { IBookSegment } from "@/types";
import { model, models, Schema } from "mongoose";

const BookSegmentSchema = new Schema<IBookSegment>(
  {
    clerkId: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, required: true, index: true },
    content: { type: String, required: true },
    segmentIndex: { type: Number, required: true },
    pageNumber: { type: Number },
    wordCount: { type: Number, required: true },
  },
  { timestamps: true }
);

// 唯一复合索引,确保同一本书的片段顺序不重复，快速按顺序:1 获取章节
BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
// 普通复合索引,根据页码快速定位内容（如"跳转到第 42 页"）
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 });
// 全文索引，支持在单本书内进行全文搜索（$text 查询），“text”为特殊语法，与排序无关，只是全文搜索。
BookSegmentSchema.index({ bookId: 1, content: "text" });

const BookSegment =
  models.BookSegment || model<IBookSegment>("BookSegment", BookSegmentSchema);

export default BookSegment;
