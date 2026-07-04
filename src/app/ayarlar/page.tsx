import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SettingsForm from '../../components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await getServerSession();

    if (!session?.user?.email) redirect('/giris');

    const userDb = await db.select().from(users).where(eq(users.email, session.user.email));
    const currentUser = userDb[0];

    // SAĞ ÜST KÖŞEDEKİ KESİN DOĞRU İSMİ ALIP LİNKİ HAZIRLIYORUZ
    const safeName = encodeURIComponent(session.user.name || '');
    const profileUrl = `/profil/${safeName}`;

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href={profileUrl} className="text-amber-600 hover:text-amber-500 flex items-center gap-2 text-sm font-medium transition-colors">
                    <span>← Profile Dön</span>
                </Link>
            </div>

            <div className="bg-zinc-900/80 border-2 border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl"></div>

                <h1 className="text-3xl font-extrabold text-amber-500 mb-2 relative z-10">Maceracı Kayıtları</h1>
                <p className="text-zinc-400 mb-8 pb-4 border-b border-zinc-800 relative z-10">
                    Ejder Sofrası'ndaki kimliğini ve hikayeni şekillendir.
                </p>

                {/* HAZIRLADIĞIMIZ LİNKİ FORMA GÖNDERİYORUZ */}
                <SettingsForm currentUser={currentUser} profileUrl={profileUrl} />
            </div>
        </main>
    );
}