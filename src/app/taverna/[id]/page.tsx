import Link from 'next/link';
import { db } from '../../../db';
import { threads, threadComments, users, userVotes } from '../../../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import Markdown from '../../../components/Markdown';

export const dynamic = 'force-dynamic';

// --- GLOBAL SUNUCU AKSİYONLARI ---

async function handleVoteAction(formData: FormData) {
    'use server';
    const session = await getServerSession();
    if (!session?.user?.email) return;

    const targetId = formData.get('targetId') as string;
    const isComment = formData.get('isComment') === 'true';
    const type = formData.get('type') as string;
    const threadId = formData.get('threadId') as string;

    const userDb = await db.select().from(users).where(eq(users.email, session.user.email));
    const user = userDb[0];
    if (!user) return;

    const isUpvote = type === 'up';
    const voteValue = isUpvote ? 1 : -1;
    const targetTable = isComment ? threadComments : threads;

    const existingVoteDb = await db.select().from(userVotes).where(
        and(eq(userVotes.userId, user.id), eq(userVotes.targetId, targetId))
    );
    const existingVote = existingVoteDb[0];

    if (existingVote) {
        if (existingVote.voteType === voteValue) {
            await db.delete(userVotes).where(eq(userVotes.id, existingVote.id));
            const change = isUpvote ? -1 : 1;
            await db.update(targetTable).set({ upvotes: sql`COALESCE(${targetTable.upvotes}, 0) + ${change}` }).where(eq(targetTable.id, targetId));
        } else {
            await db.update(userVotes).set({ voteType: voteValue }).where(eq(userVotes.id, existingVote.id));
            const change = isUpvote ? 2 : -2;
            await db.update(targetTable).set({ upvotes: sql`COALESCE(${targetTable.upvotes}, 0) + ${change}` }).where(eq(targetTable.id, targetId));
        }
    } else {
        await db.insert(userVotes).values({
            id: `vote-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: user.id,
            targetId: targetId,
            voteType: voteValue,
        });
        await db.update(targetTable).set({ upvotes: sql`COALESCE(${targetTable.upvotes}, 0) + ${voteValue}` }).where(eq(targetTable.id, targetId));
    }

    revalidatePath(`/taverna/${threadId}`);
}

async function addComment(formData: FormData) {
    'use server';
    const session = await getServerSession();
    if (!session?.user?.email) return;

    const content = formData.get('content') as string;
    const parentId = formData.get('parentId') as string | null;
    const threadId = formData.get('threadId') as string;

    if (!content || !threadId) return;

    await db.insert(threadComments).values({
        id: `comment-${Date.now()}`,
        threadId: threadId,
        parentId: parentId || null,
        authorId: session.user.name || 'Gizemli Gezgin',
        content: content,
    });
    revalidatePath(`/taverna/${threadId}`);
}

// --- İÇ İÇE YORUM ÇİZİCİ BİLEŞEN ---
function CommentNode({ comment, allComments, threadId, isLoggedIn, userVotesMap }: { comment: any, allComments: any[], threadId: string, isLoggedIn: boolean, userVotesMap: Map<string, number> }) {
    const replies = allComments.filter(c => c.parentId === comment.id);
    const myVote = userVotesMap.get(comment.id) || 0;

    return (
        <div className="mt-4">
            <div className="bg-zinc-900/40 p-4 md:p-5 rounded-xl border border-zinc-800 flex gap-4 transition-colors hover:border-zinc-700">

                <form action={handleVoteAction} className="flex flex-col items-center gap-1 mt-1">
                    <input type="hidden" name="targetId" value={comment.id} />
                    <input type="hidden" name="isComment" value="true" />
                    <input type="hidden" name="threadId" value={threadId} />

                    <button type="submit" name="type" value="up" className={`transition-colors ${myVote === 1 ? 'text-amber-500' : 'text-zinc-600 hover:text-amber-500'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z" /></svg>
                    </button>

                    <span className={`text-xs font-bold ${myVote === 1 ? 'text-amber-500' : myVote === -1 ? 'text-blue-500' : 'text-zinc-400'}`}>
                        {comment.upvotes || 0}
                    </span>

                    <button type="submit" name="type" value="down" className={`transition-colors ${myVote === -1 ? 'text-blue-500' : 'text-zinc-600 hover:text-blue-500'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8h-6v-8h-4v8h-6z" /></svg>
                    </button>
                </form>

                <div className="flex-grow">
                    <p className="text-xs mb-2">
                        <Link href={`/profil/${encodeURIComponent(comment.authorId)}`} className="text-amber-700 font-bold hover:underline">
                            {comment.authorId}
                        </Link>
                    </p>
                    <div className="text-sm">
                        <Markdown content={comment.content} />
                    </div>

                    {isLoggedIn && (
                        <details className="mt-3 group">
                            <summary className="text-xs text-zinc-500 hover:text-amber-500 cursor-pointer list-none font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                ↳ Yanıtla
                            </summary>
                            <form action={addComment} className="mt-3 flex flex-col gap-3 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
                                <input type="hidden" name="parentId" value={comment.id} />
                                <input type="hidden" name="threadId" value={threadId} />
                                <textarea name="content" required rows={2} placeholder="Bu yoruma cevap ver..." className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-zinc-200 focus:outline-none focus:border-amber-600 transition-all resize-none text-sm"></textarea>
                                <button type="submit" className="self-end bg-zinc-800 hover:bg-amber-700 text-zinc-300 hover:text-zinc-100 px-4 py-2 rounded-md font-bold text-xs transition-colors uppercase tracking-widest">Gönder</button>
                            </form>
                        </details>
                    )}
                </div>
            </div>

            {replies.length > 0 && (
                <div className="ml-6 md:ml-10 border-l-2 border-zinc-800/60 pl-4">
                    {replies.map(reply => (
                        <CommentNode key={reply.id} comment={reply} allComments={allComments} threadId={threadId} isLoggedIn={isLoggedIn} userVotesMap={userVotesMap} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- ANA SAYFA (THREAD DETAY) ---
export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const threadId = resolvedParams.id;
    const session = await getServerSession();
    const isLoggedIn = !!session?.user;

    const userVotesMap = new Map<string, number>();

    if (isLoggedIn && session.user?.email) {
        const userDb = await db.select().from(users).where(eq(users.email, session.user.email));
        const currentUser = userDb[0];

        if (currentUser) {
            const votes = await db.select().from(userVotes).where(eq(userVotes.userId, currentUser.id));
            votes.forEach(v => userVotesMap.set(v.targetId, v.voteType));
        }
    }

    const threadData = await db.select().from(threads).where(eq(threads.id, threadId));
    const thread = threadData[0];

    if (!thread) {
        return (
            <div className="p-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
                <h2 className="text-3xl text-red-500 font-bold mb-4">Kayıp Sayfa</h2>
                <Link href="/taverna" className="text-amber-500 hover:underline">Tavernaya Dön</Link>
            </div>
        );
    }

    const threadVote = userVotesMap.get(thread.id) || 0;
    const allComments = await db.select().from(threadComments).where(eq(threadComments.threadId, threadId)).orderBy(desc(threadComments.createdAt));
    const rootComments = allComments.filter(c => !c.parentId);

    return (
        <main className="p-6 md:p-12 animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/taverna" className="text-amber-600 hover:text-amber-500 flex items-center gap-2 text-sm font-medium transition-colors">
                    <span>← Tavernaya Dön</span>
                </Link>
            </div>

            <div className="flex gap-4 md:gap-6 bg-zinc-900/60 border border-zinc-800 p-4 md:p-8 rounded-2xl mb-12 shadow-xl">
                <form action={handleVoteAction} className="flex flex-col items-center gap-2">
                    <input type="hidden" name="targetId" value={thread.id} />
                    <input type="hidden" name="isComment" value="false" />
                    <input type="hidden" name="threadId" value={threadId} />

                    <button type="submit" name="type" value="up" className={`transition-colors ${threadVote === 1 ? 'text-amber-500' : 'text-zinc-600 hover:text-amber-500'}`}>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z" /></svg>
                    </button>

                    <span className={`font-extrabold text-xl ${threadVote === 1 ? 'text-amber-500' : threadVote === -1 ? 'text-blue-500' : 'text-zinc-100'}`}>
                        {thread.upvotes || 0}
                    </span>

                    <button type="submit" name="type" value="down" className={`transition-colors ${threadVote === -1 ? 'text-blue-500' : 'text-zinc-600 hover:text-blue-500'}`}>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8h-6v-8h-4v8h-6z" /></svg>
                    </button>
                </form>

                <div className="flex-grow pt-1">
                    <p className="text-xs text-zinc-500 mb-3 flex items-center gap-2">
                        Gönderen:
                        <Link href={`/profil/${encodeURIComponent(thread.authorId || 'Gizemli Gezgin')}`} className="text-amber-700 font-bold bg-amber-900/20 px-2 py-1 rounded hover:bg-amber-900/40 transition-colors">
                            {thread.authorId || 'Gizemli Gezgin'}
                        </Link>
                    </p>
                    <h1 className="text-2xl md:text-4xl font-bold text-zinc-100 mb-4">{thread.title}</h1>
                    <div className="animate-fade-in">
                        <Markdown content={thread.content} />
                    </div>
                </div>
            </div>

            {/* YENİ MİNİMALİST YORUM ALANI */}
            {
                isLoggedIn ? (
                    <details className="mb-12 group">
                        <summary className="bg-zinc-900/40 border border-zinc-800 hover:border-amber-700/50 p-4 rounded-xl cursor-pointer flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-all list-none">
                            <span className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-amber-500">
                                {session.user?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                            <span>Bir maceradan bahsetmek ister misin? (Yanıtla)</span>
                        </summary>

                        <div className="mt-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-top-2">
                            <form action={addComment} className="flex flex-col gap-4">
                                <input type="hidden" name="threadId" value={threadId} />
                                <textarea
                                    name="content" required rows={3}
                                    placeholder="Düşüncelerini buraya yaz..."
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-zinc-100 focus:outline-none focus:border-amber-600 transition-all resize-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    className="self-end bg-amber-700 hover:bg-amber-600 text-zinc-100 px-6 py-2 rounded-lg font-bold transition-colors text-sm"
                                >
                                    Yorumu Gönder
                                </button>
                            </form>
                        </div>
                    </details>
                ) : (
                    <div className="mb-12 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 text-center">
                        <p className="text-zinc-400 mb-4">Maceraya katılıp fikrini belirtmek için masaya oturmalısın.</p>
                        <Link href="/giris" className="inline-block bg-amber-700 hover:bg-amber-600 text-zinc-100 px-6 py-2 rounded-lg font-bold transition-colors">Giriş Yap</Link>
                    </div>
                )
            }

            <div className="flex flex-col">
                <h3 className="text-xl font-bold text-zinc-400 mb-4 border-b border-zinc-800 pb-3 flex items-center gap-2">
                    Tartışma <span className="bg-zinc-800 text-zinc-300 text-sm px-2 py-1 rounded-full">{allComments.length}</span>
                </h3>

                {rootComments.length === 0 ? (
                    <p className="text-zinc-600 italic p-6 text-center border border-zinc-800/50 rounded-xl mt-4">Henüz yorum yapılmamış. İlk tartışmayı sen başlat!</p>
                ) : (
                    rootComments.map((comment) => (
                        <CommentNode key={comment.id} comment={comment} allComments={allComments} threadId={threadId} isLoggedIn={isLoggedIn} userVotesMap={userVotesMap} />
                    ))
                )}
            </div>
        </main >
    );
}