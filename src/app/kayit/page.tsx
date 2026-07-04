'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message);
        } else {
            setSuccess('Kayıt başarılı! Tavernaya yönlendiriliyorsun...');
            setTimeout(() => {
                window.location.href = '/giris';
            }, 2000);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-md bg-zinc-900/80 border-2 border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">

                {/* Dekoratif Işık */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl"></div>

                <h1 className="text-3xl font-extrabold text-amber-500 mb-2 relative z-10">Maceraya Katıl</h1>
                <p className="text-zinc-400 mb-8 pb-4 border-b border-zinc-800 relative z-10">
                    Ejder Sofrası'nda kendi efsaneni yazmaya başla.
                </p>

                {/* Hata ve Başarı Mesajları */}
                {error && <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                {success && <div className="bg-green-900/30 border border-green-500/50 text-green-200 p-3 rounded-lg mb-6 text-sm">{success}</div>}

                <form onSubmit={handleRegister} className="flex flex-col gap-5 relative z-10">
                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Kullanıcı Adı (Rol İsmin)</label>
                        <input
                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">E-posta</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Şifre</label>
                        <input
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                        />
                    </div>

                    <button type="submit" className="mt-2 bg-amber-700 hover:bg-amber-600 text-zinc-100 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg">
                        Kayıt Ol
                    </button>
                </form>

                <p className="mt-8 text-center text-zinc-500 text-sm relative z-10">
                    Zaten masada yerin var mı? <Link href="/giris" className="text-amber-500 hover:underline font-bold">Giriş Yap</Link>
                </p>
            </div>
        </main>
    );
}