import React from "react";

/** Consistent page intro for inner pages (eyebrow, serif title, lead), with a soft entrance. */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  center = false,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  center?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className={`eyebrow animate-fade-up ${center ? "justify-center" : "eyebrow-line"}`}>{eyebrow}</p>
      <h1 className="h-display mt-3 animate-fade-up text-[2.6rem] leading-[1.05] sm:text-6xl" style={{ animationDelay: "60ms" }}>
        {title}
      </h1>
      {intro && (
        <p className="lead mt-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {intro}
        </p>
      )}
      {children && (
        <div className="mt-6 animate-fade-up" style={{ animationDelay: "180ms" }}>
          {children}
        </div>
      )}
    </header>
  );
}
