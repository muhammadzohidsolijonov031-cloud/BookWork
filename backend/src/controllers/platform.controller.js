const prisma = require("../prisma");

const ensureReaderProfile = async (userId) =>
  prisma.readerProfile.upsert({
    where: { userId },
    create: { userId, displayName: "Kitobxon" },
    update: {},
  });

const bookDetailsSelect = {
  id: true,
  title: true,
  author: true,
  description: true,
  imageUrl: true,
  pdfUrl: true,
  licenseConfirmed: true,
  language: true,
  status: true,
  rating: true,
  type: true,
  pages: true,
  viewCount: true,
  readCount: true,
  isPublic: true,
  createdAt: true,
  reviews: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      rating: true,
      createdAt: true,
      reader: { select: { displayName: true } },
    },
  },
  posts: {
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      kind: true,
      content: true,
      excerpt: true,
      location: true,
      createdAt: true,
      reader: { select: { displayName: true } },
    },
  },
  _count: { select: { reviews: true, posts: true } },
};

const loadBookDetails = async (id) =>
  prisma.book.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: bookDetailsSelect,
  });

const getPublicBook = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }

    const publishedBook = await prisma.book.findFirst({
      where: { id, isPublic: true },
      select: { id: true },
    });
    if (!publishedBook) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }

    const book = await loadBookDetails(id);

    res.json({ success: true, data: book });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }
    next(error);
  }
};

const getBookDetails = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }

    const accessible = await prisma.book.findFirst({
      where: { id, OR: [{ isPublic: true }, { userId: req.userId }] },
      select: { id: true },
    });
    if (!accessible) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }
    const book = await loadBookDetails(id);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const markBookRead = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }
    const result = await prisma.book.updateMany({
      where: {
        id,
        OR: [{ isPublic: true }, ...(req.userId ? [{ userId: req.userId }] : [])],
      },
      data: { readCount: { increment: 1 } },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }
    const book = await prisma.book.findUnique({ where: { id }, select: { readCount: true } });
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const createBookPost = async (req, res, next) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(bookId) || bookId < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, OR: [{ isPublic: true }, { userId: req.userId }] },
      select: { id: true },
    });
    if (!book) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }

    await ensureReaderProfile(req.userId);
    const post = await prisma.bookPost.create({
      data: { bookId, userId: req.userId, ...req.body },
      select: {
        id: true,
        kind: true,
        content: true,
        excerpt: true,
        location: true,
        createdAt: true,
        reader: { select: { displayName: true } },
      },
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const getGenres = async (req, res, next) => {
  try {
    const rows = await prisma.book.findMany({
      where: { type: { not: null }, isPublic: true },
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    });
    res.json({ success: true, data: rows.map(({ type }) => type).filter(Boolean) });
  } catch (error) {
    next(error);
  }
};

const getDiscoverBooks = async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        imageUrl: true,
        language: true,
        type: true,
        viewCount: true,
        _count: { select: { reviews: true } },
      },
    });
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const profile = await prisma.readerProfile.findUnique({
      where: { userId: req.userId },
      select: { genres: true },
    });
    const genres = profile?.genres || [];

    const books = await prisma.book.findMany({
      where: {
        isPublic: true,
        ...(genres.length ? { type: { in: genres } } : {}),
      },
      orderBy: [{ viewCount: "desc" }, { reviews: { _count: "desc" } }],
      take: 30,
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        imageUrl: true,
        language: true,
        status: true,
        rating: true,
        type: true,
        viewCount: true,
        _count: { select: { reviews: true } },
      },
    });
    res.json({ success: true, data: { genres, books } });
  } catch (error) {
    next(error);
  }
};

const shareBook = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }
    const result = await prisma.book.updateMany({
      where: { id, userId: req.userId },
      data: { isPublic: true },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }
    res.json({ success: true, data: { id, isPublic: true } });
  } catch (error) {
    next(error);
  }
};

