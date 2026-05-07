// 生成 TabBar 占位图标（81x81 PNG）
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const OUT = path.join(__dirname, 'src/static/tab');

// 创建纯色圆形图标
function drawIcon(colorHex) {
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  const cx = SIZE / 2, cy = SIZE / 2, radius = SIZE * 0.38;

  // 原始像素数据（每行前加 filter byte = 0）
  const rawRows = [];
  for (let y = 0; y < SIZE; y++) {
    const row = [0]; // filter: none
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      const inside = Math.sqrt(dx * dx + dy * dy) <= radius;
      row.push(inside ? r : 0, inside ? g : 0, inside ? b : 0);
    }
    rawRows.push(Buffer.from(row));
  }
  return Buffer.concat(rawRows);
}

// 绘制带形状的图标（圆形 + 中间简单形状）
function drawShapeIcon(colorHex, shape) {
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  const bg = 0; // 透明背景

  const rawRows = [];
  for (let y = 0; y < SIZE; y++) {
    const row = [0];
    for (let x = 0; x < SIZE; x++) {
      let fill = false;
      const cx = SIZE / 2, cy = SIZE / 2;

      if (shape === 'home') {
        // 房子形状：三角形屋顶 + 矩形主体
        const roofY = SIZE * 0.38;
        const bodyTop = roofY;
        const bodyBottom = SIZE * 0.78;
        const bodyLeft = SIZE * 0.22;
        const bodyRight = SIZE * 0.78;
        const doorLeft = SIZE * 0.38;
        const doorRight = SIZE * 0.62;
        const doorTop = SIZE * 0.52;
        // 屋顶三角形
        if (y <= roofY) {
          const roofWidth = (roofY - y) / roofY * (SIZE * 0.45);
          fill = x >= cx - roofWidth && x <= cx + roofWidth;
        }
        // 主体
        if (y >= bodyTop && y <= bodyBottom && x >= bodyLeft && x <= bodyRight) {
          fill = true;
        }
        // 门（镂空）
        if (y >= doorTop && y <= bodyBottom && x >= doorLeft && x <= doorRight) {
          fill = false;
        }
      } else if (shape === 'order') {
        // 列表形状：三条横线
        const lineH = SIZE * 0.06;
        const lineW = SIZE * 0.5;
        const left = SIZE * 0.25;
        const lines = [SIZE * 0.28, SIZE * 0.48, SIZE * 0.68];
        fill = lines.some(ly => y >= ly - lineH && y <= ly + lineH && x >= left && x <= left + lineW);
      } else if (shape === 'message') {
        // 聊天气泡
        const bubbleCX = SIZE * 0.48, bubbleCY = SIZE * 0.44;
        const bubbleR = SIZE * 0.35;
        const dx = x - bubbleCX, dy = y - bubbleCY;
        fill = Math.sqrt(dx * dx + dy * dy) <= bubbleR;
        // 小尾巴
        if (!fill) {
          const tailCX = SIZE * 0.42, tailCY = SIZE * 0.74, tailR = SIZE * 0.1;
          const tdx = x - tailCX, tdy = y - tailCY;
          fill = Math.sqrt(tdx * tdx + tdy * tdy) <= tailR;
        }
      } else if (shape === 'user') {
        // 人形：头（圆）+ 身体（半圆）
        const headCY = SIZE * 0.32, headR = SIZE * 0.18;
        const hdx = x - cx, hdy = y - headCY;
        fill = Math.sqrt(hdx * hdx + hdy * hdy) <= headR;
        if (!fill) {
          // 身体弧形
          const bodyCX = cx, bodyCY = SIZE * 0.45;
          const bodyRX = SIZE * 0.28, bodyRY = SIZE * 0.30;
          const bdx = (x - bodyCX) / bodyRX, bdy = (y - bodyCY) / bodyRY;
          fill = (bdx * bdx + bdy * bdy) <= 1.0 && y >= bodyCY;
        }
      }

      row.push(fill ? r : bg, fill ? g : bg, fill ? b : bg);
    }
    rawRows.push(Buffer.from(row));
  }
  return Buffer.concat(rawRows);
}

// 构建 PNG 文件
function buildPNG(pixelData, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG signature

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(pixelData);
  const idat = createChunk('IDAT', compressed);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeB, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeB, data, crcBuf]);
}

// CRC32
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 生成图标
const icons = [
  { name: 'home', shape: 'home' },
  { name: 'order', shape: 'order' },
  { name: 'message', shape: 'message' },
  { name: 'user', shape: 'user' },
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

icons.forEach(({ name, shape }) => {
  const normal = drawShapeIcon('#999999', shape);
  fs.writeFileSync(path.join(OUT, `${name}.png`), buildPNG(normal, SIZE, SIZE));

  const active = drawShapeIcon('#409EFF', shape);
  fs.writeFileSync(path.join(OUT, `${name}-active.png`), buildPNG(active, SIZE, SIZE));

  console.log(`✓ ${name}.png / ${name}-active.png`);
});

console.log('Done!');
