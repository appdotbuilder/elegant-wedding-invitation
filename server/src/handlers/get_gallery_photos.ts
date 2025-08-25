import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type WeddingPhoto } from '../schema';
import { eq, asc, isNull, or } from 'drizzle-orm';

export const getGalleryPhotos = async (): Promise<WeddingPhoto[]> => {
  try {
    // Fetch all gallery photos (is_main_photo = false)
    // Order by gallery_order (nulls last), then by created_at
    const results = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.is_main_photo, false))
      .orderBy(
        asc(weddingPhotosTable.gallery_order),
        asc(weddingPhotosTable.created_at)
      )
      .execute();

    return results;
  } catch (error) {
    console.error('Gallery photos retrieval failed:', error);
    throw error;
  }
};