import fs from 'node:fs';
import zlib from 'node:zlib';

function createMonochromePng(width, height) {
  // Uncompressed raw scanlines: each row starts with filter byte 0, followed by RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.32;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let isWhite = false;
      // Outer ring
      if (Math.abs(dist - radius) <= 3) isWhite = true;
      // Inner ring
      if (Math.abs(dist - innerRadius) <= 2) isWhite = true;
      // Center dot
      if (dist <= width * 0.04) isWhite = true;
      // Triangle geometry
      // Vertex A: (cx, cy - radius*0.7), Vertex B: (cx + radius*0.6, cy + radius*0.5), Vertex C: (cx - radius*0.6, cy + radius*0.5)
      const ax = cx, ay = cy - radius * 0.7;
      const bx = cx + radius * 0.6, by = cy + radius * 0.5;
      const c_x = cx - radius * 0.6, c_y = cy + radius * 0.5;

      // Check distance to triangle edges
      function distToSegment(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
      }

      if (distToSegment(x, y, ax, ay, bx, by) <= 2.5 ||
          distToSegment(x, y, bx, by, c_x, c_y) <= 2.5 ||
          distToSegment(x, y, c_x, c_y, ax, ay) <= 2.5) {
        isWhite = true;
      }

      if (isWhite) {
        rawData[pxOffset] = 255;     // R
        rawData[pxOffset + 1] = 255; // G
        rawData[pxOffset + 2] = 255; // B
        rawData[pxOffset + 3] = 255; // Alpha
      } else {
        rawData[pxOffset] = 0;       // R
        rawData[pxOffset + 1] = 0;   // G
        rawData[pxOffset + 2] = 0;   // B
        rawData[pxOffset + 3] = 255; // Alpha
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // CRC32 table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/icon-192.png', createMonochromePng(192, 192));
fs.writeFileSync('public/icon-512.png', createMonochromePng(512, 512));
console.log('Generated monochrome icons successfully.');
