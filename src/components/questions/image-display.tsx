"use client";

import NextImage from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Expand, Download } from "lucide-react";
import React, { useState } from 'react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  dataAiHint?: string;
  initialWidth?: number;
  initialHeight?: number;
}

export function ImageDisplay({ src, alt, dataAiHint, initialWidth = 600, initialHeight = 400 }: ImageDisplayProps) {
  const [scale, setScale] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  
  // Fullscreen functionality would require more complex handling (e.g. browser API, dialog)
  // This is a simplified placeholder for the idea
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);


  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-2 relative">
        <div className="relative w-full overflow-hidden" style={{ 
            height: isFullScreen ? '80vh' : `${initialHeight * scale}px`, // Adjust height for fullscreen
            maxWidth: isFullScreen ? '90vw' : '100%'
        }}>
          <NextImage
            src={src}
            alt={alt}
            fill
            className="object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            data-ai-hint={dataAiHint}
          />
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1 bg-background/70 p-1 rounded-md backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullScreen} title="Toggle Fullscreen" className="h-8 w-8">
            <Expand className="h-4 w-4" />
          </Button>
           <a href={src} download target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" title="Download Image" className="h-8 w-8">
                <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
