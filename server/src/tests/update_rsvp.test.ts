import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable, rsvpsTable } from '../db/schema';
import { type UpdateRsvpInput, type CreateGuestInput } from '../schema';
import { updateRsvp } from '../handlers/update_rsvp';
import { eq } from 'drizzle-orm';

describe('updateRsvp', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a guest and RSVP for testing
  const createGuestAndRsvp = async () => {
    // Create a guest first
    const guestResult = await db.insert(guestsTable)
      .values({
        name: 'Test Guest',
        email: 'test@example.com',
        phone: '+1234567890'
      })
      .returning()
      .execute();

    const guest = guestResult[0];

    // Create an RSVP for the guest
    const rsvpResult = await db.insert(rsvpsTable)
      .values({
        guest_id: guest.id,
        will_attend: true,
        number_of_guests: 2,
        message: 'Looking forward to it!'
      })
      .returning()
      .execute();

    return { guest, rsvp: rsvpResult[0] };
  };

  it('should update RSVP with all fields', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      will_attend: false,
      number_of_guests: 1,
      message: 'Sorry, cannot make it'
    };

    const result = await updateRsvp(updateInput);

    // Verify the updated RSVP
    expect(result.id).toBe(rsvp.id);
    expect(result.guest_id).toBe(rsvp.guest_id);
    expect(result.will_attend).toBe(false);
    expect(result.number_of_guests).toBe(1);
    expect(result.message).toBe('Sorry, cannot make it');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should update RSVP with partial fields', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      will_attend: false
    };

    const result = await updateRsvp(updateInput);

    // Verify only will_attend was updated
    expect(result.will_attend).toBe(false);
    expect(result.number_of_guests).toBe(2); // Should remain unchanged
    expect(result.message).toBe('Looking forward to it!'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update number_of_guests only', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      number_of_guests: 5
    };

    const result = await updateRsvp(updateInput);

    // Verify only number_of_guests was updated
    expect(result.will_attend).toBe(true); // Should remain unchanged
    expect(result.number_of_guests).toBe(5);
    expect(result.message).toBe('Looking forward to it!'); // Should remain unchanged
  });

  it('should update message to null', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      message: null
    };

    const result = await updateRsvp(updateInput);

    // Verify message was set to null
    expect(result.message).toBeNull();
    expect(result.will_attend).toBe(true); // Should remain unchanged
    expect(result.number_of_guests).toBe(2); // Should remain unchanged
  });

  it('should save updated RSVP to database', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      will_attend: false,
      number_of_guests: 3,
      message: 'Updated message'
    };

    await updateRsvp(updateInput);

    // Query the database to verify the update was saved
    const updatedRsvps = await db.select()
      .from(rsvpsTable)
      .where(eq(rsvpsTable.id, rsvp.id))
      .execute();

    expect(updatedRsvps).toHaveLength(1);
    const updatedRsvp = updatedRsvps[0];
    expect(updatedRsvp.will_attend).toBe(false);
    expect(updatedRsvp.number_of_guests).toBe(3);
    expect(updatedRsvp.message).toBe('Updated message');
    expect(updatedRsvp.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when RSVP does not exist', async () => {
    const updateInput: UpdateRsvpInput = {
      id: 999, // Non-existent ID
      will_attend: true
    };

    await expect(updateRsvp(updateInput)).rejects.toThrow(/RSVP with id 999 not found/i);
  });

  it('should update updated_at timestamp even with no field changes', async () => {
    const { rsvp } = await createGuestAndRsvp();
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id
      // No fields to update
    };

    const result = await updateRsvp(updateInput);

    // Verify updated_at was changed even though no other fields were updated
    expect(result.updated_at.getTime()).toBeGreaterThan(rsvp.updated_at.getTime());
    expect(result.will_attend).toBe(rsvp.will_attend);
    expect(result.number_of_guests).toBe(rsvp.number_of_guests);
    expect(result.message).toBe(rsvp.message);
  });

  it('should handle edge case values correctly', async () => {
    const { rsvp } = await createGuestAndRsvp();

    const updateInput: UpdateRsvpInput = {
      id: rsvp.id,
      number_of_guests: 1, // Minimum value
      message: '' // Empty string
    };

    const result = await updateRsvp(updateInput);

    expect(result.number_of_guests).toBe(1);
    expect(result.message).toBe('');
  });
});