import { db } from '../db';
import { rsvpsTable } from '../db/schema';
import { type UpdateRsvpInput, type RSVP } from '../schema';
import { eq } from 'drizzle-orm';

export const updateRsvp = async (input: UpdateRsvpInput): Promise<RSVP> => {
  try {
    // First check if the RSVP exists
    const existingRsvp = await db.select()
      .from(rsvpsTable)
      .where(eq(rsvpsTable.id, input.id))
      .execute();

    if (existingRsvp.length === 0) {
      throw new Error(`RSVP with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof rsvpsTable.$inferInsert> = {};
    
    if (input.will_attend !== undefined) {
      updateData.will_attend = input.will_attend;
    }
    
    if (input.number_of_guests !== undefined) {
      updateData.number_of_guests = input.number_of_guests;
    }
    
    if (input.message !== undefined) {
      updateData.message = input.message;
    }

    // Always update the timestamp
    updateData.updated_at = new Date();

    // Update the RSVP
    const result = await db.update(rsvpsTable)
      .set(updateData)
      .where(eq(rsvpsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('RSVP update failed:', error);
    throw error;
  }
};