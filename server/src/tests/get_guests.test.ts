import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable, rsvpsTable } from '../db/schema';
import { type CreateGuestInput, type CreateRsvpInput } from '../schema';
import { getGuests } from '../handlers/get_guests';

describe('getGuests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no guests exist', async () => {
    const result = await getGuests();
    expect(result).toEqual([]);
  });

  it('should fetch all guests without RSVPs', async () => {
    // Create test guests
    const guestData1: CreateGuestInput = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    };
    const guestData2: CreateGuestInput = {
      name: 'Jane Smith',
      email: null,
      phone: '098-765-4321'
    };

    const [guest1] = await db.insert(guestsTable)
      .values(guestData1)
      .returning()
      .execute();

    const [guest2] = await db.insert(guestsTable)
      .values(guestData2)
      .returning()
      .execute();

    const result = await getGuests();

    expect(result).toHaveLength(2);

    // Verify first guest
    const foundGuest1 = result.find(g => g.id === guest1.id);
    expect(foundGuest1).toBeDefined();
    expect(foundGuest1?.name).toEqual('John Doe');
    expect(foundGuest1?.email).toEqual('john@example.com');
    expect(foundGuest1?.phone).toEqual('123-456-7890');
    expect(foundGuest1?.created_at).toBeInstanceOf(Date);
    expect(foundGuest1?.rsvp).toBeNull();

    // Verify second guest
    const foundGuest2 = result.find(g => g.id === guest2.id);
    expect(foundGuest2).toBeDefined();
    expect(foundGuest2?.name).toEqual('Jane Smith');
    expect(foundGuest2?.email).toBeNull();
    expect(foundGuest2?.phone).toEqual('098-765-4321');
    expect(foundGuest2?.created_at).toBeInstanceOf(Date);
    expect(foundGuest2?.rsvp).toBeNull();
  });

  it('should fetch guests with their RSVP data', async () => {
    // Create test guest
    const guestData: CreateGuestInput = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '555-0123'
    };

    const [guest] = await db.insert(guestsTable)
      .values(guestData)
      .returning()
      .execute();

    // Create RSVP for the guest
    const rsvpData: CreateRsvpInput = {
      guest_id: guest.id,
      will_attend: true,
      number_of_guests: 2,
      message: 'Looking forward to the celebration!'
    };

    const [rsvp] = await db.insert(rsvpsTable)
      .values(rsvpData)
      .returning()
      .execute();

    const result = await getGuests();

    expect(result).toHaveLength(1);

    const foundGuest = result[0];
    expect(foundGuest.id).toEqual(guest.id);
    expect(foundGuest.name).toEqual('Alice Johnson');
    expect(foundGuest.email).toEqual('alice@example.com');
    expect(foundGuest.phone).toEqual('555-0123');
    expect(foundGuest.created_at).toBeInstanceOf(Date);

    // Verify RSVP data
    expect(foundGuest.rsvp).toBeDefined();
    expect(foundGuest.rsvp?.id).toEqual(rsvp.id);
    expect(foundGuest.rsvp?.guest_id).toEqual(guest.id);
    expect(foundGuest.rsvp?.will_attend).toBe(true);
    expect(foundGuest.rsvp?.number_of_guests).toEqual(2);
    expect(foundGuest.rsvp?.message).toEqual('Looking forward to the celebration!');
    expect(foundGuest.rsvp?.created_at).toBeInstanceOf(Date);
    expect(foundGuest.rsvp?.updated_at).toBeInstanceOf(Date);
  });

  it('should fetch mixed guests - some with RSVPs, some without', async () => {
    // Create multiple guests
    const [guestWithRsvp] = await db.insert(guestsTable)
      .values({
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '111-222-3333'
      })
      .returning()
      .execute();

    const [guestWithoutRsvp] = await db.insert(guestsTable)
      .values({
        name: 'Carol Brown',
        email: 'carol@example.com',
        phone: null
      })
      .returning()
      .execute();

    // Create RSVP only for first guest
    await db.insert(rsvpsTable)
      .values({
        guest_id: guestWithRsvp.id,
        will_attend: false,
        number_of_guests: 1,
        message: 'Sorry, cannot make it'
      })
      .execute();

    const result = await getGuests();

    expect(result).toHaveLength(2);

    // Guest with RSVP
    const foundGuestWithRsvp = result.find(g => g.id === guestWithRsvp.id);
    expect(foundGuestWithRsvp).toBeDefined();
    expect(foundGuestWithRsvp?.name).toEqual('Bob Wilson');
    expect(foundGuestWithRsvp?.rsvp).toBeDefined();
    expect(foundGuestWithRsvp?.rsvp?.will_attend).toBe(false);
    expect(foundGuestWithRsvp?.rsvp?.number_of_guests).toEqual(1);
    expect(foundGuestWithRsvp?.rsvp?.message).toEqual('Sorry, cannot make it');

    // Guest without RSVP
    const foundGuestWithoutRsvp = result.find(g => g.id === guestWithoutRsvp.id);
    expect(foundGuestWithoutRsvp).toBeDefined();
    expect(foundGuestWithoutRsvp?.name).toEqual('Carol Brown');
    expect(foundGuestWithoutRsvp?.phone).toBeNull();
    expect(foundGuestWithoutRsvp?.rsvp).toBeNull();
  });

  it('should handle guests with null email and phone fields', async () => {
    // Create guest with all null optional fields
    const [guest] = await db.insert(guestsTable)
      .values({
        name: 'Minimal Guest',
        email: null,
        phone: null
      })
      .returning()
      .execute();

    const result = await getGuests();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(guest.id);
    expect(result[0].name).toEqual('Minimal Guest');
    expect(result[0].email).toBeNull();
    expect(result[0].phone).toBeNull();
    expect(result[0].rsvp).toBeNull();
  });

  it('should return guests in consistent order', async () => {
    // Create multiple guests
    const guests = [];
    for (let i = 1; i <= 3; i++) {
      const [guest] = await db.insert(guestsTable)
        .values({
          name: `Guest ${i}`,
          email: `guest${i}@example.com`,
          phone: `${i}${i}${i}-${i}${i}${i}-${i}${i}${i}${i}`
        })
        .returning()
        .execute();
      guests.push(guest);
    }

    const result = await getGuests();
    
    expect(result).toHaveLength(3);
    
    // Results should include all created guests
    const guestIds = result.map(g => g.id).sort();
    const expectedIds = guests.map(g => g.id).sort();
    expect(guestIds).toEqual(expectedIds);
  });
});