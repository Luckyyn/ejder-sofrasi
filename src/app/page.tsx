export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600 mb-6 tracking-tighter">
        Ejder Sofrası'na Hoş Geldin
      </h1>
      <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
        Burası kadim hikayelerin yazıldığı, zindanların derinliklerinden gelen fısıltıların paylaşıldığı yer. İster kütüphanede evrenin sırlarını keşfet, ister tavernada diğer maceracılarla kadeh tokuştur.
      </p>

      <div className="flex gap-4">
        <a href="/lore" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-zinc-700 rounded-lg transition-all font-medium">
          Kütüphaneye Gir
        </a>
        <a href="/taverna" className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded-lg transition-all font-bold">
          Tavernaya Katıl
        </a>
      </div>
    </main>
  );
}