export const authEndpoints = {
  login:   "/auth/login",
  refresh: "/auth/refresh-token",
  logout:  "/auth/logout",
} as const;

export const endpoints = {
  ...authEndpoints,

  // Logged-in admin profile (auth service)
  me: "/profile/profile",

  // Posts
  posts:      "/posts",
  postDetails: "/posts/:id",
  postBySlug:  "/posts/slug/:slug",
  postStatus:  "/posts/:id/status",

  // Categories
  categories:      "/categories",
  categoryDetails: "/categories/:slug",

  // Tags
  tags:       "/tags",
  tagDetails: "/tags/:slug",

  // Media
  media:        "/media",
  mediaDetails: "/media/:id",
} as const;
