import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keystatic Admin - Blog CMS",
  description: "Content management system for blog",
};

export default function KeystaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
