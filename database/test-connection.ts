import dotenv from "dotenv";
import path from "path";

// 手动加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
  try {
    const { connToDB } = await import("./mongoose");
    console.log("正在测试 MongoDB 连接...");
    const connection = await connToDB();
    console.log("✅ MongoDB 连接成功!");
    console.log(
      "数据库状态:",
      connection.connection.readyState === 1 ? "已连接" : "未连接"
    );
    console.log("数据库名称:", connection.connection.name);
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB 连接失败:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
