import ReactMarkdown from 'react-markdown';

export default function Markdown({ content }: { content: string }) {
    return (
        <ReactMarkdown
            components={{
                // Paragraflar
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-300 text-base md:text-lg">{children}</p>,

                // Kalın Yazı (**kalın**)
                strong: ({ children }) => <strong className="font-bold text-amber-500">{children}</strong>,

                // Eğik Yazı (*eğik*)
                em: ({ children }) => <em className="italic text-zinc-400">{children}</em>,

                // Başlıklar (# Başlık 1, ## Başlık 2)
                h1: ({ children }) => <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-6 mb-3 border-b border-zinc-800 pb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl md:text-2xl font-bold text-zinc-200 mt-5 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg md:text-xl font-semibold text-zinc-300 mt-4 mb-2">{children}</h3>,

                // Sırasız Listeler (- Öğe)
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 pl-2 text-zinc-300 space-y-1">{children}</ul>,

                // Sıralı Listeler (1. Öğe)
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 pl-2 text-zinc-300 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,

                // FRP Kitabı Tarzı Alıntılar (> Alıntı yazısı)
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-600 bg-zinc-950/60 px-5 py-3 italic my-5 rounded-r-xl text-zinc-400 border-opacity-80 shadow-inner">
                        {children}
                    </blockquote>
                ),

                // Satır İçi Kodlar (`kod`)
                code: ({ children }) => <code className="bg-zinc-950 px-2 py-0.5 rounded text-amber-400 font-mono text-sm border border-zinc-800/60">{children}</code>,

                // Kod Blokları (```js ... ```)
                pre: ({ children }) => <pre className="bg-zinc-950 p-4 rounded-xl overflow-x-auto my-5 border border-zinc-800 font-mono text-sm text-zinc-200 shadow-2xl">{children}</pre>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}