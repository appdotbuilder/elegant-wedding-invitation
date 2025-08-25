import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type CreateWeddingPhotoInput, type WeddingPhoto } from '../schema';

export const createWeddingPhoto = async (input: CreateWeddingPhotoInput): Promise<WeddingPhoto> => {
  try {
    // Insert wedding photo record
    const result = await db.insert(weddingPhotosTable)
      .values({
        url: input.url,
        alt_text: input.alt_text,
        is_main_photo: input.is_main_photo,
        gallery_order: input.gallery_order
      })
      .returning()
      .execute();

    // Return the created wedding photo
    const weddingPhoto = result[0];
    return weddingPhoto;
  } catch (error) {
    console.error('Wedding photo creation failed:', error);
    throw error;
  }
};