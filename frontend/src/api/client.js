import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
});

export const getAllBooks = async (token) => {
  if (!token) {
    throw new Error("Kitoblarni olish uchun autentifikatsiya tokeni kerak.");
  }

  const response = await client.get("/books", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const getPublicBook = async (bookId) => {
  const response = await client.get(`/books/public/${bookId}`);
  return response.data.data;
};

export const getBookDetails = async (token, bookId) => {
  if (!token) throw new Error("Kitobni ko‘rish uchun tizimga kiring.");
  const response = await client.get(`/books/details/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const recordBookRead = async (token, bookId) => {
  const endpoint = token ? `/books/${bookId}/read` : `/books/public/${bookId}/read`;
  const response = await client.post(
    endpoint,
    {},
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  return response.data.data;
};

export const getBookGenres = async () => {
  const response = await client.get("/books/genres");
  return response.data.data;
};

export const getDiscoverBooks = async () => {
  const response = await client.get("/books/discover");
  return response.data.data;
};

export const getRecommendations = async (token) => {
  if (!token) throw new Error("Tavsiyalar uchun avtorizatsiya kerak.");
  const response = await client.get("/books/recommendations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const saveBookReview = async (token, bookId, review) => {
  if (!token) throw new Error("Sharh yozish uchun tizimga kiring.");
  const response = await client.post(`/books/${bookId}/reviews`, review, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const createBookPost = async (token, bookId, post) => {
  if (!token) throw new Error("Post yozish uchun tizimga kiring.");
  const response = await client.post(`/books/${bookId}/posts`, post, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const shareBook = async (token, bookId) => {
  if (!token) throw new Error("Kitobni ulashish uchun tizimga kiring.");
  const response = await client.post(
    `/books/${bookId}/share`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getReaderProfile = async (token) => {
  if (!token) throw new Error("Profilni olish uchun avtorizatsiya kerak.");
  const response = await client.get("/community/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const saveReaderProfile = async (token, profile) => {
  if (!token) throw new Error("Profilni saqlash uchun avtorizatsiya kerak.");
  const response = await client.put("/community/profile", profile, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const getReadingPartners = async (token) => {
  if (!token) throw new Error("O'quvchilarni topish uchun avtorizatsiya kerak.");
  const response = await client.get("/community/partners", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const setPartnerInterest = async (token, bookId, enabled) => {
  if (!token) throw new Error("Hamroh izlash uchun tizimga kiring.");
  const response = await client.put(
    "/community/partners/interests",
    { bookId: Number(bookId), enabled },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getMyPartnerInterests = async (token) => {
  if (!token) throw new Error("Hamroh izlash sozlamasini olish uchun tizimga kiring.");
  const response = await client.get("/community/partners/interests/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const connectReadingPartner = async (token, recipientId, bookId) => {
  if (!token) throw new Error("Hamroh bo‘lish uchun tizimga kiring.");
  const response = await client.post(
    "/community/partners/connect",
    { recipientId, bookId: Number(bookId) },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getReadingGroups = async (token) => {
  if (!token) throw new Error("Guruhlarni olish uchun avtorizatsiya kerak.");
  const response = await client.get("/community/groups", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const createReadingGroup = async (token, group) => {
  if (!token) throw new Error("Guruh yaratish uchun avtorizatsiya kerak.");
  const response = await client.post("/community/groups", group, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const updateReadingGroup = async (token, groupId, group) => {
  if (!token) throw new Error("Guruhni tahrirlash uchun tizimga kiring.");
  const response = await client.put(`/community/groups/${groupId}`, group, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const deleteReadingGroup = async (token, groupId) => {
  if (!token) throw new Error("Guruhni o‘chirish uchun tizimga kiring.");
  const response = await client.delete(`/community/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const joinReadingGroup = async (token, groupId) => {
  if (!token) throw new Error("Guruhga qo'shilish uchun avtorizatsiya kerak.");
  const response = await client.post(
    `/community/groups/${groupId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getNotifications = async (token) => {
  if (!token) throw new Error("Bildirishnomalar uchun tizimga kiring.");
  const response = await client.get("/community/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const markNotificationRead = async (token, notificationId) => {
  if (!token) throw new Error("Bildirishnomani yangilash uchun tizimga kiring.");
  const response = await client.put(
    `/community/notifications/${notificationId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getChatContacts = async (token) => {
  if (!token) throw new Error("Chat uchun tizimga kiring.");
  const response = await client.get("/community/chats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const getPartnerMessages = async (token, partnerId) => {
  if (!token) throw new Error("Xabarlarni ko‘rish uchun tizimga kiring.");
  const response = await client.get(`/community/chats/partners/${encodeURIComponent(partnerId)}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { _ts: Date.now() },
  });
  return response.data.data;
};

export const sendPartnerMessage = async (token, partnerId, content) => {
  if (!token) throw new Error("Xabar yuborish uchun tizimga kiring.");
  const response = await client.post(
    `/community/chats/partners/${encodeURIComponent(partnerId)}/messages`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const getGroupMessages = async (token, groupId) => {
  if (!token) throw new Error("Xabarlarni ko‘rish uchun tizimga kiring.");
  const response = await client.get(`/community/chats/groups/${groupId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { _ts: Date.now() },
  });
  return response.data.data;
};

export const sendGroupMessage = async (token, groupId, content) => {
  if (!token) throw new Error("Xabar yuborish uchun tizimga kiring.");
  const response = await client.post(
    `/community/chats/groups/${groupId}/messages`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const updateChatMessage = async (token, messageId, content) => {
  if (!token) throw new Error("Xabarni tahrirlash uchun tizimga kiring.");
  const response = await client.put(
    `/community/chats/messages/${messageId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const deleteChatMessage = async (token, messageId) => {
  if (!token) throw new Error("Xabarni o‘chirish uchun tizimga kiring.");
  const response = await client.delete(`/community/chats/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const createBook = async (token, bookData) => {
  if (!token) {
    throw new Error("Kitob qo'shish uchun autentifikatsiya tokeni kerak.");
  }

  const response = await client.post("/books", bookData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const updateBook = async (token, bookId, bookData) => {
  if (!token) {
    throw new Error("Kitobni tahrirlash uchun autentifikatsiya tokeni kerak.");
  }

  const response = await client.put(`/books/${bookId}`, bookData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const uploadBookCover = async (token, imageFile) => {
  if (!token) {
    throw new Error("Rasm yuklash uchun autentifikatsiya tokeni kerak.");
  }

  const response = await client.post("/books/upload-cover", imageFile, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": imageFile.type,
    },
  });

  return response.data.data.imageUrl;
};

export default client;
