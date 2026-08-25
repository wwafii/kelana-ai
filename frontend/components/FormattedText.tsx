"use client";

import React from "react";

interface FormattedTextProps {
  text: string;
  className?: string;
  badgeStyle?: boolean;
}

export default function FormattedText({
  text,
  className = "",
  badgeStyle = true,
}: FormattedTextProps) {
  if (!text) return null;

  // Clean any leading bullet artifacts or stray asterisks
  const cleanText = text.replace(/^[\s*•\-–\d.]+\s*/, "").trim();

  // Split by markdown bold (**...**) and italic (*...*)
  const tokens = cleanText.split(/(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
          const content = token.slice(2, -2).trim();
          if (!content) return null;
          return badgeStyle ? (
            <strong
              key={idx}
              className="font-bold text-slate-900 bg-sky-100/70 text-sky-950 px-1.5 py-0.5 mx-0.5 rounded-md border border-sky-200/70 inline"
            >
              {content}
            </strong>
          ) : (
            <strong key={idx} className="font-bold text-slate-900">
              {content}
            </strong>
          );
        }

        if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
          const content = token.slice(1, -1).trim();
          return (
            <em key={idx} className="italic text-slate-800 font-medium">
              {content}
            </em>
          );
        }

        return <span key={idx}>{token}</span>;
      })}
    </span>
  );
}
