// src/app/dashboard/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Trash2, PlusCircle, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <div className="container py-12 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Welcome, {clerkUser.firstName || "Creator"}! 👋
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Badge variant="secondary" className="text-base px-4 py-1.5">
              <span className="font-bold text-primary mr-1">{userPosts.length}</span>
              {userPosts.length === 1 ? "Post" : "Posts"}
            </Badge>
          </div>
        </div>

        {/* Create Post Form */}
        <div className="mb-16 animate-slide-up">
          <CreatePostForm onSubmit={createPost} />
        </div>

        {/* Posts Grid */}
        {userPosts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Your Posts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    {post.imageUrl && (
                      <div className="relative overflow-hidden">
                        <AspectRatio ratio={16 / 9}>
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            loading="eager"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                          
                          {/* Floating Badge */}
                          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                            Published
                          </Badge>
                        </AspectRatio>
                      </div>
                    )}

                    <CardHeader className="space-y-3">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-xl">
                        {post.title}
                      </CardTitle>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <time>
                          {new Date(post.createdAt!).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </CardHeader>

                    <CardFooter className="flex gap-2 pt-4 border-t">
                      <Button asChild variant="default" className="flex-1 group/btn">
                        <Link href={`/post/${post.slug}`} className="flex items-center gap-2">
                          <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          View
                        </Link>
                      </Button>

                      <form action={deletePost.bind(null, post.id)}>
                        <Button
                          type="submit"
                          variant="destructive"
                          size="icon"
                          className="transition-all hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <PlusCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Create your first post to get started on your blogging journey!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}