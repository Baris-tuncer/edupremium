// Force dynamic rendering - this page requires runtime Supabase auth
export const dynamic = 'force-dynamic';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