const saveReview = async (req, res, next) => {
  try {
    const bookId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(bookId) || bookId < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri kitob ID" });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, OR: [{ isPublic: true }, { userId: req.userId }] },
      select: { id: true },
    });
    if (!book) {
      return res.status(404).json({ success: false, error: "Kitob topilmadi" });
    }

    await ensureReaderProfile(req.userId);
    const review = await prisma.bookReview.upsert({
      where: { bookId_userId: { bookId, userId: req.userId } },
      create: { bookId, userId: req.userId, ...req.body },
      update: req.body,
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        reader: { select: { displayName: true } },
      },
    });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const getReaderProfile = async (req, res, next) => {
  try {
    const profile = await prisma.readerProfile.findUnique({
      where: { userId: req.userId },
    });
    res.json({
      success: true,
      data: profile || {
        userId: req.userId,
        displayName: "Kitobxon",
        bio: "",
        genres: [],
        openToPartners: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

const saveReaderProfile = async (req, res, next) => {
  try {
    const profile = await prisma.readerProfile.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, ...req.body },
      update: req.body,
    });
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const getReadingPartners = async (req, res, next) => {
  try {
    const interests = await prisma.partnerInterest.findMany({
      where: { userId: { not: req.userId } },
      select: {
        userId: true,
        book: { select: { title: true, author: true, imageUrl: true } },
        reader: { select: { displayName: true, bio: true, genres: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const uniqueInterests = new Map();
    interests.forEach((interest) => {
      uniqueInterests.set(
        `${interest.userId}:${interest.book.title.trim().toLocaleLowerCase()}`,
        interest,
      );
    });
    res.json({ success: true, data: [...uniqueInterests.values()] });
  } catch (error) {
    next(error);
  }
};

const getMyPartnerInterests = async (req, res, next) => {
  try {
    const interests = await prisma.partnerInterest.findMany({
      where: { userId: req.userId },
      select: { bookId: true },
    });
    res.json({ success: true, data: interests.map(({ bookId }) => bookId) });
  } catch (error) {
    next(error);
  }
};

const setPartnerInterest = async (req, res, next) => {
  try {
    const { bookId, enabled } = req.body;
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: req.userId },
      select: { id: true },
    });
    if (!book) return res.status(404).json({ success: false, error: "Kitob topilmadi" });

    if (enabled) {
      await ensureReaderProfile(req.userId);
      await prisma.partnerInterest.upsert({
        where: { userId_bookId: { userId: req.userId, bookId } },
        create: { userId: req.userId, bookId },
        update: {},
      });
    } else {
      await prisma.partnerInterest.deleteMany({
        where: { userId: req.userId, bookId },
      });
    }
    res.json({ success: true, data: { bookId, enabled } });
  } catch (error) {
    next(error);
  }
};

const createPartnerConnection = async (req, res, next) => {
  try {
    const { recipientId, bookId } = req.body;
    if (recipientId === req.userId) {
      return res.status(400).json({ success: false, error: "O'zingizga hamroh bo'la olmaysiz" });
    }
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: req.userId },
      select: { title: true },
    });
    if (!book) return res.status(404).json({ success: false, error: "Kitob topilmadi" });

    const matchingInterest = await prisma.partnerInterest.findFirst({
      where: {
        userId: recipientId,
        book: { title: { equals: book.title, mode: "insensitive" } },
      },
      select: { id: true },
    });
    if (!matchingInterest) {
      return res.status(404).json({ success: false, error: "Bu kitob uchun hamroh topilmadi" });
    }

    await ensureReaderProfile(req.userId);
    const [userA, userB] = [req.userId, recipientId].sort();
    const existing = await prisma.partnerConnection.findFirst({
      where: { userA, userB },
    });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const reader = await prisma.readerProfile.findUnique({
      where: { userId: req.userId },
      select: { displayName: true },
    });
    const connection = await prisma.$transaction(async (tx) => {
      const created = await tx.partnerConnection.create({
        data: { userA, userB, bookTitle: book.title },
      });
      await tx.notification.create({
        data: {
          userId: recipientId,
          type: "PARTNER_ADDED",
          message: `${reader?.displayName || "Kitobxon"} sizga “${book.title}” kitobi bo‘yicha hamroh bo‘ldi.`,
          data: { partnerId: req.userId, bookTitle: book.title },
        },
      });
      return created;
    });
    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await prisma.readingGroup.findMany({
      orderBy: [{ members: { _count: "desc" } }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        name: true,
        description: true,
        genre: true,
        ownerId: true,
        createdAt: true,
        _count: { select: { members: true } },
        members: {
          where: { userId: req.userId },
          select: { id: true },
        },
      },
    });
    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    await ensureReaderProfile(req.userId);
    const group = await prisma.readingGroup.create({
      data: {
        ...req.body,
        ownerId: req.userId,
        members: { create: { userId: req.userId } },
      },
      select: {
        id: true,
        name: true,
        description: true,
        genre: true,
        ownerId: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const groupId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(groupId) || groupId < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri guruh ID" });
    }
    const result = await prisma.readingGroup.updateMany({
      where: { id: groupId, ownerId: req.userId },
      data: req.body,
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Guruh topilmadi yoki siz uning egasi emassiz" });
    }
    const group = await prisma.readingGroup.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        description: true,
        genre: true,
        ownerId: true,
        createdAt: true,
        _count: { select: { members: true } },
        members: { where: { userId: req.userId }, select: { id: true } },
      },
    });
    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const groupId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(groupId) || groupId < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri guruh ID" });
    }
    const result = await prisma.readingGroup.deleteMany({
      where: { id: groupId, ownerId: req.userId },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Guruh topilmadi yoki siz uning egasi emassiz" });
    }
    res.json({ success: true, data: { id: groupId, deleted: true } });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const groupId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(groupId) || groupId < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri guruh ID" });
    }
    await ensureReaderProfile(req.userId);
    const group = await prisma.readingGroup.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!group) {
      return res.status(404).json({ success: false, error: "Guruh topilmadi" });
    }
    const wasMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.userId } },
      select: { id: true },
    });
    if (!wasMember && group.ownerId !== req.userId) {
      const reader = await prisma.readerProfile.findUnique({
        where: { userId: req.userId },
        select: { displayName: true },
      });
      await prisma.$transaction([
        prisma.groupMember.create({ data: { groupId, userId: req.userId } }),
        prisma.notification.create({
          data: {
            userId: group.ownerId,
            type: "GROUP_MEMBER_ADDED",
            message: `${reader?.displayName || "Yangi kitobxon"} “${group.name}” guruhingizga qo‘shildi.`,
            data: { groupId, memberId: req.userId },
          },
        }),
      ]);
    } else if (!wasMember) {
      await prisma.groupMember.create({
        data: { groupId, userId: req.userId },
      });
    }
    res.json({ success: true, data: { groupId, joined: true } });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, type: true, message: true, data: true, createdAt: true, readAt: true },
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri bildirishnoma ID" });
    }
    const result = await prisma.notification.updateMany({
      where: { id, userId: req.userId },
      data: { readAt: new Date() },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Bildirishnoma topilmadi" });
    }
    res.json({ success: true, data: { id, read: true } });
  } catch (error) {
    next(error);
  }
};

