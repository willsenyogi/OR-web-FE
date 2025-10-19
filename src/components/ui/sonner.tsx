"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          description: "toast-description",
        },
      }}
      style={
        {
          backgroundColor: "var(--popover)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
