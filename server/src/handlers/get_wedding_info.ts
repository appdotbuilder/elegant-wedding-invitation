import { db } from '../db';
import { weddingInfoTable } from '../db/schema';
import { type WeddingInfo } from '../schema';

export const getWeddingInfo = async (): Promise<WeddingInfo | null> => {
  try {
    // Get the first (and typically only) wedding info record
    const results = await db.select()
      .from(weddingInfoTable)
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const weddingInfo = results[0];
    return weddingInfo;
  } catch (error) {
    console.error('Failed to fetch wedding information:', error);
    throw error;
  }
};