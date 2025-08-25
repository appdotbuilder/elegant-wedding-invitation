import { db } from '../db';
import { guestsTable, rsvpsTable } from '../db/schema';
import { type GuestWithRSVP } from '../schema';
import { eq } from 'drizzle-orm';

export async function getGuests(): Promise<GuestWithRSVP[]> {
  try {
    // Use left join to get all guests with their RSVP data (if exists)
    const results = await db.select()
      .from(guestsTable)
      .leftJoin(rsvpsTable, eq(guestsTable.id, rsvpsTable.guest_id))
      .execute();

    // Map the joined results to the expected format
    return results.map(result => ({
      id: result.guests.id,
      name: result.guests.name,
      email: result.guests.email,
      phone: result.guests.phone,
      created_at: result.guests.created_at,
      rsvp: result.rsvps ? {
        id: result.rsvps.id,
        guest_id: result.rsvps.guest_id,
        will_attend: result.rsvps.will_attend,
        number_of_guests: result.rsvps.number_of_guests,
        message: result.rsvps.message,
        created_at: result.rsvps.created_at,
        updated_at: result.rsvps.updated_at
      } : null
    }));
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    throw error;
  }
}