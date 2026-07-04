import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../../../../db";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/giris',
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),

        CredentialsProvider({
            name: "Giriş Yap",
            credentials: {
                email: { label: "E-posta", type: "email" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Lütfen tüm alanları doldurun.");
                }
                const userDb = await db.select().from(users).where(eq(users.email, credentials.email));
                const user = userDb[0];

                // 1. Durum: E-posta veritabanında hiç yoksa
                if (!user) {
                    throw new Error("Bu e-posta adresiyle kayıtlı bir maceracı bulunamadı.");
                }

                // 2. Durum: E-posta var ama şifresi yoksa (Yani Google ile girmişse)
                if (!user.password) {
                    throw new Error("Bu e-posta Google ile kayıtlı! Lütfen aşağıdaki 'Google ile Devam Et' butonunu kullan.");
                }
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Hatalı şifre.");
                }
                return { id: user.id, name: user.name, email: user.email };
            }
        })
    ],
    callbacks: {
        // SİHİRLİ KISIM: Google'dan başarılı giriş gelince araya giriyoruz
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // Bu Google maili bizde var mı?
                    const existingUser = await db.select().from(users).where(eq(users.email, user.email as string));

                    // Yoksa bizim kurallarımızla veritabanına biz ekliyoruz!
                    if (existingUser.length === 0) {
                        await db.insert(users).values({
                            id: `user-google-${Date.now()}`, // Benzersiz ve çökme yaratmayan güvenli ID
                            name: user.name || "Gizemli Gezgin",
                            email: user.email as string,
                            image: user.image || "",
                        });
                    }
                    return true; // İçeri al
                } catch (error) {
                    console.error("Google Kayıt Engeli:", error);
                    return false; // Hata varsa kapıda beklet
                }
            }
            return true; // Normal e-posta girişiyse zaten authorize'dan geçti, içeri al
        }
    }
});

export { handler as GET, handler as POST };