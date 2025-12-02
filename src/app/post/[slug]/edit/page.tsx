// src/app/post/[slug]/edit/page.tsx
import { db } from "@/db/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import CreatePostForm from "@/app/dashboard/CreatePostForm";
import { auth } from "@clerk/nextjs/server";



export default async function EditPost( props: { params: Promise< { slug: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { slug } = await props.params;

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .then((res) => res[0]);

  if (!post || post.authorId !== userId) notFound();

  async function updatePost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageUrl = formData.get("imageUrl") as string | undefined;

    if (!title?.trim() || !content?.trim()) return;

    await db
      .update(posts)
           .set({
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-").slice(0, 100),
        content,
        ...(imageUrl && { imageUrl }),
      })
      .where(eq(posts.id, post.id));

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  return (
    <div className="container py-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Edit Post</h1>
      <CreatePostForm
        onSubmit={updatePost}
        defaultValues={{
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl || "",
        }}
      />
    </div>
  );
}