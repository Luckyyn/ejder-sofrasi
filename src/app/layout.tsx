import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth"; // Oturum bilgisini çekmek için ekledik
import LogoutButton from "../components/LogoutButton"; // Dosya yoluna göre nokta sayısını ayarlayabilirsin

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ejder Sofrası",
  description: "D&D 5e Maceraları ve Kadim Kütüphane",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Arka planda giriş yapmış kullanıcının oturumunu kontrol ediyoruz
  const session = await getServerSession();

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`}>

        {/* ÜST MENÜ (NAVBAR) */}
        <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

            {/* Logo / Ana Sayfa Linki */}
            <Link href="/" className="text-xl font-black tracking-wider text-amber-500 hover:text-amber-400 transition-colors uppercase">
              Ejder Sofrası
            </Link>

            {/* Orta Menü Linkleri */}
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
              <Link href="/lore" className="hover:text-zinc-100 transition-colors">
                Kütüphane (Lore)
              </Link>
              <Link href="/taverna" className="hover:text-zinc-100 transition-colors">
                Taverna (Forum)
              </Link>
            </nav>

            {/* Sağ Taraf: Giriş Durumu (Dinamik Alan) */}
            <div className="text-sm font-medium">
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-zinc-400">
                    Selam,
                    <Link href={`/profil/${encodeURIComponent(session.user?.name || '')}`} className="text-amber-500 font-bold ml-1 hover:underline hover:text-amber-400 transition-all">
                      {session.user?.name}
                    </Link>
                  </span>
                  <LogoutButton />
                </div>
              ) : (
                <Link
                  href="/giris"
                  className="text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg hover:border-amber-600 transition-all"
                >
                  Giriş Yap
                </Link>
              )}
            </div>

          </div>
        </header>

        {/* SAYFA İÇERİKLERİ */}
        <div className="flex-grow">
          {children}
        </div>

      </body>
    </html>
  );
}