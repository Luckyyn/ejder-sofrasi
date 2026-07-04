import Link from 'next/link';
import { db } from '../../../../db';
import { posts } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function LoreDetailPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
    const resolvedParams = await params;

    // URL'den gelen ID'yi güvenli formata çevirir (Tarayıcı kodlamalarını temizler)
    const decodedId = decodeURIComponent(resolvedParams.id);

    // URL'deki ID'ye göre gönderiyi bul
    const postData = await db.select().from(posts).where(eq(posts.id, decodedId));
    const entry = postData[0];

    // EĞER KAYIT BULUNAMAZSA: Bize aradığı ID'yi ekranda göstersin ki hatayı bulalım!
    if (!entry) {
        return (
            <div className="text-center p-12 flex flex-col items-center min-h-[60vh] justify-center">
                <h2 className="text-3xl text-red-500 font-bold mb-4">Kayıt Bulunamadı</h2>
                <p className="text-zinc-400 mb-2">Veritabanında şu ID'yi aradık ama bulamadık:</p>
                <code className="bg-zinc-900 text-amber-500 p-4 rounded border border-zinc-700 text-lg mb-6">
                    "{decodedId}"
                </code>
                <Link href={`/lore/${resolvedParams.slug}`} className="text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
                    ← {resolvedParams.slug} kategorisine dön
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in">
            <Link href={`/lore/${resolvedParams.slug}`} className="text-zinc-500 hover:text-zinc-300 mb-10 inline-block transition-colors font-medium">
                ← {resolvedParams.slug} kategorisine dön
            </Link>

            <div className="flex flex-col md:flex-row gap-12 items-start">
                {entry.imageUrl && (
                    <div className="w-full md:w-1/3 flex-shrink-0 sticky top-24">
                        <img
                            src={entry.imageUrl}
                            alt={entry.title}
                            className="w-full rounded-2xl shadow-2xl border-2"
                            style={{ borderColor: `${entry.themeColor}50` }}
                        />
                        <div
                            className="h-1 w-full mt-6 rounded-full opacity-50"
                            style={{ backgroundColor: entry.themeColor || undefined }}
                        ></div>
                    </div>
                )}

                <div className="flex-grow">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-8" style={{ color: entry.themeColor || undefined }}>
                        {entry.title}
                    </h1>

                    <div className="text-zinc-300 text-lg leading-loose whitespace-pre-wrap font-serif">
                        {entry.content}
                    </div>
                </div>
            </div>
        </main>
    );
}
