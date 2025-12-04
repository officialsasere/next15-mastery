// src/components/Loading.tsx
import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="text-center space-y-6 animate-fade-in">
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-pulse" />
          
          {/* Inner rotating icon - Tailwind's animate-spin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          
          {/* Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-bounce" />
          <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-primary/60 animate-spin" style={{ animationDelay: '150ms' }} />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground animate-pulse">
            Loading
            <span className="inline-flex ml-1">
              <span className="animate-bounce inline-block">.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Preparing your content...
          </p>
        </div>
      </div>
    </div>
  );
}