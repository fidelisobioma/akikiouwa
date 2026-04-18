"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string) => void;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onInsert,
}: ImageUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setUrlInput("");
    setError("");
    setPreview(null);
    onOpenChange(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      onInsert(data.url);
      handleClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleUrlInsert() {
    if (!urlInput.trim()) {
      setError("Please enter an image URL");
      return;
    }

    try {
      new URL(urlInput); // validate URL format
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    onInsert(urlInput.trim());
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="mr-2 w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              <LinkIcon className="mr-2 w-4 h-4" />
              URL
            </TabsTrigger>
          </TabsList>

          {/* Upload tab */}
          <TabsContent value="upload" className="mt-4">
            <div
              className="hover:bg-muted/40 p-8 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                  <p className="text-muted-foreground text-sm">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="font-medium text-sm">Click to upload image</p>
                  <p className="text-muted-foreground text-xs">
                    JPEG, PNG, WebP, GIF — max 10MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />

            {error && <p className="mt-3 text-destructive text-sm">{error}</p>}
          </TabsContent>

          {/* URL tab */}
          <TabsContent value="url" className="mt-4">
            <div className="flex flex-col gap-3">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError("");
                  // show preview
                  if (e.target.value.trim()) {
                    setPreview(e.target.value.trim());
                  } else {
                    setPreview(null);
                  }
                }}
              />

              {/* URL preview */}
              {preview && (
                <div className="relative bg-muted rounded-lg h-40 overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setPreview(null);
                      setError("Could not load image from this URL");
                    }}
                  />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setUrlInput("");
                    }}
                    className="top-2 right-2 absolute bg-background p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button onClick={handleUrlInsert} disabled={!urlInput.trim()}>
                Insert image
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
