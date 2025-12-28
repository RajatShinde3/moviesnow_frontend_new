import AuthGate from '@/components/AuthGate';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate
      requireRoles={['admin', 'staff', 'moderator']}
      requireVerifiedEmail={true}
      loginPath="/forbidden"
      minLoadingMs={250}
    >
      {children}
    </AuthGate>
  );
}
