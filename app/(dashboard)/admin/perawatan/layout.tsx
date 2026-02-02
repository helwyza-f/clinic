import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Perawatan | Admin Dashboard",
  description: "Manajemen daftar harga dan kategori perawatan klinik.",
};

export default function PerawatanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Container utama dengan padding standar admin */}
      <div className="max-w-[1400px] mx-auto p-6 md:p-10">{children}</div>
    </div>
  );
}
