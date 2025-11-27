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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const [dbUser] = await db
    .insert(users)
    .values({ id: clerkUser.id, clerkId: clerkUser.id, email: clerkUser.emailAddresses[0]?.emailAddress })
    .onConflictDoUpdate({ target: users.id, set: { email: clerkUser.emailAddresses[0]?.emailAddress } })
    .returning();

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, dbUser.id))
    .orderBy(posts.createdAt);

  async function createPost(formData: FormData) {
    "use server";
    await db.insert(posts).values({
      title: formData.get("title") as string,
      slug: (formData.get("title") as string).toLowerCase().replace(/\s+/g, "-").slice(0, 50),
      content: formData.get("content") as string,
      published: true,
      authorId: dbUser.id,
    });
    revalidatePath("/dashboard");
  }

  async function deletePost(id: string) {
    "use server";
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/dashboard");
  }

  return (
    <div className="container py-24 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Welcome, {clerkUser.firstName || "User"}</h1>
        <p className="text-xl text-muted-foreground mt-2">
          {clerkUser.emailAddresses[0].emailAddress}
        </p>
        <p className="text-2xl font-semibold mt-4">You have {userPosts.length} Posts</p>
      </div>

      {/* CREATE FORM */}
      <form action={createPost} className="mb-16 bg-muted p-8 rounded-xl max-w-2xl mx-auto space-y-6">
        <Input name="title" placeholder="Post title..." required className="text-lg" />
        <Textarea name="content" placeholder="Write your post in MDX..." rows={8} required />
        <Button type="submit" size="lg" className="w-full">Create New Post</Button>
      </form>

      {/* POSTS GRID */}
      {userPosts.length === 0 ? (
        <p className="text-center text-muted-foreground text-xl">No posts yet. Create your first one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={`https://picsum.photos/seed/${post.slug}/800/600`}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </AspectRatio>
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt!).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
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
      )}
    </div>
  );
}