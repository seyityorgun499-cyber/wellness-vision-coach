/**
 * Myora – Topluluk Sayfasi (Community)
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { communityAPI } from "@/lib/api";
import { toast } from "sonner";
import { communityPostSchema, type CommunityPostData } from "@/lib/validations/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Plus,
  Send,
  Users,
  TrendingUp,
  UtensilsCrossed,
  HelpCircle,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/contexts/LanguageContext";

interface CommunityProps {
  onBack?: () => void;
}

const REACTIONS = ['❤️', '🔥', '💪', '👏'] as const;
type ReactionEmoji = typeof REACTIONS[number];

function getStoredReaction(postId: string): ReactionEmoji | null {
  try {
    return localStorage.getItem(`reaction:${postId}`) as ReactionEmoji | null;
  } catch { return null; }
}
function setStoredReaction(postId: string, emoji: ReactionEmoji | null) {
  try {
    if (emoji) localStorage.setItem(`reaction:${postId}`, emoji);
    else localStorage.removeItem(`reaction:${postId}`);
  } catch { /* ignore */ }
}

export function Community({ onBack: onBackProp }: CommunityProps) {
  const [myReactions, setMyReactions] = useState<Record<string, ReactionEmoji | null>>({});
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const onBack = onBackProp ?? (() => navigate('/'));
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [showNewPost, setShowNewPost] = useState(false);
  const queryClient = useQueryClient();

  const CATEGORIES = [
    { value: "general", label: t.catGeneral, icon: Users },
    { value: "nutrition", label: t.catNutrition, icon: UtensilsCrossed },
    { value: "exercise", label: t.catExercise, icon: TrendingUp },
    { value: "question", label: t.catQuestions, icon: HelpCircle },
    { value: "success_story", label: t.catSuccessStories, icon: Trophy },
  ];

  const postForm = useForm<CommunityPostData>({
    resolver: zodResolver(communityPostSchema),
    defaultValues: { title: "", content: "", category: "general" },
  });

  const { data: postsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["community-posts", selectedCategory],
    queryFn: () => communityAPI.getPosts(selectedCategory) as Promise<any>,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: CommunityPostData) => communityAPI.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setShowNewPost(false);
      postForm.reset();
      toast.success(t.postCreated);
    },
    onError: (err: Error) => {
      toast.error(err.message || t.postCreateFailed);
    },
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => communityAPI.toggleLike(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["community-posts", selectedCategory] });
      const previous = queryClient.getQueryData<any[]>(["community-posts", selectedCategory]);
      queryClient.setQueryData<any[]>(["community-posts", selectedCategory], (old = []) =>
        old.map(p =>
          p.id === postId
            ? { ...p, likeCount: (p.likeCount || 0) + (p.isLiked ? -1 : 1), isLiked: !p.isLiked }
            : p
        )
      );
      return { previous };
    },
    onError: (err: Error, _postId, context: any) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["community-posts", selectedCategory], context.previous);
      }
      toast.error(err.message || t.likeFailed);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const handleReaction = useCallback((postId: string, emoji: ReactionEmoji, isLiked: boolean) => {
    const current = myReactions[postId] ?? getStoredReaction(postId);
    const isSameEmoji = current === emoji;
    const nextEmoji = isSameEmoji ? null : emoji;
    setMyReactions(prev => ({ ...prev, [postId]: nextEmoji }));
    setStoredReaction(postId, nextEmoji);
    if (nextEmoji && !isLiked) likeMutation.mutate(postId);
    else if (!nextEmoji && isLiked) likeMutation.mutate(postId);
  }, [myReactions, likeMutation]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">{t.communityTitle}</h1>
              <p className="text-xs text-muted-foreground">{t.communitySubtitle}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowNewPost(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t.share}
          </Button>
        </div>
      </div>

      {/* Kategori Filtreleri */}
      <div className="px-4 py-3">
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="whitespace-nowrap"
              >
                <cat.icon className="h-3 w-3 mr-1" />
                {cat.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Yeni Paylasim Formu */}
      {showNewPost && (
        <div className="px-4 pb-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t.newPost}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={postForm.handleSubmit((data) => createPostMutation.mutate({ ...data, category: selectedCategory }))} className="space-y-3">
                {/* Category picker */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t.postCategory ?? 'Category'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          selectedCategory === cat.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <cat.icon className="h-3 w-3" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input placeholder={t.titlePlaceholder} {...postForm.register('title')} />
                <div>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t.shareThoughts}
                    {...postForm.register('content')}
                  />
                  {postForm.formState.errors.content && (
                    <p className="text-xs text-destructive mt-1">{postForm.formState.errors.content.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" type="submit" disabled={createPostMutation.isPending}>
                    <Send className="h-3 w-3 mr-1" /> {createPostMutation.isPending ? t.sharing : t.share}
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => { setShowNewPost(false); postForm.reset(); }}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paylasim Listesi */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : isError ? (
          <ErrorView message={error instanceof Error ? error.message : t.postsLoadFailed} onRetry={refetch} />
        ) : (
          (postsData as any)?.posts?.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const name = post.authorName || '?';
                    const colors = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-orange-500','bg-pink-500'];
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    const colorClass = colors[Math.abs(hash) % colors.length];
                    return (
                      <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {name[0].toUpperCase()}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm font-medium">{post.authorName || t.anonymous}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  {post.category && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                    </Badge>
                  )}
                </div>

                {post.title && <h3 className="font-semibold mb-1">{post.title}</h3>}
                <p className="text-sm text-muted-foreground">{post.content}</p>

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t flex-wrap">
                  {/* #10 Emoji Reaction Row */}
                  {REACTIONS.map((emoji) => {
                    const myReact = myReactions[post.id] ?? getStoredReaction(post.id);
                    const isActive = myReact === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(post.id, emoji, post.isLiked)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm border transition-all min-h-[36px] ${
                          isActive
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        <span>{emoji}</span>
                        {isActive && (
                          <span className="text-[10px] font-semibold">{post.likeCount || 1}</span>
                        )}
                      </button>
                    );
                  })}
                  {/* Like count summary when no reaction selected */}
                  {!(myReactions[post.id] ?? getStoredReaction(post.id)) && post.likeCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">{post.likeCount}</span>
                  )}
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" className="min-h-[36px] text-muted-foreground hover:text-primary p-2">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.commentCount || 0}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {!isLoading && !isError && (!postsData || (postsData as any)?.posts?.length === 0) && (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title={t.noPostsYet}
            description={t.beFirstToPost}
            action={{ label: t.share, onClick: () => setShowNewPost(true) }}
          />
        )}
      </div>
    </div>
  );
}
