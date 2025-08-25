import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type WeddingPhoto } from '../schema';
import { eq } from 'drizzle-orm';

export async function getMainWeddingPhoto(): Promise<WeddingPhoto | null> {
  try {
    // Query for the main wedding photo (is_main_photo = true)
    const result = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.is_main_photo, true))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Return the first (and should be only) main photo
    return result[0];
  } catch (error) {
    console.error('Failed to fetch main wedding photo:', error);
    throw error;
  }
}