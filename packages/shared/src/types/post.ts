export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  isLiked?: boolean;
}

export interface CreatePostDto {
  content: string;
  imageUrl?: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
