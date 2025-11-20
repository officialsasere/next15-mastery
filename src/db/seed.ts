
import { users, posts } from "./schema";
import fs from "fs";
import path from "path";
import { db } from "./db";

async function seed() {
  // 1. Create test user
  const [user] = await db.insert(users).values({ clerkId: "test_user", role: "pro" }).returning();

  // 2. Read MDX files
  const blogDir = path.join(process.cwd(), "src/content/blog");
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith(".mdx")).slice(0, 10);

  for (const file of files) {
    const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
    const title = content.split("\n")[0].replace("# ", "").trim() || file;
    const slug = file.replace(".mdx", "");

    await db.insert(posts).values({
      title,
      slug,
      content,
      published: true,
      authorId: user.id,
    }).onConflictDoNothing();
  }

  console.log("Seeded 10 posts");
}

seed().catch(console.error);