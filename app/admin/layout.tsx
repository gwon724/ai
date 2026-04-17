export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#0F172A", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
