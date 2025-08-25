import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable, rsvpsTable } from '../db/schema';
import { getRsvpByGuest } from '../handlers/get_rsvp_by_guest';

describe('getRsvpByGuest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return RSVP when guest has responded', async () => {
    // Create a test guest first
    const guestResult = await db.insert(guestsTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
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
        message: 'Looking forward to the celebration!'
      })
      .returning()
      .execute();

    const expectedRsvp = rsvpResult[0];

    // Test the handler
    const result = await getRsvpByGuest(guest.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expectedRsvp.id);
    expect(result!.guest_id).toEqual(guest.id);
    expect(result!.will_attend).toBe(true);
    expect(result!.number_of_guests).toEqual(2);
    expect(result!.message).toEqual('Looking forward to the celebration!');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when guest has no RSVP', async () => {
    // Create a test guest without RSVP
    const guestResult = await db.insert(guestsTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321'
      })
      .returning()
      .execute();

    const guest = guestResult[0];

    // Test the handler - should return null
    const result = await getRsvpByGuest(guest.id);

    expect(result).toBeNull();
  });

  it('should return null for non-existent guest ID', async () => {
    // Test with a guest ID that doesn't exist
    const result = await getRsvpByGuest(999999);

    expect(result).toBeNull();
  });

  it('should handle RSVP with minimal data correctly', async () => {
    // Create a test guest
    const guestResult = await db.insert(guestsTable)
      .values({
        name: 'Bob Wilson',
        email: null,
        phone: null
      })
      .returning()
      .execute();

    const guest = guestResult[0];

    // Create an RSVP with minimal data (no message)
    const rsvpResult = await db.insert(rsvpsTable)
      .values({
        guest_id: guest.id,
        will_attend: false,
        number_of_guests: 1,
        message: null
      })
      .returning()
      .execute();

    const expectedRsvp = rsvpResult[0];

    // Test the handler
    const result = await getRsvpByGuest(guest.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expectedRsvp.id);
    expect(result!.guest_id).toEqual(guest.id);
    expect(result!.will_attend).toBe(false);
    expect(result!.number_of_guests).toEqual(1);
    expect(result!.message).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return the correct RSVP when multiple guests exist', async () => {
    // Create multiple guests with RSVPs
    const guest1Result = await db.insert(guestsTable)
      .values({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1111111111'
      })
      .returning()
      .execute();

    const guest2Result = await db.insert(guestsTable)
      .values({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+2222222222'
      })
      .returning()
      .execute();

    const guest1 = guest1Result[0];
    const guest2 = guest2Result[0];

    // Create RSVPs for both guests
    await db.insert(rsvpsTable)
      .values({
        guest_id: guest1.id,
        will_attend: true,
        number_of_guests: 3,
        message: 'Alice RSVP message'
      })
      .execute();

    const rsvp2Result = await db.insert(rsvpsTable)
      .values({
        guest_id: guest2.id,
        will_attend: false,
        number_of_guests: 1,
        message: 'Charlie RSVP message'
      })
      .returning()
      .execute();

    const expectedRsvp2 = rsvp2Result[0];

    // Test getting RSVP for second guest
    const result = await getRsvpByGuest(guest2.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expectedRsvp2.id);
    expect(result!.guest_id).toEqual(guest2.id);
    expect(result!.will_attend).toBe(false);
    expect(result!.number_of_guests).toEqual(1);
    expect(result!.message).toEqual('Charlie RSVP message');
  });
});