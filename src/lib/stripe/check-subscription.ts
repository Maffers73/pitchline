import { getSql } from '@/lib/db';

export async function checkSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;
  const sql = await getSql();
  const rows = await sql`
    SELECT status FROM subscriptions WHERE user_id = ${userId} LIMIT 1
  `;
  if (rows.length === 0) return false;
  const status = rows[0].status;
  return status === 'active' || status === 'trialing';
}