const getChatContacts = async (req, res, next) => {
  try {
    const [connections, memberships] = await Promise.all([
      prisma.partnerConnection.findMany({
        where: { OR: [{ userA: req.userId }, { userB: req.userId }] },
        select: {
          bookTitle: true,
          userA: true,
          userB: true,
          readerA: { select: { userId: true, displayName: true } },
          readerB: { select: { userId: true, displayName: true } },
        },
      }),
      prisma.groupMember.findMany({
        where: { userId: req.userId },
        select: {
          group: { select: { id: true, name: true, _count: { select: { members: true } } } },
        },
      }),
    ]);
    res.json({
      success: true,
      data: {
        partners: [...new Map(connections.map((connection) => {
          const reader = connection.userA === req.userId ? connection.readerB : connection.readerA;
          return [reader.userId, { id: reader.userId, displayName: reader.displayName, bookTitle: connection.bookTitle }];
        })).values()],
        groups: memberships.map(({ group }) => group),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getChatMessages = async (req, res, next) => {
  try {
    const groupId = req.params.groupId ? Number.parseInt(req.params.groupId, 10) : null;
    const partnerId = req.params.partnerId;
    let where;
    if (req.params.groupId && (!Number.isSafeInteger(groupId) || groupId < 1)) {
      return res.status(400).json({ success: false, error: "Noto'g'ri guruh ID" });
    }
    if (groupId !== null) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: req.userId } },
        select: { id: true },
      });
      if (!member) return res.status(403).json({ success: false, error: "Bu guruh chatiga kirish huquqi yo'q" });
      where = { groupId };
    } else {
      const [userA, userB] = [req.userId, partnerId].sort();
      const connected = await prisma.partnerConnection.findFirst({
        where: { userA, userB },
        select: { id: true },
      });
      if (!connected) return res.status(403).json({ success: false, error: "Bu kitobxon sizning hamrohingiz emas" });
      where = {
        groupId: null,
        OR: [
          { senderId: req.userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: req.userId },
        ],
      };
    }
    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        sender: { select: { displayName: true } },
      },
    });
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

