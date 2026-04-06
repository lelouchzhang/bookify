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

// 唯一索引 确保同一本书不会出现重复的段落序号，1代表升序（-1代表降序）
BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
// 普通索引，按页码查询段落能力的加速
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 });
// 文本索引，全文搜索能力，“text”为特殊语法，与排序无关，只是全文搜索。
BookSegmentSchema.index({ bookId: 1, content: "text" });

const BookSegment =
  models.BookSegment || model<IBookSegment>("BookSegment", BookSegmentSchema);

export default BookSegment;
