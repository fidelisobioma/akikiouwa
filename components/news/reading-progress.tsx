"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("reading progress useEffect fired");
    function updateProgress() {
      const scrollY = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) return;

      const percentage = (scrollY / documentHeight) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    }

    // set initial progress
    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="right-0 left-0 z-50 fixed bg-transparent h-0.75"
      style={{ top: "64px" }} // sits directly below navbar
    >
      <div
        className="bg-primary h-full transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
