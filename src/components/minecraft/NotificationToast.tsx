"use client";

import React from "react";

interface NotificationToastProps {
  message: string | null;
}

export function NotificationToast({ message }: NotificationToastProps) {
  if (!message) return null;

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-amber-500 text-amber-400 px-4 py-2 text-xs rounded-md z-40 pointer-events-none shadow-2xl font-mono animate-fade-in">
      {message}
    </div>
  );
}
