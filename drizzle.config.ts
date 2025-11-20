import { defineConfig } from "drizzle-kit";



export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    
  },
  verbose: true,
  strict: true,
})

// console.log("Drizzle config loaded", process.env.DATABASE_URL);