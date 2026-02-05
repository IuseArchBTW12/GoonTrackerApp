import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new post
export const createPost = mutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      userId: args.userId,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      createdAt: Date.now(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    });

    return postId;
  },
});

// Delete a post
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== args.userId) {
      throw new Error("Unauthorized or post not found");
    }

    // Delete all likes
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete all comments
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all shares
    const shares = await ctx.db
      .query("postShares")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const share of shares) {
      await ctx.db.delete(share._id);
    }

    // Delete the post
    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

// Get feed posts (paginated)
export const getFeedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    // Enrich posts with user data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          user: user ? {
            _id: user._id,
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
          } : null,
        };
      })
    );

    return enrichedPosts;
  },
});

// Get user posts
export const getUserPosts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const user = await ctx.db.get(args.userId);

    return posts.map(post => ({
      ...post,
      user: user ? {
        _id: user._id,
        name: user.name,
        username: user.username,
        imageUrl: user.imageUrl,
      } : null,
    }));
  },
});

// Like a post
export const likePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already liked
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          likeCount: Math.max(0, post.likeCount - 1),
        });
      }
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("postLikes", {
        postId: args.postId,
        userId: args.userId,
        createdAt: Date.now(),
      });

      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          likeCount: post.likeCount + 1,
        });
      }
      return { liked: true };
    }
  },
});

// Check if user liked a post
export const hasUserLikedPost = query({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .first();

    return !!like;
  },
});

// Add comment to post
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("postComments", {
      postId: args.postId,
      userId: args.userId,
      content: args.content,
      createdAt: Date.now(),
    });

    // Increment comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });
    }

    return commentId;
  },
});

// Get post comments
export const getPostComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post_and_time", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    // Enrich comments with user data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user ? {
            _id: user._id,
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
          } : null,
        };
      })
    );

    return enrichedComments;
  },
});

// Share/retweet a post
export const sharePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already shared
    const existing = await ctx.db
      .query("postShares")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      // Unshare
      await ctx.db.delete(existing._id);
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          shareCount: Math.max(0, post.shareCount - 1),
        });
      }
      return { shared: false };
    } else {
      // Share
      await ctx.db.insert("postShares", {
        postId: args.postId,
        userId: args.userId,
        createdAt: Date.now(),
      });

      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          shareCount: post.shareCount + 1,
        });
      }
      return { shared: true };
    }
  },
});

// Check if user shared a post
export const hasUserSharedPost = query({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("postShares")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .first();

    return !!share;
  },
});
