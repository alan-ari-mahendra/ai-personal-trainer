export function getUserId(req: Request): string {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized — proxy should have caught this');
  return userId;
}
