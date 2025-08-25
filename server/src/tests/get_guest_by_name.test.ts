import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestsTable } from '../db/schema';
import { type CreateGuestInput } from '../schema';
import { getGuestByName } from '../handlers/get_guest_by_name';

// Test data
const testGuest: CreateGuestInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890'
};

const testGuestWithoutContact: CreateGuestInput = {
  name: 'Jane Smith',
  email: null,
  phone: null
};

describe('getGuestByName', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should find an existing guest by name', async () => {
    // Create a test guest first
    await db.insert(guestsTable)
      .values(testGuest)
      .execute();

    const result = await getGuestByName('John Doe');

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('John Doe');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.phone).toEqual('+1234567890');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent guest', async () => {
    const result = await getGuestByName('Non Existent Guest');

    expect(result).toBeNull();
  });

  it('should find guest with null contact information', async () => {
    // Create a guest with no email/phone
    await db.insert(guestsTable)
      .values(testGuestWithoutContact)
      .execute();

    const result = await getGuestByName('Jane Smith');

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Jane Smith');
    expect(result!.email).toBeNull();
    expect(result!.phone).toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should perform exact name matching', async () => {
    // Create test guest
    await db.insert(guestsTable)
      .values(testGuest)
      .execute();

    // Test case sensitivity and partial matching
    expect(await getGuestByName('john doe')).toBeNull(); // Different case
    expect(await getGuestByName('JOHN DOE')).toBeNull(); // Different case
    expect(await getGuestByName('John')).toBeNull(); // Partial match
    expect(await getGuestByName('Doe')).toBeNull(); // Partial match
    expect(await getGuestByName(' John Doe ')).toBeNull(); // With spaces
    expect(await getGuestByName('John Doe')).not.toBeNull(); // Exact match
  });

  it('should handle multiple guests with different names', async () => {
    // Create multiple test guests
    await db.insert(guestsTable)
      .values([testGuest, testGuestWithoutContact])
      .execute();

    const result1 = await getGuestByName('John Doe');
    const result2 = await getGuestByName('Jane Smith');

    expect(result1).not.toBeNull();
    expect(result1!.name).toEqual('John Doe');
    expect(result1!.email).toEqual('john.doe@example.com');

    expect(result2).not.toBeNull();
    expect(result2!.name).toEqual('Jane Smith');
    expect(result2!.email).toBeNull();
  });

  it('should handle empty database gracefully', async () => {
    // No guests in database
    const result = await getGuestByName('Any Name');

    expect(result).toBeNull();
  });

  it('should handle special characters in names', async () => {
    const specialGuest: CreateGuestInput = {
      name: "O'Connor-Smith",
      email: 'special@example.com',
      phone: null
    };

    await db.insert(guestsTable)
      .values(specialGuest)
      .execute();

    const result = await getGuestByName("O'Connor-Smith");

    expect(result).not.toBeNull();
    expect(result!.name).toEqual("O'Connor-Smith");
    expect(result!.email).toEqual('special@example.com');
  });

  it('should return only first result when multiple exact matches exist', async () => {
    // Create two guests with the same name (edge case)
    const duplicateGuest1: CreateGuestInput = {
      name: 'Duplicate Name',
      email: 'first@example.com',
      phone: null
    };

    const duplicateGuest2: CreateGuestInput = {
      name: 'Duplicate Name',
      email: 'second@example.com',
      phone: null
    };

    await db.insert(guestsTable)
      .values([duplicateGuest1, duplicateGuest2])
      .execute();

    const result = await getGuestByName('Duplicate Name');

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Duplicate Name');
    // Should return one of them (database order dependent)
    expect(['first@example.com', 'second@example.com']).toContain(result!.email);
  });
});