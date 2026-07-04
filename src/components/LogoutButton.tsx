'use client'; // Tıklama işlemi tarayıcıda çalışacağı için bu şart

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-red-200 px-3 py-1.5 rounded-md font-bold transition-all"
        >
            Masadan Kalk
        </button>
    );
}