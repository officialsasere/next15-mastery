// src/app/post/[slug]/page.tsx
import { db } from "@/db/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

export default async function PostPage(props: {
  params: Promise<{ slug: string }>
}) {

const { slug } = await props.params;
// console.log("slug:", slug);
  const postData = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

    
    const post = postData[0];
    if (!post) notFound();
    // Compile MDX string → React component
  const { default: MDXContent } = await evaluate(post.content, {
    ...runtime,
    // Optional: add custom components later (images, code blocks, etc.)
    // components: { img: CustomImage, pre: CustomPre }
  });
  return (
    <article className="container max-w-4xl mx-auto py-24 px-4">
      <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
      
       {/* Display uploaded image */}
      {post.imageUrl && (
        <div className="relative w-full h-96 mb-12 rounded-xl overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
{/* 
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>") }} />
      </div> */}

      {/* Render MDX beautifully */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MDXContent />
      </div>

      <div className="flex gap-4 mt-8">
  <Button asChild>
    <Link href={`/post/${post.slug}/edit`}>Edit Post</Link>
  </Button>
  <Button variant="outline" asChild>
    <Link href="/dashboard">← Back to Dashboard</Link>
  </Button>
</div>
    </article>
  );
}