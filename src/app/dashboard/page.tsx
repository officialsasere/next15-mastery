

// src/app/dashboard/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";




import CreatePostForm from "./CreatePostForm";

export default async function Dashboard() {

  const clerkUser = await currentUser();
if (!clerkUser) redirect("/sign-in");

// Bulletproof user lookup/create
let dbUser = await db
  .select()
  .from(users)
  .where(eq(users.id, clerkUser.id))
  .then(res => res[0]);

if (!dbUser) {
  [dbUser] = await db
    .insert(users)
    .values({
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
    })
    .returning();
}
  

  const userPosts = await db.select().from(posts).where(eq(posts.authorId, dbUser.id));

  async function createPost(formData: FormData) {
   "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageUrl = formData.get("imageUrl") as string;

   if (!title?.trim() || !content?.trim() || !imageUrl) return;

    await db.insert(posts).values({
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-").slice(0, 50),
      content,
      imageUrl,
      authorId: dbUser.id,
      published: true,
    });

    revalidatePath("/dashboard");
  }

  async function deletePost(id: string) {
    "use server";
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/dashboard");
  }

  return (
    <div className="container py-24 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">
        Welcome, {clerkUser.firstName || "User"}
      </h1>
      <p className="text-2xl font-semibold mt-6 text-center mb-12">You have {userPosts.length} Posts</p>

      <CreatePostForm onSubmit={createPost} />

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {userPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {post.imageUrl && (
              <AspectRatio ratio={16 / 8}>
                <Image src={post.imageUrl} alt={post.title} fill className="object-cover w-full h-full" />
              </AspectRatio>
            )}
            <CardHeader>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>

              <p className="text-muted-foreground text-md mb-12 font-semibold">Created: 
        <i className="text-sm pl-2">{new Date(post.createdAt!).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</i>
      </p>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button asChild>
                <Link href={`/post/${post.slug}`}>View Post</Link>
              </Button>

              <form action={deletePost.bind(null, post.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}


