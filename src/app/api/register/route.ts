import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // 1. İSİM KONTROLÜ (YENİ EKLENDİ)
        const existingNameDb = await db.select().from(users).where(eq(users.name, name));
        if (existingNameDb.length > 0) {
            return NextResponse.json({ message: 'Bu rol ismi zaten alınmış! Kendine başka bir isim bul.' }, { status: 400 });
        }

        // 2. E-POSTA KONTROLÜ
        const existingUserDb = await db.select().from(users).where(eq(users.email, email));
        if (existingUserDb.length > 0) {
            const user = existingUserDb[0];
            if (!user.password) {
                return NextResponse.json({ message: 'Bu hesap Google ile açılmış. Lütfen Giriş sayfasından Google ile girin.' }, { status: 400 });
            }
            return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanımda!' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const safeId = `user-manuel-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.insert(users).values({
            id: safeId,
            name,
            email,
            password: hashedPassword,
        });

        return NextResponse.json({ message: 'Kayıt başarılı!' }, { status: 201 });
    } catch (error: any) {
        console.error("DETAYLI KAYIT HATASI:", error);
        return NextResponse.json({ message: `Hata detayı: ${error.message}` }, { status: 500 });
    }
}