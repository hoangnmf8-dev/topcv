export const cvKeys = {
  all: (accountId: string) => ["cv", accountId] as const,
  list: (accountId: string) => ["cv", accountId, "list"] as const,
  detail: (accountId: string, id: string) =>
    ["cv", accountId, "detail", id] as const,
};