const sendChatMessage = async (req, res, next) => {
  try {
    const groupId = req.params.groupId ? Number.parseInt(req.params.groupId, 10) : null;
    const partnerId = req.params.partnerId;
    if (req.params.groupId && (!Number.isSafeInteger(groupId) || groupId < 1)) {
      return res.status(400).json({ success: false, error: "Noto'g'ri guruh ID" });
    }
    if (groupId !== null) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: req.userId } },
        select: { id: true },
      });
      if (!member) return res.status(403).json({ success: false, error: "Bu guruh chatiga yozish huquqi yo'q" });
    } else {
      const [userA, userB] = [req.userId, partnerId].sort();
      const connected = await prisma.partnerConnection.findFirst({
        where: { userA, userB },
        select: { id: true },
      });
      if (!connected) return res.status(403).json({ success: false, error: "Bu kitobxon sizning hamrohingiz emas" });
    }
    const message = await prisma.chatMessage.create({
      data: {
        senderId: req.userId,
        recipientId: groupId !== null ? null : partnerId,
        groupId,
        content: req.body.content,
      },
      select: { id: true, senderId: true, content: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const updateChatMessage = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri xabar ID" });
    }
    const result = await prisma.chatMessage.updateMany({
      where: { id, senderId: req.userId },
      data: { content: req.body.content },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Xabar topilmadi yoki siz uni yubormagansiz" });
    }
    const message = await prisma.chatMessage.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        sender: { select: { displayName: true } },
      },
    });
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const deleteChatMessage = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Noto'g'ri xabar ID" });
    }
    const result = await prisma.chatMessage.deleteMany({
      where: { id, senderId: req.userId },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, error: "Xabar topilmadi yoki siz uni yubormagansiz" });
    }
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBook,
  getBookDetails,
  markBookRead,
  createBookPost,
  getGenres,
  getDiscoverBooks,
  getRecommendations,
  saveReview,
  shareBook,
  getReaderProfile,
  saveReaderProfile,
  getReadingPartners,
  getMyPartnerInterests,
  setPartnerInterest,
  createPartnerConnection,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  getNotifications,
  markNotificationRead,
  getChatContacts,
  getChatMessages,
  sendChatMessage,
  updateChatMessage,
  deleteChatMessage,
};
