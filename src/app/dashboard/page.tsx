import { db } from '@/db/db';
import { posts,users } from '@/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';



export default async function Dashboard() {

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // Auto-create user in DB
  const [dbUser] = await db
    .insert(users)
    .values({
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: clerkUser.emailAddresses[0]?.emailAddress ?? null },
    })
    .returning();

    console.log("CLERK ID:", clerkUser.id)


  
// 1. Check existing posts
let userPosts = await db
  .select()
  .from(posts)
  .where(eq(posts.authorId, dbUser.id));

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// 2. If none, seed automatically (NO BUTTON)
const cookieHeader = (await headers()).get("cookie");
if (userPosts.length === 0) {
  await fetch(`${baseUrl}/api/seed`, {
  method: "GET",
  headers: { "Content-Type": "application/json",
    cookie: cookieHeader ?? ""
  },
});

// revalidatePath('/dashboard');



  // 3. Fetch again to get fresh posts
  userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, dbUser.id));
}
console.log("USER POSTS:", userPosts);


  // Server Action that calls your existing /api/seed
//  async function runSeed() {
//   "use server";

//   const cookieHeader = (await headers()).get("cookie");

//   const res = await fetch(`${baseUrl}/api/seed`, {
//     method: "GET",
//     headers: {
//       cookie: cookieHeader ?? "",
//     },
//   });
//    const payload = await res.json();
//   console.log("SEED PAYLOAD:", payload);

//   if (!res.ok) throw new Error("Seed failed");
//   return payload;
// }
 return (
    <div className="container py-24 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold">
        Welcome, {clerkUser.firstName || "User"} 👋
      </h1>
      <p className="text-xl text-muted-foreground mt-4">
        {clerkUser.emailAddresses[0].emailAddress}
      </p>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold">
          You have {userPosts.length} Posts
        </h2>

        {/* {userPosts.length === 0 && (
          <form action={runSeed}>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Run Seed Data
            </button>
          </form>
        )} */}

        {userPosts.length > 0 && (
          <pre className="mt-8 bg-muted p-6 rounded-lg text-left text-sm overflow-auto">
            {JSON.stringify(userPosts, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
