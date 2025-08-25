import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable, rsvpsTable } from '../db/schema';
import { type CreateRsvpInput } from '../schema';
import { createRsvp } from '../handlers/create_rsvp';
import { eq } from 'drizzle-orm';

describe('createRsvp', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test guest
  const createTestGuest = async () => {
    const guestResult = await db.insert(guestsTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      })
      .returning()
      .execute();
    return guestResult[0];
  };

  const testInput: CreateRsvpInput = {
    guest_id: 1, // Will be updated with actual guest ID
    will_attend: true,
    number_of_guests: 2,
    message: 'Looking forward to celebrating with you!'
  };

  it('should create an RSVP successfully', async () => {
    const guest = await createTestGuest();
    const input = { ...testInput, guest_id: guest.id };

    const result = await createRsvp(input);

    // Basic field validation
    expect(result.guest_id).toEqual(guest.id);
    expect(result.will_attend).toEqual(true);
    expect(result.number_of_guests).toEqual(2);
    expect(result.message).toEqual('Looking forward to celebrating with you!');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save RSVP to database', async () => {
    const guest = await createTestGuest();
    const input = { ...testInput, guest_id: guest.id };

    const result = await createRsvp(input);

    // Query database to verify RSVP was saved
    const rsvps = await db.select()
      .from(rsvpsTable)
      .where(eq(rsvpsTable.id, result.id))
      .execute();

    expect(rsvps).toHaveLength(1);
    expect(rsvps[0].guest_id).toEqual(guest.id);
    expect(rsvps[0].will_attend).toEqual(true);
    expect(rsvps[0].number_of_guests).toEqual(2);
    expect(rsvps[0].message).toEqual('Looking forward to celebrating with you!');
    expect(rsvps[0].created_at).toBeInstanceOf(Date);
    expect(rsvps[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create RSVP with default number_of_guests', async () => {
    const guest = await createTestGuest();
    const input = {
      guest_id: guest.id,
      will_attend: false,
      number_of_guests: 1, // Include the default value explicitly
      message: null
    };

    const result = await createRsvp(input);

    expect(result.number_of_guests).toEqual(1); // Default value from Zod schema
    expect(result.will_attend).toEqual(false);
    expect(result.message).toBeNull();
  });

  it('should create RSVP with null message', async () => {
    const guest = await createTestGuest();
    const input = {
      guest_id: guest.id,
      will_attend: true,
      number_of_guests: 3,
      message: null
    };

    const result = await createRsvp(input);

    expect(result.message).toBeNull();
    expect(result.number_of_guests).toEqual(3);
    expect(result.will_attend).toEqual(true);
  });

  it('should throw error for non-existent guest', async () => {
    const input = {
      guest_id: 999, // Non-existent guest ID
      will_attend: true,
      number_of_guests: 1,
      message: 'Test message'
    };

    await expect(createRsvp(input)).rejects.toThrow(/guest with id 999 not found/i);
  });

  it('should throw error when RSVP already exists for guest', async () => {
    const guest = await createTestGuest();
    const input = { ...testInput, guest_id: guest.id };

    // Create first RSVP
    await createRsvp(input);

    // Try to create second RSVP for same guest
    const secondInput = {
      guest_id: guest.id,
      will_attend: false,
      number_of_guests: 1,
      message: 'Changed my mind'
    };

    await expect(createRsvp(secondInput)).rejects.toThrow(/rsvp already exists for guest/i);
  });

  it('should create RSVPs for different guests successfully', async () => {
    // Create two different guests
    const guest1 = await createTestGuest();
    const guest2 = await db.insert(guestsTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321'
      })
      .returning()
      .execute()
      .then(result => result[0]);

    // Create RSVPs for both guests
    const input1 = { ...testInput, guest_id: guest1.id };
    const input2 = { 
      guest_id: guest2.id,
      will_attend: false,
      number_of_guests: 1,
      message: 'Sorry, cannot attend'
    };

    const result1 = await createRsvp(input1);
    const result2 = await createRsvp(input2);

    expect(result1.guest_id).toEqual(guest1.id);
    expect(result1.will_attend).toEqual(true);
    expect(result2.guest_id).toEqual(guest2.id);
    expect(result2.will_attend).toEqual(false);

    // Verify both RSVPs exist in database
    const allRsvps = await db.select().from(rsvpsTable).execute();
    expect(allRsvps).toHaveLength(2);
  });

  it('should handle boundary values for number_of_guests', async () => {
    const guest1 = await createTestGuest();
    const guest2 = await db.insert(guestsTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com'
      })
      .returning()
      .execute()
      .then(result => result[0]);

    // Test minimum value (1)
    const minInput = {
      guest_id: guest1.id,
      will_attend: true,
      number_of_guests: 1,
      message: null
    };

    // Test maximum value (10)
    const maxInput = {
      guest_id: guest2.id,
      will_attend: true,
      number_of_guests: 10,
      message: null
    };

    const result1 = await createRsvp(minInput);
    const result2 = await createRsvp(maxInput);

    expect(result1.number_of_guests).toEqual(1);
    expect(result2.number_of_guests).toEqual(10);
  });
});