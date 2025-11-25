// src/app/api/seed/route.ts
import { db } from "@/db/db";
import { users, posts } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUserId = clerkUser.id;

  // 1. Insert or update user
  await db
    .insert(users)
    .values({
      id: clerkUserId,
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      role: "pro",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: clerkUser.emailAddresses[0]?.emailAddress ?? null },
    });

  // 2. Seed posts
  const blogDir = path.join(process.cwd(), "src/content/blog");
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

  let seeded = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
    const title = content.split("\n")[0].replace("# ", "").trim() || file;
    const slug = file.replace(".mdx", "");

    await db
      .insert(posts)
      .values({
        title,
        slug,
        content,
        published: true,
        authorId: clerkUserId,
      })
      .onConflictDoNothing();

    seeded++;
  }

  return NextResponse.json({
    message: `Seeded ${seeded} posts for ${clerkUserId}`,
    seeded,
  });
}