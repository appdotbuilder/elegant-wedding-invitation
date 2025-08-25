import { db } from '../db';
import { rsvpsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type RSVP } from '../schema';

export async function getRsvpByGuest(guestId: number): Promise<RSVP | null> {
  try {
    // Query for RSVP by guest_id
    const results = await db.select()
      .from(rsvpsTable)
      .where(eq(rsvpsTable.guest_id, guestId))
      .execute();

    // Return null if no RSVP found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and should be only) RSVP record
    return results[0];
  } catch (error) {
    console.error('Failed to fetch RSVP by guest:', error);
    throw error;
  }
}