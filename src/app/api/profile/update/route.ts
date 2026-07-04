import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Yetkisiz Erişim!' }, { status: 401 });
        }

        const body = await request.json();
        const { bio, characterClass, imageBase64 } = body;

        // 1. Veritabanında bu maceracı var mı kontrol ediyoruz
        const userDb = await db.select().from(users).where(eq(users.email, session.user.email));
        const existingUser = userDb[0];

        if (existingUser) {
            // KARAKTER ZATEN VARSA (Örn: Ash gibi manuel kayıtlıysa) SADECE GÜNCELLE
            await db.update(users).set({
                image: imageBase64 || existingUser.image || null,
                bio: bio || null,
                characterClass: characterClass || 'Sıradan Köylü'
            }).where(eq(users.email, session.user.email));
        } else {
            // KARAKTER YOKSA (Google ile gelmiş bir Hayalet hesapsa) SIFIRDAN OLUŞTUR VE EKLE
            const safeId = `user-google-${Date.now()}`;
            await db.insert(users).values({
                id: safeId,
                name: session.user.name || 'İsimsiz Kahraman',
                email: session.user.email,
                image: imageBase64 || session.user.image || null, // Varsa Google resmini de yedek al
                bio: bio || null,
                characterClass: characterClass || 'Sıradan Köylü',
                role: 'user', // Varsayılan yetki
            });
        }

        // Sunucu Hafızasını Zorla Temizliyoruz
        if (session.user.name) {
            revalidatePath(`/profil/${encodeURIComponent(session.user.name)}`);
            revalidatePath('/taverna');
        }

        return NextResponse.json({ message: 'Başarıyla mühürlendi!' }, { status: 200 });
    } catch (error: any) {
        console.error("Profil Güncelleme Hatası:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}