// src/app/page.tsx
import { db } from "@/db/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

// Force this to be a server component
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';



export default async function Home() {
  const clerkUser = await currentUser();
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-6 animate-fade-in">
          <Badge 
            variant="secondary" 
            className="mb-4 px-4 py-1.5 text-sm font-medium animate-slide-down"
          >
            <Sparkles className="w-3 h-3 mr-1.5 inline" />
            Building in Public
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70 animate-slide-up">
            Sasere's Blog platform
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up-delay">
            Building in public — Next.js 15, MDX, Drizzle, UploadThing, Clerk
          </p>

          {/* <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in-delay">
            <Calendar className="w-4 h-4" />
            <span>11-day challenge · No excuses</span>
          </div> */}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container max-w-6xl mx-auto px-4 pb-24">
        {allPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post, index) => (
              <Link 
                href={`/post/${post.slug}`} 
                key={post.id}
                className="group animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {post.imageUrl && (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        loading="eager"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  
                  <CardHeader className="space-y-2">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    {post.createdAt && (
                      <CardDescription className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
            <p className="text-muted-foreground mb-6">
              The journey begins soon. Check back for updates!
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Create Your First Post</Link>
            </Button>
          </div>
        )}
      </section>


    </main>
  );
}