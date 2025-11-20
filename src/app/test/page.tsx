import { db } from "@/db/db";
import { posts } from "@/db/schema";


export default async function Test() {
  const allPost = await db.select().from(posts);
  return <pre>{JSON.stringify(allPost, null, 2)}</pre>
}