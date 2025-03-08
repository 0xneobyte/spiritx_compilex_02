"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="light"
      closeButton
      richColors
      toastOptions={{
        duration: 3000,
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          borderRadius: "0.5rem",
        },
      }}
    />
  );
}
