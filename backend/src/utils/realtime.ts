export function membership(accountId: string) {
  return {
    deletedAt: null,
    candidate: {
      deletedAt: null,
      account: { status: "active" as const, deletedAt: null },
    },
    company: {
      deletedAt: null,
      account: { status: "active" as const, deletedAt: null },
    },
    OR: [{ candidate: { accountId } }, { company: { accountId } }],
  };
}