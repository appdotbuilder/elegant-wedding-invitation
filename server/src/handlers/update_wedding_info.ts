import { db } from '../db';
import { weddingInfoTable } from '../db/schema';
import { type UpdateWeddingInfoInput, type WeddingInfo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWeddingInfo = async (input: UpdateWeddingInfoInput): Promise<WeddingInfo> => {
  try {
    // First check if wedding info record exists (assuming id = 1 for single record)
    const existingRecord = await db.select()
      .from(weddingInfoTable)
      .where(eq(weddingInfoTable.id, 1))
      .execute();

    if (existingRecord.length === 0) {
      throw new Error('Wedding information record not found');
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (input.bride_full_name !== undefined) updateData['bride_full_name'] = input.bride_full_name;
    if (input.bride_nickname !== undefined) updateData['bride_nickname'] = input.bride_nickname;
    if (input.bride_father !== undefined) updateData['bride_father'] = input.bride_father;
    if (input.bride_mother !== undefined) updateData['bride_mother'] = input.bride_mother;
    if (input.groom_full_name !== undefined) updateData['groom_full_name'] = input.groom_full_name;
    if (input.groom_nickname !== undefined) updateData['groom_nickname'] = input.groom_nickname;
    if (input.groom_father !== undefined) updateData['groom_father'] = input.groom_father;
    if (input.groom_mother !== undefined) updateData['groom_mother'] = input.groom_mother;
    if (input.ceremony_date !== undefined) updateData['ceremony_date'] = input.ceremony_date;
    if (input.ceremony_time_start !== undefined) updateData['ceremony_time_start'] = input.ceremony_time_start;
    if (input.ceremony_time_end !== undefined) updateData['ceremony_time_end'] = input.ceremony_time_end;
    if (input.ceremony_location !== undefined) updateData['ceremony_location'] = input.ceremony_location;
    if (input.reception_date !== undefined) updateData['reception_date'] = input.reception_date;
    if (input.reception_time_start !== undefined) updateData['reception_time_start'] = input.reception_time_start;
    if (input.reception_time_end !== undefined) updateData['reception_time_end'] = input.reception_time_end;
    if (input.reception_location !== undefined) updateData['reception_location'] = input.reception_location;
    if (input.reception_maps_url !== undefined) updateData['reception_maps_url'] = input.reception_maps_url;
    if (input.bank_name !== undefined) updateData['bank_name'] = input.bank_name;
    if (input.account_holder !== undefined) updateData['account_holder'] = input.account_holder;
    if (input.account_number !== undefined) updateData['account_number'] = input.account_number;
    if (input.rsvp_message !== undefined) updateData['rsvp_message'] = input.rsvp_message;
    if (input.rsvp_deadline !== undefined) updateData['rsvp_deadline'] = input.rsvp_deadline;
    if (input.co_invitation_message !== undefined) updateData['co_invitation_message'] = input.co_invitation_message;
    if (input.quran_verse !== undefined) updateData['quran_verse'] = input.quran_verse;

    // Always update the updated_at timestamp
    updateData['updated_at'] = new Date();

    // Update the wedding info record
    const result = await db.update(weddingInfoTable)
      .set(updateData)
      .where(eq(weddingInfoTable.id, 1))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Wedding info update failed:', error);
    throw error;
  }
};