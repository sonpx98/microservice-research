import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles locale redirect
  redirect('/en');
}

// Prevent SSG error with redirect
export const dynamic = 'force-dynamic';
