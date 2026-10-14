const prisma = require('../prisma');
const { v2: cloudinary } = require('cloudinary');
const { randomUUID } = require('node:crypto');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');

const coverDirectory = path.join(__dirname, '../../uploads/book-covers');
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const hasCloudinaryCredentials =
  Boolean(cloudinaryUrl) ||
  Boolean(
    process.env.CLOUD_NAME &&
      process.env.CLOUD_API_KEY &&
      process.env.CLOUD_API_SECRET,
  );

if (!cloudinaryUrl && hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
}

const getImageExtension = (contentType, buffer) => {
  if (
    contentType === 'image/jpeg' &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg';
  }

  if (
    contentType === 'image/png' &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }

  if (
    contentType === 'image/webp' &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
};

const uploadCover = async (req, res, next) => {
  try {
    if (!req.body?.length) {
      return res.status(400).json({ success: false, error: 'Rasm fayli yuborilmadi' });
    }

    const contentType = req.headers['content-type'];
    const extension = getImageExtension(contentType, req.body);
    if (!extension) {
      return res.status(400).json({
        success: false,
        error: 'Yuborilgan fayl haqiqiy JPG, PNG yoki WebP rasm emas',
      });
    }

    if (hasCloudinaryCredentials) {
      try {
        const dataUri = `data:${contentType};base64,${req.body.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'bookwork/covers',
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'webp'],
        });

        return res.status(201).json({
          success: true,
          data: { imageUrl: result.secure_url },
        });
      } catch (error) {
        console.error('Cloudinary upload failed; saving the cover locally:', error);
      }
    }

    const filename = `${randomUUID()}.${extension}`;
    await mkdir(coverDirectory, { recursive: true });
    await writeFile(path.join(coverDirectory, filename), req.body, { flag: 'wx' });

    res.status(201).json({
      success: true,
      data: {
        imageUrl: `${req.protocol}://${req.get('host')}/uploads/book-covers/${filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const items = await prisma.book.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid id' });
    }

    const item = await prisma.book.findFirst({
      where: { id, userId: req.userId },
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: "Kitob topilmadi" });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      pdfUrl,
      licenseConfirmed,
      isPublic,
      author,
      language,
      status,
      type,
      hooks,
      pages,
      rating,
      cost,
      maslahatBeraman,
    } = req.body;

    const item = await prisma.book.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        pdfUrl,
        licenseConfirmed,
        isPublic,
        author,
        language,
        status,
        type,
        hooks,
        pages,
        rating: rating ?? null,
        userId: req.userId,
        cost,
        maslahatBeraman,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid id' });
    }

    const existing = await prisma.book.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }

    const item = await prisma.book.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid id' });
    }

    const existing = await prisma.book.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Kitob topilmadi" });
    }

    await prisma.book.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadCover,
  getAll,
  getById,
  create,
  update,
  remove,
};