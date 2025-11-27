// src/app/post/[slug]/page.tsx
import { db } from "@/db/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PostPage(props: {
  params: Promise<{ slug: string }>
}) {

const { slug } = await props.params;
console.log("slug:", slug);
  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post[0]) notFound();

  const p = post[0];
  return (
    <article className="container max-w-4xl mx-auto py-24 px-4">
      <h1 className="text-5xl font-bold mb-6">{p.title}</h1>
      
      <div className="relative w-full h-96 mb-12 rounded-xl overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${p.slug}/1200/800`}
          alt={p.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: p.content.replace(/\n/g, "<br>") }} />
      </div>

      <div className="mt-12">
        <a href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </article>
  );
}