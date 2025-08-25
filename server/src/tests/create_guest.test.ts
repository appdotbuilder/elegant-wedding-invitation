import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable } from '../db/schema';
import { type CreateGuestInput } from '../schema';
import { createGuest } from '../handlers/create_guest';
import { eq } from 'drizzle-orm';

// Test input with all fields
const fullTestInput: CreateGuestInput = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
};

// Test input with minimal required fields
const minimalTestInput: CreateGuestInput = {
  name: 'Jane Smith',
  email: null,
  phone: null
};

describe('createGuest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a guest with all fields', async () => {
    const result = await createGuest(fullTestInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john@example.com');
    expect(result.phone).toEqual('+1234567890');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a guest with minimal required fields', async () => {
    const result = await createGuest(minimalTestInput);

    // Verify required fields
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save guest to database with all fields', async () => {
    const result = await createGuest(fullTestInput);

    // Query database to verify guest was saved
    const guests = await db.select()
      .from(guestsTable)
      .where(eq(guestsTable.id, result.id))
      .execute();

    expect(guests).toHaveLength(1);
    expect(guests[0].name).toEqual('John Doe');
    expect(guests[0].email).toEqual('john@example.com');
    expect(guests[0].phone).toEqual('+1234567890');
    expect(guests[0].created_at).toBeInstanceOf(Date);
  });

  it('should save guest to database with nullable fields', async () => {
    const result = await createGuest(minimalTestInput);

    // Query database to verify guest was saved
    const guests = await db.select()
      .from(guestsTable)
      .where(eq(guestsTable.id, result.id))
      .execute();

    expect(guests).toHaveLength(1);
    expect(guests[0].name).toEqual('Jane Smith');
    expect(guests[0].email).toBeNull();
    expect(guests[0].phone).toBeNull();
    expect(guests[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple guests with unique IDs', async () => {
    const guest1 = await createGuest({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: null
    });

    const guest2 = await createGuest({
      name: 'Bob Wilson',
      email: null,
      phone: '+9876543210'
    });

    // Verify unique IDs
    expect(guest1.id).not.toEqual(guest2.id);
    expect(typeof guest1.id).toBe('number');
    expect(typeof guest2.id).toBe('number');

    // Verify both guests exist in database
    const allGuests = await db.select()
      .from(guestsTable)
      .execute();

    expect(allGuests).toHaveLength(2);
    
    const guestNames = allGuests.map(g => g.name).sort();
    expect(guestNames).toEqual(['Alice Johnson', 'Bob Wilson']);
  });

  it('should handle email validation properly', async () => {
    // Test with valid email
    const guestWithEmail = await createGuest({
      name: 'Test User',
      email: 'test@domain.co.uk',
      phone: null
    });

    expect(guestWithEmail.email).toEqual('test@domain.co.uk');

    // Test with null email
    const guestWithoutEmail = await createGuest({
      name: 'Another User',
      email: null,
      phone: '+123456'
    });

    expect(guestWithoutEmail.email).toBeNull();
    expect(guestWithoutEmail.phone).toEqual('+123456');
  });

  it('should preserve timestamp precision', async () => {
    const beforeCreation = new Date();
    const result = await createGuest(fullTestInput);
    const afterCreation = new Date();

    // Verify timestamp is within reasonable range
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);

    // Verify database timestamp matches returned timestamp
    const dbGuest = await db.select()
      .from(guestsTable)
      .where(eq(guestsTable.id, result.id))
      .execute();

    expect(dbGuest[0].created_at.getTime()).toEqual(result.created_at.getTime());
  });
});