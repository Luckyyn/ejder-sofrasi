'use client';

import { useState } from 'react';
import Link from 'next/link';

// Kategori Listemiz (En başa 'Tüm Konular' ekledik)
const categories = [
    "Tüm Konular",
    "Genel Sohbet",
    "Bölüm analizi",
    "Teori",
    "Karakter & Sınıf Analizi",
    "Evren İnşası",
    "D&D 5e ve Kurallar",
    "Hikaye & Macera Paylaşımı"
];

export default function TavernaList({ initialThreads }: { initialThreads: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tüm Konular');

    // Filtreleme Büyüsü (Arama kutusu ve kategori butonlarına göre anında eler)
    const filteredThreads = initialThreads.filter((thread) => {
        const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            thread.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tüm Konular' || thread.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="animate-fade-in">

            {/* ARAMA VE KATEGORİ ÇUBUĞU */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl mb-8 shadow-lg flex flex-col md:flex-row gap-4 items-center">

                {/* Arama Kutusu */}
                <div className="w-full md:w-1/3 relative">
                    <span className="absolute left-3 top-3 text-zinc-500">🔍</span>
                    <input
                        type="text"
                        placeholder="Efsanelerde ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all"
                    />
                </div>

                {/* Kategori Butonları (Yatay Kaydırılabilir) */}
                <div className="w-full md:w-2/3 overflow-x-auto pb-2 md:pb-0 flex gap-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedCategory === cat
                                ? 'bg-amber-700 text-white border-amber-600 shadow-md'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-amber-700/50 hover:text-zinc-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* LİSTELEME ALANI */}
            <div className="flex flex-col gap-4">
                {filteredThreads.length === 0 ? (
                    <div className="text-center p-12 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 italic text-lg">Bu diyarlarda aradığın kriterlere uygun bir efsane bulunamadı...</p>
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <Link href={`/taverna/${thread.id}`} key={thread.id} className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 hover:border-amber-700/50 hover:bg-zinc-900/60 transition-all flex gap-4 items-center group relative overflow-hidden">
                            <div className="flex flex-col items-center min-w-[3rem] z-10">
                                <span className="text-zinc-500 group-hover:text-amber-500 transition-colors font-bold text-xl">▲</span>
                                <span className="text-zinc-300 font-bold">{thread.upvotes || 0}</span>
                            </div>

                            <div className="flex-grow z-10">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">{thread.title}</h3>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-900/30 text-amber-500 border border-amber-700/30 rounded-md">
                                        {thread.category || 'Genel Sohbet'}
                                    </span>
                                </div>
                                {/* Markdown içeriğinin ham halini önizleme olarak gösteriyoruz */}
                                <p className="text-zinc-500 text-sm line-clamp-1">{thread.content.replace(/[*#>`]/g, '')}</p>
                            </div>

                            <div className="z-10 text-right min-w-[6rem] hidden md:block">
                                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider mb-1">Yazar</p>
                                <p className="text-sm font-bold text-amber-700/80 group-hover:text-amber-600">{thread.authorId}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}