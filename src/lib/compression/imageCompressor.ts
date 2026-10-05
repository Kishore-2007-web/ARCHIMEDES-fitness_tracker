/**
 * Client-side image compression & EXIF stripping for OPPO A54 optimization.
 * Renders into an off-screen HTML5 Canvas which automatically strips all EXIF metadata,
 * resizes to optimal mobile resolution, and compresses into modern WebP format.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

export async function compressAndStripExif(
  file: File,
  options: CompressionOptions = {}
): Promise<{ blob: Blob; dataUrl: string; sizeBytes: number }> {
  const { maxWidth = 1080, maxHeight = 1440, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file.'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while bounding within maxWidth / maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to obtain canvas 2D rendering context.'));
          return;
        }

        // Draw image directly onto canvas - this inherently discards all EXIF metadata
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob conversion failed.'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/webp', quality);
            resolve({
              blob,
              dataUrl,
              sizeBytes: blob.size
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
