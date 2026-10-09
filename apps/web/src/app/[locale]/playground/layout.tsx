// Every playground page renders in the terminal theme; the site header above stays blueprint.
export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="terminal" className="min-h-full bg-background text-foreground">
      {children}
    </div>
  );
}
