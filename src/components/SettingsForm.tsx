'use client';

import { useState } from 'react';

const dndClasses = [
    "Sıradan Köylü", "Barbar", "Ozan", "Ruhban", "Druid", "Savaşçı",
    "Keşiş", "Şövalye (Paladin)", "Korucu", "Düzenbaz (Rogue)",
    "Büyücü (Sorcerer)", "Warlock", "Sihirbaz (Wizard)", "Zindan Efendisi"
];

// profileUrl eklendi
export default function SettingsForm({ currentUser, profileUrl }: { currentUser: any, profileUrl: string }) {
    const [imagePreview, setImagePreview] = useState(currentUser?.image || '');
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 256;
                let { width, height } = img;

                if (width > height && width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width);
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                setImagePreview(compressedBase64);
                setIsCompressing(false);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        const payload = {
            bio: formData.get('bio') as string,
            characterClass: formData.get('characterClass') as string,
            imageBase64: imagePreview,
        };

        const res = await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // ARTIK DOĞRUDAN GELEN KESİN LİNKİ KULLANIYORUZ
            window.location.href = profileUrl;
        } else {
            const errorText = await res.text();
            console.error("GİZLİ SUNUCU HATASI:", errorText);
            alert(`Sunucu Reddetti! Lütfen VS Code terminaline bak.`);
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div>
                <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Profil Görseli (Token)</label>
                <div className="flex items-center gap-4">
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full border-2 border-amber-600 object-cover shadow-lg" />
                    )}
                    <input
                        type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-amber-900/40 file:text-amber-500 hover:file:bg-amber-900/60 cursor-pointer"
                    />
                </div>
                {isCompressing && <p className="text-amber-500 text-xs mt-2 font-bold animate-pulse">Görsel büyüyle küçültülüyor...</p>}
            </div>

            <div>
                <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Karakter Sınıfı</label>
                <select name="characterClass" defaultValue={currentUser?.characterClass || 'Sıradan Köylü'} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all appearance-none cursor-pointer">
                    {dndClasses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Karakter Hikayesi (Bio)</label>
                <textarea name="bio" rows={4} defaultValue={currentUser?.bio || ''} placeholder="Geçmişin, zaferlerin veya Tavernada neden bulunduğun..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all resize-none"></textarea>
            </div>

            <button type="submit" disabled={isCompressing || isSaving} className="mt-4 bg-amber-700 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-100 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg">
                {isSaving ? 'Mühürleniyor...' : 'Değişiklikleri Mühürle'}
            </button>
        </form>
    );
}