import { db } from '../../db';
import { threads } from '../../db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import TavernaList from '../../components/TavernaList';

export const dynamic = 'force-dynamic';

export default async function TavernaPage() {
    // Tüm konuları veritabanından en yeniye göre çekiyoruz
    const allThreads = await db.select().from(threads).orderBy(desc(threads.createdAt));

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-5xl mx-auto">

            {/* Üst Kısım: Başlık ve Yeni Konu Butonu */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-amber-500 mb-2 tracking-tight">Taverna (Topluluk Forumu)</h1>
                    <p className="text-zinc-400 text-lg max-w-2xl">
                        Ejder Sofrası bölümleri, gelecek teorileri, karakter analizleri ve D&D muhabbetlerinin döndüğü o meşhur masa.
                    </p>
                </div>

                <Link href="/taverna/yeni" className="bg-amber-700 hover:bg-amber-600 text-zinc-100 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 whitespace-nowrap text-center">
                    + Yeni Konu Aç
                </Link>
            </div>

            {/* Arama, Filtreleme ve Dinamik Listeleme Bileşeni */}
            <TavernaList initialThreads={allThreads} />

        </main>
    );
}