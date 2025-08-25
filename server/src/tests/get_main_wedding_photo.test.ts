import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { getMainWeddingPhoto } from '../handlers/get_main_wedding_photo';
import { eq } from 'drizzle-orm';

describe('getMainWeddingPhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no photos exist', async () => {
    const result = await getMainWeddingPhoto();
    expect(result).toBeNull();
  });

  it('should return null when no main photo exists', async () => {
    // Create a non-main photo
    await db.insert(weddingPhotosTable).values({
      url: 'https://example.com/photo1.jpg',
      alt_text: 'Regular photo',
      is_main_photo: false,
      gallery_order: 1
    }).execute();

    const result = await getMainWeddingPhoto();
    expect(result).toBeNull();
  });

  it('should return the main wedding photo when it exists', async () => {
    // Create a main photo
    const insertResult = await db.insert(weddingPhotosTable).values({
      url: 'https://example.com/main-photo.jpg',
      alt_text: 'Beautiful main wedding photo',
      is_main_photo: true,
      gallery_order: null
    }).returning().execute();

    const result = await getMainWeddingPhoto();

    expect(result).toBeDefined();
    expect(result!.id).toEqual(insertResult[0].id);
    expect(result!.url).toEqual('https://example.com/main-photo.jpg');
    expect(result!.alt_text).toEqual('Beautiful main wedding photo');
    expect(result!.is_main_photo).toBe(true);
    expect(result!.gallery_order).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return only one main photo when multiple main photos exist', async () => {
    // Create multiple main photos (edge case scenario)
    await db.insert(weddingPhotosTable).values([
      {
        url: 'https://example.com/main-photo1.jpg',
        alt_text: 'First main photo',
        is_main_photo: true,
        gallery_order: 1
      },
      {
        url: 'https://example.com/main-photo2.jpg',
        alt_text: 'Second main photo',
        is_main_photo: true,
        gallery_order: 2
      }
    ]).execute();

    const result = await getMainWeddingPhoto();

    expect(result).toBeDefined();
    expect(result!.is_main_photo).toBe(true);
    
    // Verify only one photo is returned even though multiple main photos exist
    expect(typeof result!.id).toBe('number');
    expect(result!.url).toMatch(/^https:\/\/example\.com\/main-photo\d\.jpg$/);
  });

  it('should return main photo among mixed photos', async () => {
    // Create multiple photos with only one being main
    await db.insert(weddingPhotosTable).values([
      {
        url: 'https://example.com/photo1.jpg',
        alt_text: 'Regular photo 1',
        is_main_photo: false,
        gallery_order: 1
      },
      {
        url: 'https://example.com/main-photo.jpg',
        alt_text: 'The main photo',
        is_main_photo: true,
        gallery_order: null
      },
      {
        url: 'https://example.com/photo2.jpg',
        alt_text: 'Regular photo 2',
        is_main_photo: false,
        gallery_order: 2
      }
    ]).execute();

    const result = await getMainWeddingPhoto();

    expect(result).toBeDefined();
    expect(result!.url).toEqual('https://example.com/main-photo.jpg');
    expect(result!.alt_text).toEqual('The main photo');
    expect(result!.is_main_photo).toBe(true);
  });

  it('should verify database state after fetching main photo', async () => {
    // Create test data
    const insertResult = await db.insert(weddingPhotosTable).values({
      url: 'https://example.com/verification-photo.jpg',
      alt_text: 'Verification photo',
      is_main_photo: true,
      gallery_order: 5
    }).returning().execute();

    // Call the handler
    const result = await getMainWeddingPhoto();

    // Verify the photo still exists in database unchanged
    const dbPhotos = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.id, insertResult[0].id))
      .execute();

    expect(dbPhotos).toHaveLength(1);
    expect(dbPhotos[0].url).toEqual('https://example.com/verification-photo.jpg');
    expect(dbPhotos[0].is_main_photo).toBe(true);
    expect(dbPhotos[0].gallery_order).toEqual(5);
    
    // Verify handler result matches database
    expect(result).toEqual(dbPhotos[0]);
  });
});