"use client";

import { useState, useRef, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiInputProps {
  placeholder: string;
  isParsing: boolean;
  error: string | null;
  onParse: (input: string) => void;
}

const MIN_ROWS = 3;
const MAX_ROWS = 6;

export function AiInput({ placeholder, isParsing, error, onParse }: AiInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24;
    const minHeight = lineHeight * MIN_ROWS;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize(e.target);
  };

  const handleParse = () => {
    const trimmed = value.trim();
    if (!trimmed || isParsing) return;
    onParse(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleParse();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={MIN_ROWS}
        disabled={isParsing}
        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="min-h-5 flex-1">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button
          size="sm"
          disabled={isEmpty || isParsing}
          onClick={handleParse}
        >
          {isParsing ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <Sparkles data-icon="inline-start" />
          )}
          {isParsing ? "Parsing…" : "Parse with AI"}
        </Button>
      </div>
    </div>
  );
}
