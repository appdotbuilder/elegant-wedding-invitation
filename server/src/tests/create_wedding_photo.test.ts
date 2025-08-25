import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type CreateWeddingPhotoInput } from '../schema';
import { createWeddingPhoto } from '../handlers/create_wedding_photo';
import { eq } from 'drizzle-orm';

// Test input for a main gallery photo
const testMainPhotoInput: CreateWeddingPhotoInput = {
  url: 'https://example.com/wedding-main.jpg',
  alt_text: 'Beautiful wedding ceremony photo',
  is_main_photo: true,
  gallery_order: 1
};

// Test input for a regular gallery photo
const testRegularPhotoInput: CreateWeddingPhotoInput = {
  url: 'https://example.com/wedding-gallery-2.jpg',
  alt_text: 'Reception dance floor',
  is_main_photo: false,
  gallery_order: 2
};

// Test input with minimal fields (using defaults and nullables)
const testMinimalInput: CreateWeddingPhotoInput = {
  url: 'https://example.com/wedding-minimal.jpg',
  alt_text: null,
  is_main_photo: false, // Zod default
  gallery_order: null
};

describe('createWeddingPhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a main wedding photo with all fields', async () => {
    const result = await createWeddingPhoto(testMainPhotoInput);

    // Basic field validation
    expect(result.url).toEqual('https://example.com/wedding-main.jpg');
    expect(result.alt_text).toEqual('Beautiful wedding ceremony photo');
    expect(result.is_main_photo).toBe(true);
    expect(result.gallery_order).toBe(1);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a regular gallery photo', async () => {
    const result = await createWeddingPhoto(testRegularPhotoInput);

    expect(result.url).toEqual('https://example.com/wedding-gallery-2.jpg');
    expect(result.alt_text).toEqual('Reception dance floor');
    expect(result.is_main_photo).toBe(false);
    expect(result.gallery_order).toBe(2);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create photo with minimal fields (null values)', async () => {
    const result = await createWeddingPhoto(testMinimalInput);

    expect(result.url).toEqual('https://example.com/wedding-minimal.jpg');
    expect(result.alt_text).toBe(null);
    expect(result.is_main_photo).toBe(false);
    expect(result.gallery_order).toBe(null);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save wedding photo to database', async () => {
    const result = await createWeddingPhoto(testMainPhotoInput);

    // Query using proper drizzle syntax
    const photos = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.id, result.id))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].url).toEqual('https://example.com/wedding-main.jpg');
    expect(photos[0].alt_text).toEqual('Beautiful wedding ceremony photo');
    expect(photos[0].is_main_photo).toBe(true);
    expect(photos[0].gallery_order).toBe(1);
    expect(photos[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple photos with different gallery orders', async () => {
    // Create multiple photos
    const photo1 = await createWeddingPhoto(testMainPhotoInput);
    const photo2 = await createWeddingPhoto(testRegularPhotoInput);
    const photo3 = await createWeddingPhoto({
      url: 'https://example.com/wedding-gallery-3.jpg',
      alt_text: 'Cake cutting ceremony',
      is_main_photo: false,
      gallery_order: 3
    });

    // Verify all photos exist with correct orders
    const allPhotos = await db.select()
      .from(weddingPhotosTable)
      .execute();

    expect(allPhotos).toHaveLength(3);

    // Find each photo by URL and verify properties
    const mainPhoto = allPhotos.find(p => p.url === testMainPhotoInput.url);
    const regularPhoto = allPhotos.find(p => p.url === testRegularPhotoInput.url);
    const thirdPhoto = allPhotos.find(p => p.url === 'https://example.com/wedding-gallery-3.jpg');

    expect(mainPhoto?.is_main_photo).toBe(true);
    expect(mainPhoto?.gallery_order).toBe(1);

    expect(regularPhoto?.is_main_photo).toBe(false);
    expect(regularPhoto?.gallery_order).toBe(2);

    expect(thirdPhoto?.is_main_photo).toBe(false);
    expect(thirdPhoto?.gallery_order).toBe(3);
  });

  it('should allow multiple main photos if needed', async () => {
    // Create two main photos
    const mainPhoto1 = await createWeddingPhoto({
      url: 'https://example.com/main1.jpg',
      alt_text: 'First main photo',
      is_main_photo: true,
      gallery_order: 1
    });

    const mainPhoto2 = await createWeddingPhoto({
      url: 'https://example.com/main2.jpg',
      alt_text: 'Second main photo',
      is_main_photo: true,
      gallery_order: 2
    });

    // Both should be created successfully
    expect(mainPhoto1.is_main_photo).toBe(true);
    expect(mainPhoto2.is_main_photo).toBe(true);

    // Verify both exist in database
    const mainPhotos = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.is_main_photo, true))
      .execute();

    expect(mainPhotos).toHaveLength(2);
  });

  it('should handle photos without gallery order (null value)', async () => {
    const photoWithoutOrder = await createWeddingPhoto({
      url: 'https://example.com/unordered.jpg',
      alt_text: 'Photo without specific order',
      is_main_photo: false,
      gallery_order: null
    });

    expect(photoWithoutOrder.gallery_order).toBe(null);

    // Verify in database
    const savedPhoto = await db.select()
      .from(weddingPhotosTable)
      .where(eq(weddingPhotosTable.id, photoWithoutOrder.id))
      .execute();

    expect(savedPhoto[0].gallery_order).toBe(null);
  });
});