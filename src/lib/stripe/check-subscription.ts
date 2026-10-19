import { getSql } from '@/lib/db';

export async function checkSubscription(userId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`
    SELECT status FROM subscriptions WHERE user_id = ${userId} LIMIT 1
  `;
  return rows.length > 0 && rows[0].status === 'active';
}
