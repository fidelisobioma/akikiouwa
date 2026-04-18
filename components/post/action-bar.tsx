"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionBarProps {
  mode: "write" | "preview";
  onModeChange: (mode: "write" | "preview") => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isLoading: boolean;
}

export function ActionBar({
  mode,
  onModeChange,
  onSaveDraft,
  onPublish,
  isLoading,
}: ActionBarProps) {
  return (
    <div
      className="right-0 left-0 z-40 fixed bg-background/95 supports-backdrop-filter:bg-background/60 backdrop-blur border-b h-14"
      style={{ top: "64px" }} // sits directly below navbar
    >
      <div className="flex justify-between items-center gap-4 mx-auto px-4 max-w-7xl h-full">
        {/* Left — write / preview tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            type="button"
            size="sm"
            variant={mode === "write" ? "default" : "ghost"}
            className="px-3 h-7 text-xs"
            onClick={() => onModeChange("write")}
          >
            Write
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "ghost"}
            className="px-3 h-7 text-xs"
            onClick={() => onModeChange("preview")}
          >
            Preview
          </Button>
        </div>

        {/* Right — save draft and publish buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onSaveDraft}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                Saving...
              </>
            ) : (
              "Save draft"
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={onPublish}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
