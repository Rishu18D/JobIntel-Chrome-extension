import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobIntel — your job search, in focus',
  description: 'Understand job fit, spot skill gaps, and save roles while you browse.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-zinc-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}