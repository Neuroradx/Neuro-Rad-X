// This layout provides a simple, centered structure for all authentication-related pages.
// It ensures that these pages do NOT display the main application's sidebar or header.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      {children}
    </div>
  );
}
