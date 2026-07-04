'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Auth.js'in e-posta/şifre kontrolünü tetikliyoruz
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            // Başarılıysa doğrudan Tavernaya geçiş!
            window.location.href = '/taverna';
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-md bg-zinc-900/80 border-2 border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">

                {/* Dekoratif Işık Efekti */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl"></div>

                <h1 className="text-3xl font-extrabold text-amber-500 mb-2 relative z-10">Tavernaya Gir</h1>
                <p className="text-zinc-400 mb-8 pb-4 border-b border-zinc-800 relative z-10">
                    Ejder Sofrası'ndaki masana geçmek için kimliğini doğrula.
                </p>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm relative z-10">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">E-posta</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Şifre</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 bg-amber-700 hover:bg-amber-600 text-zinc-100 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                    >
                        Kapıyı Çal
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between relative z-10">
                    <span className="h-px bg-zinc-800 flex-grow"></span>
                    <span className="text-zinc-500 text-sm px-4 uppercase tracking-widest font-bold">VEYA</span>
                    <span className="h-px bg-zinc-800 flex-grow"></span>
                </div>

                {/* Google Butonu */}
                <button
                    onClick={() => signIn('google', { callbackUrl: '/taverna' })}
                    className="mt-6 w-full bg-zinc-100 hover:bg-white text-zinc-900 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 relative z-10"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
                    Google ile Devam Et
                </button>

                <p className="mt-8 text-center text-zinc-500 text-sm relative z-10">
                    Henüz maceraya katılmadın mı? <Link href="/kayit" className="text-amber-500 hover:underline font-bold">Kayıt Ol</Link>
                </p>
            </div>
        </main>
    );
}