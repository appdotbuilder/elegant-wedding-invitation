import { db } from '../db';
import { guestsTable } from '../db/schema';
import { type Guest } from '../schema';
import { eq } from 'drizzle-orm';

export async function getGuestByName(name: string): Promise<Guest | null> {
  try {
    // Query guest by exact name match
    const results = await db.select()
      .from(guestsTable)
      .where(eq(guestsTable.name, name))
      .limit(1)
      .execute();

    // Return null if no guest found
    if (results.length === 0) {
      return null;
    }

    // Return the first matching guest
    return results[0];
  } catch (error) {
    console.error('Failed to get guest by name:', error);
    throw error;
  }
}