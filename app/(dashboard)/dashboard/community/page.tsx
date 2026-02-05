"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Trash2, Send, Users, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
  const { user } = useUser();
  const [postContent, setPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Id<"posts"> | null>(null);
  const [commentContent, setCommentContent] = useState("");

  // Get current user from Convex
  const currentUser = useQuery(
    api.functions.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get feed posts
  const posts = useQuery(api.community.getFeedPosts, { limit: 50 });

  // Mutations
  const createPost = useMutation(api.community.createPost);
  const deletePost = useMutation(api.community.deletePost);
  const likePost = useMutation(api.community.likePost);
  const addComment = useMutation(api.community.addComment);
  const sharePost = useMutation(api.community.sharePost);

  const handleCreatePost = async () => {
    if (!currentUser || !postContent.trim()) return;

    try {
      await createPost({
        userId: currentUser._id,
        content: postContent.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mediaType,
      });
      setPostContent("");
      setMediaUrl("");
      setMediaType(undefined);
      setShowMediaInput(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleDeletePost = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost({ postId, userId: currentUser._id });
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post.");
    }
  };

  const handleLike = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    try {
      await likePost({ postId, userId: currentUser._id });
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleShare = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    try {
      await sharePost({ postId, userId: currentUser._id });
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  };

  const handleAddComment = async (postId: Id<"posts">) => {
    if (!currentUser || !commentContent.trim()) return;

    try {
      await addComment({
        postId,
        userId: currentUser._id,
        content: commentContent.trim(),
      });
      setCommentContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-electric-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Community 💬
        </h1>
        <p className="text-gray-400 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Share your journey, connect with fellow gooners
        </p>
      </div>

      {/* Create Post */}
      <Card className="border-2 border-electric-indigo/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <img
              src={user?.imageUrl}
              alt={user?.firstName || "User"}
              className="w-12 h-12 rounded-full ring-2 ring-electric-indigo/50"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-24 px-4 py-3 rounded-2xl glass-panel border border-white/10 bg-white/5 resize-none focus:ring-2 focus:ring-electric-indigo"
              />
              
              {showMediaInput && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMediaType("image")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        mediaType === "image"
                          ? "bg-electric-indigo text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Image
                    </button>
                    <button
                      onClick={() => setMediaType("video")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        mediaType === "video"
                          ? "bg-electric-indigo text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      <Video className="w-4 h-4 inline mr-1" />
                      Video
                    </button>
                  </div>
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste media URL here..."
                    className="bg-white/5"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="text-sm text-electric-cyan hover:text-electric-cyan/80"
                >
                  {showMediaInput ? "Remove Media" : "+ Add Media"}
                </button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!postContent.trim()}
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {!posts && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-electric-purple mx-auto" />
          </div>
        )}

        {posts && posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-400">No posts yet</p>
              <p className="text-sm text-gray-500 mt-2">Be the first to share something!</p>
            </CardContent>
          </Card>
        )}

        {posts?.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUser._id}
            onLike={handleLike}
            onShare={handleShare}
            onDelete={handleDeletePost}
            selectedForComments={selectedPostForComments === post._id}
            onToggleComments={() =>
              setSelectedPostForComments(
                selectedPostForComments === post._id ? null : post._id
              )
            }
            commentContent={commentContent}
            setCommentContent={setCommentContent}
            onAddComment={handleAddComment}
          />
        ))}
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  currentUserId,
  onLike,
  onShare,
  onDelete,
  selectedForComments,
  onToggleComments,
  commentContent,
  setCommentContent,
  onAddComment,
}: any) {
  const hasLiked = useQuery(
    api.community.hasUserLikedPost,
    post ? { postId: post._id, userId: currentUserId } : "skip"
  );
  const hasShared = useQuery(
    api.community.hasUserSharedPost,
    post ? { postId: post._id, userId: currentUserId } : "skip"
  );
  const comments = useQuery(
    api.community.getPostComments,
    selectedForComments ? { postId: post._id } : "skip"
  );

  return (
    <Card className="hover:border-electric-indigo/30 transition-colors">
      <CardContent className="p-6 space-y-4">
        {/* Post Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img
              src={post.user?.imageUrl || "/default-avatar.png"}
              alt={post.user?.name || "User"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{post.user?.name || "Anonymous"}</p>
              <p className="text-xs text-gray-500">
                @{post.user?.username || "user"} •{" "}
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          {post.userId === currentUserId && (
            <button
              onClick={() => onDelete(post._id)}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>

        {/* Media */}
        {post.mediaUrl && (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
            {post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-96 object-contain bg-black"
                preload="metadata"
                playsInline
              >
                <source src={post.mediaUrl} type="video/mp4" />
                <source src={post.mediaUrl} type="video/webm" />
                <source src={post.mediaUrl} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-96 object-contain"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-6 pt-2 border-t border-white/10">
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 transition-colors ${
              hasLiked
                ? "text-red-500 hover:text-red-400"
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-semibold">{post.likeCount}</span>
          </button>

          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 text-gray-400 hover:text-electric-cyan transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.commentCount}</span>
          </button>

          <button
            onClick={() => onShare(post._id)}
            className={`flex items-center gap-2 transition-colors ${
              hasShared
                ? "text-green-500 hover:text-green-400"
                : "text-gray-400 hover:text-green-500"
            }`}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.shareCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {selectedForComments && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/5"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onAddComment(post._id);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => onAddComment(post._id)}
                disabled={!commentContent.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments?.map((comment: any) => (
                <div key={comment._id} className="flex gap-2 p-3 glass-panel rounded-lg">
                  <img
                    src={comment.user?.imageUrl || "/default-avatar.png"}
                    alt={comment.user?.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {comment.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
