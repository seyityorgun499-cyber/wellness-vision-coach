/**
 * Myora – Community API (Topluluk)
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { CommunityPost, CommunityComment, PostCreateData, CommentCreateData } from './types';

function toCamelCommunityPost(row: any): CommunityPost {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? null,
    content: row.content,
    category: row.category ?? null,
    imageUrl: row.image_url ?? null,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    isPublished: row.is_published ?? true,
    isPinned: row.is_pinned ?? false,
    author: row.profiles ? { displayName: row.profiles.display_name || 'Anonim', avatarUrl: row.profiles.avatar_url || undefined } : undefined,
    isLiked: row.isLiked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as CommunityPost;
}

function toCamelCommunityComment(row: any): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id ?? null,
    content: row.content,
    likeCount: row.like_count ?? 0,
    author: row.profiles ? { displayName: row.profiles.display_name || 'Anonim', avatarUrl: row.profiles.avatar_url || undefined } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as CommunityComment;
}

export const communityAPI = {
  /** Gönderileri listele */
  getPosts: async (category?: string, page?: number, limit?: number) => {
    const currentUserId = await getCurrentSupabaseUserId().catch(() => null);
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('community_posts')
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category) query = query.eq('category', category);
    const { data, error, count } = await query;
    if (error) throw error;

    let likedPostIds = new Set<string>();
    if (currentUserId && data?.length) {
      const { data: likes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', data.map((post) => post.id));
      likedPostIds = new Set((likes ?? []).map((like: any) => like.post_id));
    }

    const posts = (data ?? []).map((post: any) => toCamelCommunityPost({ ...post, isLiked: likedPostIds.has(post.id) }));
    return { posts, total: count || 0, page: currentPage };
  },

  /** Gönderi detayı */
  getPost: async (id: string): Promise<CommunityPost & { comments: CommunityComment[]; liked: boolean }> => {
    const currentUserId = await getCurrentSupabaseUserId().catch(() => null);
    const { data: post, error } = await supabase
      .from('community_posts')
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;

    const comments = await communityAPI.getComments(id);
    let liked = false;
    if (currentUserId) {
      const { data: likeRow } = await supabase.from('community_likes').select('id').eq('user_id', currentUserId).eq('post_id', id).maybeSingle();
      liked = !!likeRow;
    }
    return { ...toCamelCommunityPost({ ...post, isLiked: liked }), comments, liked };
  },

  /** Yeni gönderi oluştur */
  createPost: async (data: PostCreateData): Promise<CommunityPost> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('community_posts')
      .insert({ user_id: userId, title: data.title ?? null, content: data.content, category: data.category ?? null, image_url: data.imageUrl ?? null })
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)')
      .single();
    if (error) throw error;
    return toCamelCommunityPost(inserted);
  },

  /** Gönderiyi sil */
  deletePost: async (id: string) => {
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    if (error) throw error;
  },

  /** Beğeni değiştir (toggle) */
  toggleLike: async (postId: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: existing } = await supabase.from('community_likes').select('id').eq('user_id', userId).eq('post_id', postId).maybeSingle();

    let liked = false;
    if (existing) {
      const { error } = await supabase.from('community_likes').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('community_likes').insert({ user_id: userId, post_id: postId });
      if (error) throw error;
      liked = true;
    }

    const { count } = await supabase.from('community_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    await supabase.from('community_posts').update({ like_count: count || 0 }).eq('id', postId);
    return { liked, likeCount: count || 0 };
  },

  /** Gönderinin yorumlarını getir */
  getComments: async (postId: string): Promise<CommunityComment[]> => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, profiles!community_comments_user_id_fkey(display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelCommunityComment);
  },

  /** Yorum ekle */
  addComment: async (postId: string, content: string, parentId?: string): Promise<CommunityComment> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('community_comments')
      .insert({ post_id: postId, user_id: userId, parent_id: parentId ?? null, content })
      .select('*, profiles!community_comments_user_id_fkey(display_name, avatar_url)')
      .single();
    if (error) throw error;

    const { count } = await supabase.from('community_comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    await supabase.from('community_posts').update({ comment_count: count || 0 }).eq('id', postId);
    return toCamelCommunityComment(inserted);
  },
};
