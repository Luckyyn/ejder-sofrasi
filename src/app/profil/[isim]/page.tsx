import { db } from '../../../db';
import { users, threads } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic'; // SUNUCU ÖNBELLEĞİNİ DEVRE DIŞI BIRAKIR

export default async function ProfilePage({ params }: { params: Promise<{ isim: string }> }) {
    const resolvedParams = await params;
    const userName = decodeURIComponent(resolvedParams.isim);

    // Oturum açan kişiyi alıyoruz (Profili Düzenle butonunu kime göstereceğimizi bilmek için)
    const session = await getServerSession();
    const isOwnProfile = session?.user?.name === userName;

    const userDb = await db.select().from(users).where(eq(users.name, userName));
    const profileUser = userDb[0];

    const userThreads = await db.select().from(threads).where(eq(threads.authorId, userName)).orderBy(desc(threads.createdAt));

    if (!profileUser && userThreads.length === 0) {
        return (
            <div className="p-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
                <h2 className="text-3xl text-red-500 font-bold mb-4">Maceracı Bulunamadı</h2>
                <Link href="/taverna" className="text-amber-500 hover:underline font-bold">Tavernaya Dön</Link>
            </div>
        );
    }

    const displayName = profileUser?.name || userName;
    const roleName = profileUser?.role === 'admin' ? 'Taverna Sahibi' : 'Kayıtlı Maceracı';
    const avatarChar = displayName[0]?.toUpperCase() || '?';

    // Yeni eklediğimiz verileri çekiyoruz
    const characterClass = profileUser?.characterClass || 'Sıradan Köylü';
    const bio = profileUser?.bio;
    const imageUrl = profileUser?.image;

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-4xl mx-auto">

            {/* PROFİL KARTI */}
            <div className="bg-zinc-900/80 border-2 border-zinc-800 p-8 rounded-2xl mb-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-6 z-10">
                    {/* FOTOĞRAF VEYA HARF GÖSTERİMİ */}
                    {imageUrl ? (
                        <img src={imageUrl} alt={displayName} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-950 shadow-inner" />
                    ) : (
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-4xl font-black text-amber-500 border-4 border-zinc-950 shadow-inner">
                            {avatarChar}
                        </div>
                    )}

                    <div>
                        <h1 className="text-3xl font-extrabold text-zinc-100 flex items-center gap-3">
                            {displayName}
                            <span className="bg-amber-900/40 text-amber-500 text-xs px-2 py-1 rounded-md border border-amber-700/50">
                                {roleName}
                            </span>
                        </h1>
                        <p className="text-zinc-400 font-medium mt-1 text-sm">{characterClass}</p>
                        <p className="text-zinc-500 text-xs mt-2">Toplam açılan konu: {userThreads.length}</p>
                    </div>
                </div>

                {/* KENDİ PROFİLİYSE DÜZENLE BUTONU */}
                {isOwnProfile && (
                    <Link href="/ayarlar" className="z-10 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap">
                        ⚙️ Profili Düzenle
                    </Link>
                )}
            </div>

            {/* HİKAYE (BİO) BÖLÜMÜ */}
            {bio && (
                <div className="bg-zinc-950/50 border border-zinc-800/80 p-6 rounded-xl mb-12 text-zinc-300 italic text-sm leading-relaxed relative">
                    <span className="absolute -top-3 left-4 bg-zinc-950 px-2 text-xs font-bold text-amber-700 tracking-widest uppercase">Karakter Hikayesi</span>
                    "{bio}"
                </div>
            )}

            {/* KULLANICININ KONULARI */}
            <div>
                <h2 className="text-xl font-bold text-zinc-300 mb-6 border-b border-zinc-800 pb-3">Açtığı Konular</h2>

                {userThreads.length === 0 ? (
                    <p className="text-zinc-600 italic p-6 text-center border border-zinc-800/50 rounded-xl">Bu maceracı henüz kendi efsanesini yazmaya başlamamış.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {userThreads.map(thread => (
                            <Link href={`/taverna/${thread.id}`} key={thread.id} className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 hover:border-amber-700/50 hover:bg-zinc-900/60 transition-all flex gap-4 items-center group">
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-zinc-500 group-hover:text-amber-500 transition-colors font-bold text-xl">▲</span>
                                    <span className="text-zinc-300 font-bold">{thread.upvotes || 0}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-amber-400 transition-colors mb-1">{thread.title}</h3>
                                    <p className="text-zinc-500 text-sm line-clamp-1">{thread.content}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}