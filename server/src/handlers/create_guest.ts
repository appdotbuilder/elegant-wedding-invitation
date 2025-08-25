import { db } from '../db';
import { guestsTable } from '../db/schema';
import { type CreateGuestInput, type Guest } from '../schema';

export const createGuest = async (input: CreateGuestInput): Promise<Guest> => {
  try {
    // Insert guest record
    const result = await db.insert(guestsTable)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone
      })
      .returning()
      .execute();

    // Return the created guest
    const guest = result[0];
    return {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      created_at: guest.created_at
    };
  } catch (error) {
    console.error('Guest creation failed:', error);
    throw error;
  }
};