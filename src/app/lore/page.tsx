import Link from 'next/link';

export default function LorePage() {
    // Ejder Sofrası Evren Kategorileri
    const categories = [
        {
            title: 'Karakterler',
            desc: 'Kahramanlar, ihanet edenler ve bu acımasız dünyanın gölgelerinde saklanan figürler.',
            icon: '🧝‍♂️',
            slug: 'karakterler'
        },
        {
            title: 'Ejderhalar Panteonu',
            desc: 'Gökyüzünün mutlak hakimleri, kadim pullu bilgeler ve dünyanın kaderini çizen kudretli varlıklar.',
            icon: '🐉',
            slug: 'ejderhalar-panteonu'
        },
        {
            title: 'Tanrılar ve İnançlar',
            desc: 'Kanamış topraklarda edilen dualar, unutulmuş ilahlar ve fanilerin fanatik tapınışları.',
            icon: '👁️',
            slug: 'tanrilar-ve-inanclar'
        },
        {
            title: 'Ülkeler ve Şehirler',
            desc: 'Yıkılmış imparatorlukların külleri üzerine kurulan krallıklar ve surlarla çevrili son güvenli limanlar.',
            icon: '🗺️',
            slug: 'ulkeler-ve-sehirler'
        },
        {
            title: 'Fraksiyonlar',
            desc: 'Siyasi entrikalar peşindeki soylu aileler, karanlık tarikatlar ve gücü kanla elinde tutan loncalar.',
            icon: '⚔️',
            slug: 'fraksiyonlar'
        },
    ];

    return (
        <main className="p-6 md:p-12 animate-fade-in">
            {/* Başlık Alanı */}
            <div className="mb-12 border-b border-zinc-800 pb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-500 mb-4 tracking-wide">
                    Kadim Kütüphane
                </h1>
                <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
                    Dünyanın acımasız gerçekleri ve karanlık sırları bu sayfalarda mühürlendi. Sadece gerçeği görmeye cesareti olanlar bu arşivin derinliklerine inebilir. Ne arıyorsun, yolcu?
                </p>
            </div>

            {/* Arama Çubuğu */}
            <div className="mb-10">
                <input
                    type="text"
                    placeholder="Efsanelerde, isimlerde veya mekanlarda ara..."
                    className="w-full md:w-1/2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all shadow-inner"
                />
            </div>

            {/* Kategori Izgarası (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <Link href={`/lore/${cat.slug}`} key={cat.slug}>
                        <div className="group relative bg-zinc-900/40 border border-zinc-800 p-8 rounded-xl hover:border-amber-700 hover:bg-zinc-900/80 transition-all cursor-pointer h-full overflow-hidden flex flex-col">
                            {/* Arka plan vurgu efekti */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">
                                    {cat.icon}
                                </span>
                                <h2 className="text-xl font-bold text-zinc-100 group-hover:text-amber-500 transition-colors">
                                    {cat.title}
                                </h2>
                            </div>
                            <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors leading-relaxed flex-grow">
                                {cat.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}