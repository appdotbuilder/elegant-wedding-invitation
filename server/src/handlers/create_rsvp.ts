import { db } from '../db';
import { rsvpsTable, guestsTable } from '../db/schema';
import { type CreateRsvpInput, type RSVP } from '../schema';
import { eq } from 'drizzle-orm';

export const createRsvp = async (input: CreateRsvpInput): Promise<RSVP> => {
  try {
    // First, verify that the guest exists
    const existingGuest = await db.select()
      .from(guestsTable)
      .where(eq(guestsTable.id, input.guest_id))
      .execute();

    if (existingGuest.length === 0) {
      throw new Error(`Guest with id ${input.guest_id} not found`);
    }

    // Check if RSVP already exists for this guest
    const existingRsvp = await db.select()
      .from(rsvpsTable)
      .where(eq(rsvpsTable.guest_id, input.guest_id))
      .execute();

    if (existingRsvp.length > 0) {
      throw new Error(`RSVP already exists for guest ${input.guest_id}`);
    }

    // Insert RSVP record
    const result = await db.insert(rsvpsTable)
      .values({
        guest_id: input.guest_id,
        will_attend: input.will_attend,
        number_of_guests: input.number_of_guests,
        message: input.message
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('RSVP creation failed:', error);
    throw error;
  }
};