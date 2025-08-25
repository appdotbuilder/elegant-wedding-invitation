import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type CreateWeddingPhotoInput } from '../schema';
import { getWeddingPhotos } from '../handlers/get_wedding_photos';

describe('getWeddingPhotos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no photos exist', async () => {
    const result = await getWeddingPhotos();
    expect(result).toEqual([]);
  });

  it('should return single photo', async () => {
    // Create a test photo
    const testPhoto: CreateWeddingPhotoInput = {
      url: 'https://example.com/photo1.jpg',
      alt_text: 'Beautiful wedding photo',
      is_main_photo: false,
      gallery_order: null
    };

    await db.insert(weddingPhotosTable)
      .values({
        url: testPhoto.url,
        alt_text: testPhoto.alt_text,
        is_main_photo: testPhoto.is_main_photo,
        gallery_order: testPhoto.gallery_order
      })
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(1);
    expect(result[0].url).toEqual('https://example.com/photo1.jpg');
    expect(result[0].alt_text).toEqual('Beautiful wedding photo');
    expect(result[0].is_main_photo).toBe(false);
    expect(result[0].gallery_order).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return photos ordered by main photo first', async () => {
    // Create gallery photo
    await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/gallery1.jpg',
        alt_text: 'Gallery photo',
        is_main_photo: false,
        gallery_order: 1
      })
      .execute();

    // Create main photo
    await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/main.jpg',
        alt_text: 'Main wedding photo',
        is_main_photo: true,
        gallery_order: null
      })
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(2);
    // Main photo should be first
    expect(result[0].is_main_photo).toBe(true);
    expect(result[0].url).toEqual('https://example.com/main.jpg');
    // Gallery photo should be second
    expect(result[1].is_main_photo).toBe(false);
    expect(result[1].url).toEqual('https://example.com/gallery1.jpg');
  });

  it('should return gallery photos ordered by gallery_order', async () => {
    // Create photos with different gallery orders
    await db.insert(weddingPhotosTable)
      .values([
        {
          url: 'https://example.com/gallery3.jpg',
          alt_text: 'Gallery photo 3',
          is_main_photo: false,
          gallery_order: 3
        },
        {
          url: 'https://example.com/gallery1.jpg',
          alt_text: 'Gallery photo 1',
          is_main_photo: false,
          gallery_order: 1
        },
        {
          url: 'https://example.com/gallery2.jpg',
          alt_text: 'Gallery photo 2',
          is_main_photo: false,
          gallery_order: 2
        }
      ])
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(3);
    // Should be ordered by gallery_order ascending
    expect(result[0].gallery_order).toBe(1);
    expect(result[0].url).toEqual('https://example.com/gallery1.jpg');
    expect(result[1].gallery_order).toBe(2);
    expect(result[1].url).toEqual('https://example.com/gallery2.jpg');
    expect(result[2].gallery_order).toBe(3);
    expect(result[2].url).toEqual('https://example.com/gallery3.jpg');
  });

  it('should handle complex ordering with main photo and gallery photos', async () => {
    // Create a mix of photos to test complete ordering logic
    await db.insert(weddingPhotosTable)
      .values([
        {
          url: 'https://example.com/gallery2.jpg',
          alt_text: 'Gallery photo 2',
          is_main_photo: false,
          gallery_order: 2
        },
        {
          url: 'https://example.com/main.jpg',
          alt_text: 'Main photo',
          is_main_photo: true,
          gallery_order: null
        },
        {
          url: 'https://example.com/no-order.jpg',
          alt_text: 'No order photo',
          is_main_photo: false,
          gallery_order: null
        },
        {
          url: 'https://example.com/gallery1.jpg',
          alt_text: 'Gallery photo 1',
          is_main_photo: false,
          gallery_order: 1
        }
      ])
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(4);
    
    // First should be main photo
    expect(result[0].is_main_photo).toBe(true);
    expect(result[0].url).toEqual('https://example.com/main.jpg');
    
    // Next should be gallery photos in order
    expect(result[1].gallery_order).toBe(1);
    expect(result[1].url).toEqual('https://example.com/gallery1.jpg');
    expect(result[2].gallery_order).toBe(2);
    expect(result[2].url).toEqual('https://example.com/gallery2.jpg');
    
    // Last should be photo without gallery_order
    expect(result[3].gallery_order).toBeNull();
    expect(result[3].url).toEqual('https://example.com/no-order.jpg');
  });

  it('should handle photos with null alt_text', async () => {
    await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/photo.jpg',
        alt_text: null,
        is_main_photo: false,
        gallery_order: 1
      })
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(1);
    expect(result[0].alt_text).toBeNull();
    expect(result[0].url).toEqual('https://example.com/photo.jpg');
  });

  it('should return all photo properties correctly', async () => {
    await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/test.jpg',
        alt_text: 'Test photo',
        is_main_photo: true,
        gallery_order: 5
      })
      .execute();

    const result = await getWeddingPhotos();

    expect(result).toHaveLength(1);
    const photo = result[0];
    
    // Verify all required fields are present and correct types
    expect(typeof photo.id).toBe('number');
    expect(typeof photo.url).toBe('string');
    expect(typeof photo.alt_text).toBe('string');
    expect(typeof photo.is_main_photo).toBe('boolean');
    expect(typeof photo.gallery_order).toBe('number');
    expect(photo.created_at).toBeInstanceOf(Date);
    
    // Verify specific values
    expect(photo.url).toEqual('https://example.com/test.jpg');
    expect(photo.alt_text).toEqual('Test photo');
    expect(photo.is_main_photo).toBe(true);
    expect(photo.gallery_order).toBe(5);
  });
});