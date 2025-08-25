import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingInfoTable } from '../db/schema';
import { getWeddingInfo } from '../handlers/get_wedding_info';

// Test wedding info data
const testWeddingInfo = {
  bride_full_name: 'Sarah Johnson',
  bride_nickname: 'Sarah',
  bride_father: 'Robert Johnson',
  bride_mother: 'Mary Johnson',
  groom_full_name: 'Michael Thompson',
  groom_nickname: 'Mike',
  groom_father: 'David Thompson',
  groom_mother: 'Linda Thompson',
  ceremony_date: new Date('2024-06-15T14:00:00.000Z'),
  ceremony_time_start: '14:00',
  ceremony_time_end: '15:00',
  ceremony_location: 'St. Mary\'s Church',
  reception_date: new Date('2024-06-15T18:00:00.000Z'),
  reception_time_start: '18:00',
  reception_time_end: '23:00',
  reception_location: 'Grand Ballroom Hotel',
  reception_maps_url: 'https://maps.google.com/example',
  bank_name: 'First National Bank',
  account_holder: 'Sarah & Michael Wedding',
  account_number: '123456789',
  rsvp_message: 'Please RSVP by May 1st',
  rsvp_deadline: new Date('2024-05-01T23:59:59.000Z'),
  co_invitation_message: 'Join us in celebrating our special day',
  quran_verse: 'And among His signs is that He created for you mates from among yourselves'
};

describe('getWeddingInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no wedding info exists', async () => {
    const result = await getWeddingInfo();
    expect(result).toBeNull();
  });

  it('should return wedding information when it exists', async () => {
    // Insert test wedding info
    await db.insert(weddingInfoTable)
      .values(testWeddingInfo)
      .execute();

    const result = await getWeddingInfo();

    expect(result).not.toBeNull();
    expect(result!.bride_full_name).toEqual('Sarah Johnson');
    expect(result!.bride_nickname).toEqual('Sarah');
    expect(result!.groom_full_name).toEqual('Michael Thompson');
    expect(result!.groom_nickname).toEqual('Mike');
    expect(result!.ceremony_location).toEqual('St. Mary\'s Church');
    expect(result!.reception_location).toEqual('Grand Ballroom Hotel');
    expect(result!.bank_name).toEqual('First National Bank');
    expect(result!.account_number).toEqual('123456789');
    expect(result!.rsvp_message).toEqual('Please RSVP by May 1st');
    expect(result!.quran_verse).toEqual('And among His signs is that He created for you mates from among yourselves');
  });

  it('should return wedding info with correct date fields', async () => {
    // Insert test wedding info
    await db.insert(weddingInfoTable)
      .values(testWeddingInfo)
      .execute();

    const result = await getWeddingInfo();

    expect(result).not.toBeNull();
    expect(result!.ceremony_date).toBeInstanceOf(Date);
    expect(result!.reception_date).toBeInstanceOf(Date);
    expect(result!.rsvp_deadline).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify specific dates
    expect(result!.ceremony_date.toISOString()).toEqual('2024-06-15T14:00:00.000Z');
    expect(result!.reception_date.toISOString()).toEqual('2024-06-15T18:00:00.000Z');
    expect(result!.rsvp_deadline.toISOString()).toEqual('2024-05-01T23:59:59.000Z');
  });

  it('should return wedding info with nullable fields handled correctly', async () => {
    // Insert wedding info with null reception_maps_url
    const weddingInfoWithNulls = {
      ...testWeddingInfo,
      reception_maps_url: null
    };

    await db.insert(weddingInfoTable)
      .values(weddingInfoWithNulls)
      .execute();

    const result = await getWeddingInfo();

    expect(result).not.toBeNull();
    expect(result!.reception_maps_url).toBeNull();
    expect(result!.bride_full_name).toEqual('Sarah Johnson');
  });

  it('should return first record when multiple wedding info records exist', async () => {
    // Insert first wedding info
    await db.insert(weddingInfoTable)
      .values(testWeddingInfo)
      .execute();

    // Insert second wedding info
    const secondWeddingInfo = {
      ...testWeddingInfo,
      bride_full_name: 'Emma Wilson',
      groom_full_name: 'James Smith'
    };

    await db.insert(weddingInfoTable)
      .values(secondWeddingInfo)
      .execute();

    const result = await getWeddingInfo();

    expect(result).not.toBeNull();
    // Should return the first record (by insertion order)
    expect(result!.bride_full_name).toEqual('Sarah Johnson');
    expect(result!.groom_full_name).toEqual('Michael Thompson');
  });

  it('should include all required fields in response', async () => {
    // Insert test wedding info
    await db.insert(weddingInfoTable)
      .values(testWeddingInfo)
      .execute();

    const result = await getWeddingInfo();

    expect(result).not.toBeNull();
    
    // Verify all required fields are present
    expect(result!.id).toBeDefined();
    expect(result!.bride_full_name).toBeDefined();
    expect(result!.bride_nickname).toBeDefined();
    expect(result!.bride_father).toBeDefined();
    expect(result!.bride_mother).toBeDefined();
    expect(result!.groom_full_name).toBeDefined();
    expect(result!.groom_nickname).toBeDefined();
    expect(result!.groom_father).toBeDefined();
    expect(result!.groom_mother).toBeDefined();
    expect(result!.ceremony_date).toBeDefined();
    expect(result!.ceremony_time_start).toBeDefined();
    expect(result!.ceremony_time_end).toBeDefined();
    expect(result!.ceremony_location).toBeDefined();
    expect(result!.reception_date).toBeDefined();
    expect(result!.reception_time_start).toBeDefined();
    expect(result!.reception_time_end).toBeDefined();
    expect(result!.reception_location).toBeDefined();
    expect(result!.bank_name).toBeDefined();
    expect(result!.account_holder).toBeDefined();
    expect(result!.account_number).toBeDefined();
    expect(result!.rsvp_message).toBeDefined();
    expect(result!.rsvp_deadline).toBeDefined();
    expect(result!.co_invitation_message).toBeDefined();
    expect(result!.quran_verse).toBeDefined();
    expect(result!.created_at).toBeDefined();
    expect(result!.updated_at).toBeDefined();
  });
});