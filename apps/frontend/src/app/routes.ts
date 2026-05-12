export const routes = {
  login: '/login',
  register: '/register',
  app: '/app',
  archived: '/app/archived',
  list: (listId?: string) => (listId ? `/app/lists/${listId}` : '/app/lists'),
} as const
