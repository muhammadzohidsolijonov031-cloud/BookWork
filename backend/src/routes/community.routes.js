const express = require("express");
const controller = require("../controllers/platform.controller.js");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const validate = require("../middlewares/validate.js");
const {
  chatMessageSchema,
  groupSchema,
  partnerConnectionSchema,
  partnerInterestSchema,
  readerProfileSchema,
} = require("../validations/platform.validation.js");

const router = express.Router();

router.use(requireAuth);

router.get("/profile", controller.getReaderProfile);
router.put("/profile", validate(readerProfileSchema), controller.saveReaderProfile);
router.get("/partners", controller.getReadingPartners);
router.get("/partners/interests/mine", controller.getMyPartnerInterests);
router.put("/partners/interests", validate(partnerInterestSchema), controller.setPartnerInterest);
router.post("/partners/connect", validate(partnerConnectionSchema), controller.createPartnerConnection);
router.get("/groups", controller.getGroups);
router.post("/groups", validate(groupSchema), controller.createGroup);
router.put("/groups/:id", validate(groupSchema), controller.updateGroup);
router.delete("/groups/:id", controller.deleteGroup);
router.post("/groups/:id/join", controller.joinGroup);
router.get("/notifications", controller.getNotifications);
router.put("/notifications/:id/read", controller.markNotificationRead);
router.get("/chats", controller.getChatContacts);
router.get("/chats/partners/:partnerId/messages", controller.getChatMessages);
router.post(
  "/chats/partners/:partnerId/messages",
  validate(chatMessageSchema),
  controller.sendChatMessage,
);
router.get("/chats/groups/:groupId/messages", controller.getChatMessages);
router.post(
  "/chats/groups/:groupId/messages",
  validate(chatMessageSchema),
  controller.sendChatMessage,
);
router.put("/chats/messages/:id", validate(chatMessageSchema), controller.updateChatMessage);
router.delete("/chats/messages/:id", controller.deleteChatMessage);

module.exports = router;
