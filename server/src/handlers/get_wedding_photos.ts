import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type WeddingPhoto } from '../schema';
import { desc, asc } from 'drizzle-orm';

export const getWeddingPhotos = async (): Promise<WeddingPhoto[]> => {
  try {
    // Fetch all wedding photos ordered by:
    // 1. Main photo first (is_main_photo DESC)
    // 2. Gallery photos by gallery_order (ASC, nulls last)
    // 3. Created date as fallback (DESC for newest first)
    const results = await db.select()
      .from(weddingPhotosTable)
      .orderBy(
        desc(weddingPhotosTable.is_main_photo),
        asc(weddingPhotosTable.gallery_order),
        desc(weddingPhotosTable.created_at)
      )
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch wedding photos:', error);
    throw error;
  }
};