"use client";

import { useEffect, useRef } from "react";
import type { HMSStore } from "@100mslive/hms-video-store";

interface WhiteboardProps {
  hmsStore: HMSStore;
}

export default function Whiteboard({ hmsStore }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Whiteboard will be rendered by 100ms SDK
    // This is just a container
    if (containerRef.current) {
      // The whiteboard component is managed by 100ms
      console.log("Whiteboard container ready");
    }
  }, [hmsStore]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Whiteboard is rendered by 100ms SDK */}
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Whiteboard will appear here</p>
      </div>
    </div>
  );
}

