import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingInfoTable } from '../db/schema';
import { type UpdateWeddingInfoInput } from '../schema';
import { updateWeddingInfo } from '../handlers/update_wedding_info';
import { eq } from 'drizzle-orm';

describe('updateWeddingInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create initial wedding info record
  const createInitialWeddingInfo = async () => {
    const initialData = {
      bride_full_name: 'Sarah Amelia W',
      bride_nickname: 'Sarah',
      bride_father: 'Mr. David W',
      bride_mother: 'Mrs. Emily W',
      groom_full_name: 'Michael John S',
      groom_nickname: 'Mike',
      groom_father: 'Mr. Robert S',
      groom_mother: 'Mrs. Laura S',
      ceremony_date: new Date('2024-12-14'),
      ceremony_time_start: '10:00 AM',
      ceremony_time_end: '11:00 AM',
      ceremony_location: 'Grand Mosque, Jalan Raya No. 123, Jakarta',
      reception_date: new Date('2024-12-14'),
      reception_time_start: '01:00 PM',
      reception_time_end: '04:00 PM',
      reception_location: 'The Majestic Ballroom, Hotel Indah, Jalan Mawar No. 45, Jakarta',
      reception_maps_url: 'https://maps.google.com/example',
      bank_name: 'Bank Example',
      account_holder: 'Sarah Amelia W',
      account_number: '1234567890',
      rsvp_message: 'Your presence is our greatest gift.',
      rsvp_deadline: new Date('2024-11-30'),
      co_invitation_message: 'We humbly invite our esteemed relatives.',
      quran_verse: 'And of His signs is that He created for you mates.'
    };

    return await db.insert(weddingInfoTable)
      .values(initialData)
      .returning()
      .execute();
  };

  it('should update bride information', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      bride_full_name: 'Sarah Emily Johnson',
      bride_nickname: 'Emmy',
      bride_father: 'Mr. John Johnson'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.bride_full_name).toEqual('Sarah Emily Johnson');
    expect(result.bride_nickname).toEqual('Emmy');
    expect(result.bride_father).toEqual('Mr. John Johnson');
    expect(result.bride_mother).toEqual('Mrs. Emily W'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update groom information', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      groom_full_name: 'Michael Robert Smith',
      groom_nickname: 'Rob',
      groom_father: 'Mr. James Smith',
      groom_mother: 'Mrs. Linda Smith'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.groom_full_name).toEqual('Michael Robert Smith');
    expect(result.groom_nickname).toEqual('Rob');
    expect(result.groom_father).toEqual('Mr. James Smith');
    expect(result.groom_mother).toEqual('Mrs. Linda Smith');
    expect(result.bride_full_name).toEqual('Sarah Amelia W'); // Should remain unchanged
  });

  it('should update ceremony details', async () => {
    await createInitialWeddingInfo();

    const newDate = new Date('2024-12-20');
    const updateInput: UpdateWeddingInfoInput = {
      ceremony_date: newDate,
      ceremony_time_start: '09:00 AM',
      ceremony_time_end: '10:30 AM',
      ceremony_location: 'New Wedding Venue, Jakarta'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.ceremony_date).toEqual(newDate);
    expect(result.ceremony_time_start).toEqual('09:00 AM');
    expect(result.ceremony_time_end).toEqual('10:30 AM');
    expect(result.ceremony_location).toEqual('New Wedding Venue, Jakarta');
  });

  it('should update reception details with maps URL', async () => {
    await createInitialWeddingInfo();

    const newReceptionDate = new Date('2024-12-21');
    const updateInput: UpdateWeddingInfoInput = {
      reception_date: newReceptionDate,
      reception_time_start: '02:00 PM',
      reception_time_end: '05:00 PM',
      reception_location: 'Updated Ballroom, New Hotel',
      reception_maps_url: 'https://maps.google.com/updated-location'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.reception_date).toEqual(newReceptionDate);
    expect(result.reception_time_start).toEqual('02:00 PM');
    expect(result.reception_time_end).toEqual('05:00 PM');
    expect(result.reception_location).toEqual('Updated Ballroom, New Hotel');
    expect(result.reception_maps_url).toEqual('https://maps.google.com/updated-location');
  });

  it('should update bank information', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      bank_name: 'New Bank Corp',
      account_holder: 'Michael John S',
      account_number: '9876543210'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.bank_name).toEqual('New Bank Corp');
    expect(result.account_holder).toEqual('Michael John S');
    expect(result.account_number).toEqual('9876543210');
  });

  it('should update RSVP information', async () => {
    await createInitialWeddingInfo();

    const newDeadline = new Date('2024-12-01');
    const updateInput: UpdateWeddingInfoInput = {
      rsvp_message: 'Please confirm your attendance by the deadline.',
      rsvp_deadline: newDeadline
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.rsvp_message).toEqual('Please confirm your attendance by the deadline.');
    expect(result.rsvp_deadline).toEqual(newDeadline);
  });

  it('should update invitation message and Quran verse', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      co_invitation_message: 'We are delighted to invite you to our special day.',
      quran_verse: 'Updated Quran verse about marriage and love.'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.co_invitation_message).toEqual('We are delighted to invite you to our special day.');
    expect(result.quran_verse).toEqual('Updated Quran verse about marriage and love.');
  });

  it('should handle nullable reception_maps_url', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      reception_maps_url: null
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.reception_maps_url).toBeNull();
  });

  it('should update only provided fields', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      bride_full_name: 'Updated Bride Name'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.bride_full_name).toEqual('Updated Bride Name');
    expect(result.groom_full_name).toEqual('Michael John S'); // Should remain unchanged
    expect(result.ceremony_location).toEqual('Grand Mosque, Jalan Raya No. 123, Jakarta'); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    await createInitialWeddingInfo();

    const updateInput: UpdateWeddingInfoInput = {
      bride_full_name: 'Database Test Bride',
      ceremony_location: 'Database Test Location'
    };

    const result = await updateWeddingInfo(updateInput);

    // Verify changes were saved to database
    const savedRecord = await db.select()
      .from(weddingInfoTable)
      .where(eq(weddingInfoTable.id, result.id))
      .execute();

    expect(savedRecord).toHaveLength(1);
    expect(savedRecord[0].bride_full_name).toEqual('Database Test Bride');
    expect(savedRecord[0].ceremony_location).toEqual('Database Test Location');
    expect(savedRecord[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    const initialRecord = await createInitialWeddingInfo();
    const originalUpdatedAt = initialRecord[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateWeddingInfoInput = {
      bride_nickname: 'Test Update'
    };

    const result = await updateWeddingInfo(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when wedding info record does not exist', async () => {
    // Don't create initial record

    const updateInput: UpdateWeddingInfoInput = {
      bride_full_name: 'Test Bride'
    };

    await expect(updateWeddingInfo(updateInput)).rejects.toThrow(/Wedding information record not found/i);
  });
});