// src/app/dashboard/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";


type Props = {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    content?: string;
    imageUrl?: string;
  };
};

export default function CreatePostForm({ onSubmit, defaultValues }: Props) {
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl || "");

  return (
    <form action={async (data) => {
        data.append("imageUrl", imageUrl);
        await onSubmit(data);
        if (!defaultValues) setImageUrl(""); // only reset on create
      }} className="bg-muted p-8 rounded-xl max-w-2xl mx-auto space-y-8">
      <Input
        name="title"
        placeholder="Post title..."
        defaultValue={defaultValues?.title}
        required
      />
      <Textarea
        name="content"
        placeholder="Write your content..."
        rows={10}
        defaultValue={defaultValues?.content}
        required
      />

   <UploadDropzone<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          
       appearance={{
    label: "text-foreground !text-foreground",
    allowedContent: "text-muted-foreground !text-muted-foreground text-sm",
  }}
          onDrop={(files) => console.log("Dropped:", files)}
          onClientUploadComplete={(res) => {
            // console.log("Upload complete:", res);
            if (res?.[0]?.url) {
              setImageUrl(res[0].url);
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