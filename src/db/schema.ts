import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';

// --- SADELEŞTİRİLMİŞ KULLANICI TABLOSU ---
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').unique().notNull(),
    image: text('image'), // Zaten vardı, artık kullanacağız
    password: text('password'),
    role: text('role').default('user'),

    // YENİ EKLENENLER
    bio: text('bio'),
    characterClass: text('character_class').default('Sıradan Köylü'),

    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Varsa "accounts" tablosu kodunu tamamen SİL.

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
}));

export const categories = sqliteTable('categories', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    posts: many(posts),
}));

export const posts = sqliteTable('posts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    themeColor: text('theme_color').default('#f59e0b'), // Karakterin özel renk kodu
    subCategory: text('sub_category').default('Ana Karakterler'), // Sınıflandırma için yeni sütun
    subCategory2: text('sub_category2').default('Genel'), // 2. Seviye sınıflandırma
    sortOrder: integer('sort_order').default(99), // Sıralama numarası (Varsayılan 99 ki yeni eklenenler hep en sona gitsin)
    authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').notNull().references(() => categories.id),
    upvotes: integer('upvotes').default(0),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    category: one(categories, {
        fields: [posts.categoryId],
        references: [categories.id],
    }),
    comments: many(comments),
}));

export const comments = sqliteTable('comments', {
    id: text('id').primaryKey(),
    content: text('content').notNull(),
    authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const commentsRelations = relations(comments, ({ one }) => ({
    author: one(users, {
        fields: [comments.authorId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
}));

// --- TAVERNA (FORUM) TABLOLARI ---

export const threads = sqliteTable('threads', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    authorId: text('author_id').notNull(),

    // YENİ EKLENEN KATEGORİ SÜTUNU
    category: text('category').default('Genel Sohbet'),

    upvotes: integer('upvotes').default(0),
    downvotes: integer('downvotes').default(0),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const threadComments = sqliteTable('thread_comments', {
    id: text('id').primaryKey(),
    threadId: text('thread_id').notNull(),
    parentId: text('parent_id'), // YENİ: Bu yorum başka bir yoruma mı yanıt olarak yazıldı? (Bağlantı noktası)
    authorId: text('author_id').notNull(),
    content: text('content').notNull(),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    upvotes: integer('upvotes').default(0),
});

// --- KİMLİK DOĞRULAMA (AUTH.JS) TABLOLARI ---

export const accounts = sqliteTable('accounts', {
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
}, (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

// --- OYLAMA TAKİP (ANTİ-SPAM) TABLOSU ---
// Bu tablo sayesinde bir kişi bir yoruma 2. kez oy atmaya çalıştığında sistem onu engelleyecek.

// --- OYLAMA HAFIZASI (ANTI-SPAM) ---
export const userVotes = sqliteTable('user_votes', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    targetId: text('target_id').notNull(), // Oy verilen Konu veya Yorumun ID'si
    voteType: integer('vote_type').notNull(), // 1 (Upvote) veya -1 (Downvote)
});
