import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weddingPhotosTable } from '../db/schema';
import { type CreateWeddingPhotoInput } from '../schema';
import { getGalleryPhotos } from '../handlers/get_gallery_photos';

// Test photo inputs
const mainPhotoInput: CreateWeddingPhotoInput = {
  url: 'https://example.com/main-photo.jpg',
  alt_text: 'Main wedding photo',
  is_main_photo: true,
  gallery_order: null
};

const galleryPhoto1Input: CreateWeddingPhotoInput = {
  url: 'https://example.com/gallery-1.jpg',
  alt_text: 'Gallery photo 1',
  is_main_photo: false,
  gallery_order: 1
};

const galleryPhoto2Input: CreateWeddingPhotoInput = {
  url: 'https://example.com/gallery-2.jpg',
  alt_text: 'Gallery photo 2',
  is_main_photo: false,
  gallery_order: 2
};

const galleryPhoto3Input: CreateWeddingPhotoInput = {
  url: 'https://example.com/gallery-3.jpg',
  alt_text: 'Gallery photo 3',
  is_main_photo: false,
  gallery_order: null // No specific order
};

describe('getGalleryPhotos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no gallery photos exist', async () => {
    const result = await getGalleryPhotos();
    expect(result).toEqual([]);
  });

  it('should only return gallery photos (excluding main photos)', async () => {
    // Create both main photo and gallery photos
    await db.insert(weddingPhotosTable)
      .values([
        {
          url: mainPhotoInput.url,
          alt_text: mainPhotoInput.alt_text,
          is_main_photo: mainPhotoInput.is_main_photo,
          gallery_order: mainPhotoInput.gallery_order
        },
        {
          url: galleryPhoto1Input.url,
          alt_text: galleryPhoto1Input.alt_text,
          is_main_photo: galleryPhoto1Input.is_main_photo,
          gallery_order: galleryPhoto1Input.gallery_order
        }
      ])
      .execute();

    const result = await getGalleryPhotos();

    expect(result).toHaveLength(1);
    expect(result[0].url).toEqual(galleryPhoto1Input.url);
    expect(result[0].is_main_photo).toBe(false);
    expect(result[0].gallery_order).toBe(1);
  });

  it('should return gallery photos ordered by gallery_order', async () => {
    // Create gallery photos with different orders
    await db.insert(weddingPhotosTable)
      .values([
        {
          url: galleryPhoto2Input.url,
          alt_text: galleryPhoto2Input.alt_text,
          is_main_photo: galleryPhoto2Input.is_main_photo,
          gallery_order: galleryPhoto2Input.gallery_order // order: 2
        },
        {
          url: galleryPhoto1Input.url,
          alt_text: galleryPhoto1Input.alt_text,
          is_main_photo: galleryPhoto1Input.is_main_photo,
          gallery_order: galleryPhoto1Input.gallery_order // order: 1
        }
      ])
      .execute();

    const result = await getGalleryPhotos();

    expect(result).toHaveLength(2);
    // Should be ordered by gallery_order ascending
    expect(result[0].gallery_order).toBe(1);
    expect(result[0].url).toEqual(galleryPhoto1Input.url);
    expect(result[1].gallery_order).toBe(2);
    expect(result[1].url).toEqual(galleryPhoto2Input.url);
  });

  it('should handle photos with null gallery_order', async () => {
    // Create mix of photos with and without gallery_order
    await db.insert(weddingPhotosTable)
      .values([
        {
          url: galleryPhoto3Input.url,
          alt_text: galleryPhoto3Input.alt_text,
          is_main_photo: galleryPhoto3Input.is_main_photo,
          gallery_order: galleryPhoto3Input.gallery_order // null
        },
        {
          url: galleryPhoto1Input.url,
          alt_text: galleryPhoto1Input.alt_text,
          is_main_photo: galleryPhoto1Input.is_main_photo,
          gallery_order: galleryPhoto1Input.gallery_order // order: 1
        }
      ])
      .execute();

    const result = await getGalleryPhotos();

    expect(result).toHaveLength(2);
    // Photos with order should come first, then null order ones
    expect(result[0].gallery_order).toBe(1);
    expect(result[1].gallery_order).toBeNull();
  });

  it('should include all gallery photo fields', async () => {
    await db.insert(weddingPhotosTable)
      .values({
        url: galleryPhoto1Input.url,
        alt_text: galleryPhoto1Input.alt_text,
        is_main_photo: galleryPhoto1Input.is_main_photo,
        gallery_order: galleryPhoto1Input.gallery_order
      })
      .execute();

    const result = await getGalleryPhotos();

    expect(result).toHaveLength(1);
    const photo = result[0];
    
    expect(photo.id).toBeDefined();
    expect(photo.url).toEqual(galleryPhoto1Input.url);
    expect(photo.alt_text).toEqual(galleryPhoto1Input.alt_text);
    expect(photo.is_main_photo).toBe(false);
    expect(photo.gallery_order).toBe(1);
    expect(photo.created_at).toBeInstanceOf(Date);
  });

  it('should order by created_at when gallery_order is same', async () => {
    // Create photos with same gallery_order but different creation times
    const firstPhoto = await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/first.jpg',
        alt_text: 'First photo',
        is_main_photo: false,
        gallery_order: 1
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondPhoto = await db.insert(weddingPhotosTable)
      .values({
        url: 'https://example.com/second.jpg',
        alt_text: 'Second photo',
        is_main_photo: false,
        gallery_order: 1
      })
      .returning()
      .execute();

    const result = await getGalleryPhotos();

    expect(result).toHaveLength(2);
    // Should be ordered by created_at when gallery_order is same
    expect(result[0].created_at <= result[1].created_at).toBe(true);
    expect(result[0].url).toEqual('https://example.com/first.jpg');
    expect(result[1].url).toEqual('https://example.com/second.jpg');
  });
});