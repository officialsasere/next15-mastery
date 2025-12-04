// src/app/dashboard/CreatePostForm.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import dynamic from "next/dynamic";
import { commands } from "@uiw/react-md-editor";

import { Content } from "next/font/google";


 
 const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => ({ default: mod.default })),
  { ssr: false }
);



type Props = {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    content?: string;
    imageUrl?: string;
  };
};

export default function CreatePostForm({ onSubmit, defaultValues }: Props) {
  const [content, setContent] = useState(defaultValues?.content || "# Start writing...");
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl || "");
  const contentRef = useRef<HTMLTextAreaElement>(null);

   const handleContentChange = (value?: string) => {
    if (value !== undefined) {
      setContent(value);
    }
  };
 

  return (
    <form action={async (data) => {
        data.set("imageUrl", imageUrl);
        data.set("content", content); 
        await onSubmit(data);
        if (!defaultValues) setImageUrl(""); // only reset on create
      }} className="bg-muted p-8 rounded-xl max-w-2xl mx-auto space-y-8">
      <Input
        name="title"
        placeholder="Post title..."
        defaultValue={defaultValues?.title}
        required
      />
      <div data-color-mode="light">
        <MDEditor
          value={content} // Controlled value
          onChange={handleContentChange} // Direct state update
          height={400}
          preview="edit" // Edit + preview side-by-side
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.title,
            commands.divider,
            commands.link,
            commands.quote,
            commands.code,
            commands.codeBlock,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.fullscreen,
           
          ]}
        />
      </div>
       <input type="hidden" name="content" value={content} />
    <input type="hidden" name="imageUrl" value={imageUrl} />

   <UploadDropzone<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          
       appearance={{
    label: "text-foreground !text-foreground",
    allowedContent: "text-muted-foreground !text-muted-foreground text-sm",
  }}
          onDrop={(files) => console.log("Dropped:", files)}
         onClientUploadComplete={(res) => {
  if (res?.[0]?.ufsUrl) {
    setImageUrl(res[0].ufsUrl);
    alert("Image uploaded!");
  }
}}
          onUploadError={(error) => {
            console.error("UploadThing error:", error);
            alert("Upload failed: " + error.message);
          }}
        />
  {imageUrl ? (
        <p className="text-sm text-green-600">Image ready</p>
      ) : defaultValues?.imageUrl ? (
        <p className="text-sm text-blue-600">Keep current image or upload new</p>
      ) : null}

     <Button type="submit" size="lg" className="w-full">
        {defaultValues ? "Update Post" : "Create Post"}
      </Button>
    </form>
  );
}