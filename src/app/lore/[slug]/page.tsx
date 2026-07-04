import Link from 'next/link';
import { db } from '../../../db';
import { categories, posts } from '../../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const categoryData = await db.select().from(categories).where(eq(categories.slug, slug));
    const currentCategory = categoryData[0];

    if (!currentCategory) return <div>Hata: Kategori bulunamadı.</div>;

    const loreEntries = await db.select()
        .from(posts)
        .where(eq(posts.categoryId, currentCategory.id))
        .orderBy(asc(posts.sortOrder));

    // 2 KATMANLI (NESTED) GRUPLAMA İŞLEMİ
    // Çıktı şu formatta olacak: { "Ana Karakter": { "Savaşçı": [...], "Büyücü": [...] } }
    const groupedEntries = loreEntries.reduce((acc, entry) => {
        const mainGroup = entry.subCategory || 'Diğer';
        const subGroup = entry.subCategory2 || 'Genel';

        if (!acc[mainGroup]) {
            acc[mainGroup] = {};
        }
        if (!acc[mainGroup][subGroup]) {
            acc[mainGroup][subGroup] = [];
        }
        acc[mainGroup][subGroup].push(entry);
        return acc;
    }, {} as Record<string, Record<string, typeof loreEntries>>);

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-7xl mx-auto">
            <div className="mb-8">
                <Link href="/lore" className="text-amber-600 hover:text-amber-500 flex items-center gap-2 text-sm font-medium transition-colors">
                    <span>← Kütüphaneye Dön</span>
                </Link>
            </div>

            <div className="mb-12 pb-2">
                <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-100 tracking-wide">
                    {currentCategory.name}
                </h1>
            </div>

            {/* 1. KATMAN: Ana Alt Kategoriler (Örn: Ana Karakterler, Yan Karakterler) */}
            {Object.entries(groupedEntries).map(([mainGroupName, subGroups]) => (
                <div key={mainGroupName} className="mb-16">
                    <h2 className="text-2xl font-bold text-zinc-400 mb-6 border-b border-zinc-800 pb-3 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        {mainGroupName}
                    </h2>

                    {/* 2. KATMAN: İkinci Alt Kategoriler (Örn: Savaşçılar, Sınıflar, Bölgeler) */}
                    {Object.entries(subGroups).map(([subGroupName, entries]) => (
                        <div key={subGroupName} className="mb-10 pl-2 md:pl-4 border-l-2 border-zinc-800/60">

                            {/* Eğer 2. kategori ismi "Genel" ise başlık basıp kalabalık yapmasın diye kontrol koyduk */}
                            {subGroupName !== 'Genel' && (
                                <h3 className="text-lg font-semibold text-zinc-500 mb-6 flex items-center gap-2 italic uppercase tracking-wider">
                                    <span className="text-amber-700/70">»</span> {subGroupName}
                                </h3>
                            )}

                            {/* O alt gruba ait 3x3 Dikey Kartlar Grid'i */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                                {entries.map((entry) => (
                                    <Link href={`/lore/${slug}/${entry.id}`} key={entry.id}>
                                        <div
                                            className="group flex flex-col items-center text-center bg-zinc-900/60 border-2 p-6 rounded-2xl transition-all cursor-pointer overflow-hidden relative h-full"
                                            style={{ borderColor: `${entry.themeColor}40` }}
                                        >
                                            <div
                                                className="absolute -inset-10 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700"
                                                style={{ backgroundColor: entry.themeColor }}
                                            ></div>

                                            {entry.imageUrl && (
                                                <div className="flex-shrink-0 z-10 mb-5">
                                                    <img
                                                        src={entry.imageUrl}
                                                        alt={entry.title}
                                                        className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 shadow-xl transition-transform duration-500 group-hover:scale-105"
                                                        style={{ borderColor: entry.themeColor }}
                                                    />
                                                </div>
                                            )}

                                            <div className="z-10 flex flex-col flex-grow items-center w-full">
                                                <h3 className="text-2xl font-bold mb-3 transition-colors" style={{ color: entry.themeColor }}>
                                                    {entry.title}
                                                </h3>
                                                <div className="text-zinc-400 text-sm line-clamp-3 leading-relaxed mb-4 w-full px-2">
                                                    {entry.content}
                                                </div>
                                                <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors pb-2">
                                                    Hikayeyi Oku <span style={{ color: entry.themeColor }}>➔</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </main>
    );
}