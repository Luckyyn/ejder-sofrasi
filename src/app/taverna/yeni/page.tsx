import { db } from '../../../db';
import { threads } from '../../../db/schema';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

// Taverna Kategorilerimiz
const categories = [
    "Genel Sohbet",
    "Bölüm analizi",
    "Teori",
    "Karakter & Sınıf Analizi",
    "Evren İnşası",
    "D&D 5e ve Kurallar",
    "Hikaye & Macera Paylaşımı"
];

export default async function NewThreadPage() {
    const session = await getServerSession();

    if (!session?.user?.name) {
        redirect('/giris'); // Giriş yapmayan konu açamaz
    }

    async function createThread(formData: FormData) {
        'use server';
        const session = await getServerSession();
        if (!session?.user?.name) return;

        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const category = formData.get('category') as string; // Kategoriyi formdan al

        if (!title || !content) return;

        const safeId = `thread-${Date.now()}`;

        // Veritabanına kategoriyi de ekleyerek kaydediyoruz
        await db.insert(threads).values({
            id: safeId,
            title,
            content,
            category: category || 'Genel Sohbet',
            authorId: session.user.name,
        });

        revalidatePath('/taverna');
        redirect('/taverna');
    }

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-3xl mx-auto">
            <Link href="/taverna" className="text-amber-600 hover:text-amber-500 mb-8 inline-block font-bold">
                ← Tavernaya Dön
            </Link>

            <div className="bg-zinc-900/80 border-2 border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <h1 className="text-3xl font-extrabold text-amber-500 mb-2 relative z-10">Yeni Konu Aç</h1>
                <p className="text-zinc-400 mb-8 pb-4 border-b border-zinc-800 relative z-10">
                    Ejder Sofrası hakkında bir teori paylaş, bölüm tartışması başlat veya zarların kaderi hakkında fikrini söyle.
                </p>

                <form action={createThread} className="flex flex-col gap-6 relative z-10">

                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Konu Başlığı</label>
                        <input type="text" name="title" required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all" />
                    </div>

                    {/* YENİ EKLENEN KATEGORİ SEÇİCİ */}
                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Kategori</label>
                        <select name="category" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all appearance-none cursor-pointer">
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">İçerik / Düşüncelerin (Markdown Destekli)</label>
                        <textarea name="content" required rows={8} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all resize-none"></textarea>
                        <p className="text-xs text-zinc-500 mt-2">İpucu: Yazılarını **kalın** veya *eğik* yapmak için Markdown kullanabilirsin.</p>
                    </div>

                    <button type="submit" className="mt-4 bg-amber-700 hover:bg-amber-600 text-zinc-100 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg">
                        Konuyu Aç
                    </button>
                </form>
            </div>
        </main>
    );
}