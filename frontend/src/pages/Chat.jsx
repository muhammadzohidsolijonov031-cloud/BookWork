import { useAuth } from "@clerk/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  getChatContacts,
  getGroupMessages,
  getPartnerMessages,
  deleteChatMessage,
  sendGroupMessage,
  sendPartnerMessage,
  updateChatMessage,
} from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Chat() {
  const { getToken } = useAuth();
  const { user } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState({ partners: [], groups: [] });
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const selectedType = searchParams.get("group") ? "group" : "partner";
  const selectedId = searchParams.get("group") || searchParams.get("partner") || "";
  const selected = useMemo(() => {
    if (!selectedId) return null;
    return selectedType === "group"
      ? contacts.groups.find((group) => String(group.id) === selectedId) || null
      : contacts.partners.find((partner) => partner.id === selectedId) || null;
  }, [contacts, selectedId, selectedType]);

  useEffect(() => {
    let active = true;
    let loading = false;
    const loadContacts = async () => {
      if (loading) return;
      loading = true;
      try {
        const token = await getToken();
        const data = await getChatContacts(token);
        if (!active) return;
        setContacts(data);
        setError("");
        if (!searchParams.get("group") && !searchParams.get("partner")) {
          const first = data.groups[0];
          const partner = data.partners[0];
          if (first) setSearchParams({ group: String(first.id) }, { replace: true });
          else if (partner) setSearchParams({ partner: partner.id }, { replace: true });
        }
      } catch (loadError) {
        if (active) setError(loadError.response?.data?.error || "Chatlar ro‘yxatini yuklab bo‘lmadi.");
      } finally {
        loading = false;
        if (active) setIsLoading(false);
      }
    };
    loadContacts();
    const timer = window.setInterval(loadContacts, 10000);
    window.addEventListener("focus", loadContacts);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", loadContacts);
    };
  }, [getToken, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selected) {
      return undefined;
    }
    let active = true;
    let loading = false;
    const loadMessages = async () => {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        const token = await getToken();
        const data = selectedType === "group"
          ? await getGroupMessages(token, selected.id)
          : await getPartnerMessages(token, selected.id);
        if (active) {
          setMessages(data);
          setError("");
        }
      } catch (loadError) {
        if (active) setError(loadError.response?.data?.error || "Xabarlarni yuklab bo‘lmadi.");
      } finally {
        loading = false;
      }
    };
    loadMessages();
    const timer = window.setInterval(loadMessages, 2000);
    window.addEventListener("focus", loadMessages);
    document.addEventListener("visibilitychange", loadMessages);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", loadMessages);
      document.removeEventListener("visibilitychange", loadMessages);
    };
  }, [getToken, selected, selectedType]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selected || !draft.trim()) return;
    setIsSending(true);
    setError("");
    try {
      const token = await getToken();
      const message = selectedType === "group"
        ? await sendGroupMessage(token, selected.id, draft.trim())
        : await sendPartnerMessage(token, selected.id, draft.trim());
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;
        return [...current, { ...message, sender: { displayName: user?.firstName || "Siz" } }];
      });
      setError("");
      setDraft("");
    } catch (sendError) {
      setError(sendError.response?.data?.error || "Xabar yuborilmadi. Qayta urinib ko‘ring.");
    } finally {
      setIsSending(false);
    }
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setError("");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const saveEditedMessage = async (event, messageId) => {
    event.preventDefault();
    if (!editingContent.trim()) return;
    setError("");
    try {
      const token = await getToken();
      const updated = await updateChatMessage(token, messageId, editingContent.trim());
      setMessages((current) => current.map((message) =>
        message.id === messageId ? { ...message, ...updated } : message,
      ));
      cancelEditMessage();
    } catch (saveError) {
      setError(saveError.response?.data?.error || "Xabarni tahrirlab bo‘lmadi.");
    }
  };

  const removeMessage = async (message) => {
    if (!window.confirm("Xabarni o‘chirmoqchimisiz?")) return;
    setError("");
    try {
      const token = await getToken();
      await deleteChatMessage(token, message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      if (editingMessageId === message.id) cancelEditMessage();
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || "Xabarni o‘chirib bo‘lmadi.");
    }
  };

  const selectChat = (type, id) => {
    setMessages([]);
    setError("");
    setSearchParams(type === "group" ? { group: String(id) } : { partner: id });
  };

  return (
    <main className="platform-page">
      <div className="platform-container">
        <header className="platform-heading">
          <p className="eyebrow">KITOBXONLAR SUHBATI</p>
          <h1>Chat</h1>
          <p>Barcha kitobxon to'stlaringia shub yerda.</p>
        </header>
        {error && <p className="error-message" role="alert">{error}</p>}
        {isLoading ? <p className="library-message">Chatlar yuklanmoqda...</p> : (
          <section className="chat-layout">
            <aside className="chat-sidebar">
              <h2>Guruhlar</h2>
              {contacts.groups.map((group) => (
                <button
                  className={`chat-contact ${selectedType === "group" && selectedId === String(group.id) ? "is-active" : ""}`}
                  type="button"
                  key={group.id}
                  onClick={() => selectChat("group", group.id)}
                >
                  <strong>{group.name}</strong>
                  <span>{group._count.members} a'zo</span>
                </button>
              ))}
              <h2>Hamrohlar</h2>
              {contacts.partners.map((partner) => (
                <button
                  className={`chat-contact ${selectedType === "partner" && selectedId === partner.id ? "is-active" : ""}`}
                  type="button"
                  key={`${partner.id}-${partner.bookTitle}`}
                  onClick={() => selectChat("partner", partner.id)}
                >
                  <strong>{partner.displayName}</strong>
                  <span>{partner.bookTitle} kitobi</span>
                </button>
              ))}
              {!contacts.groups.length && !contacts.partners.length && (
                <p className="muted-copy">Hali chatlaringiz yo‘q. Hamroh toping yoki guruhga qo‘shiling.</p>
              )}
            </aside>
            <div className="chat-conversation">
              {selected ? (
                <>
                  <header className="chat-conversation-heading">
                    <div>
                      <p className="eyebrow">{selectedType === "group" ? "GURUH SUHBATI" : "KITOBXON HAMROH"}</p>
                      <h2>{selected.name || selected.displayName}</h2>
                      {selectedType === "partner" && <span>{selected.bookTitle} kitobi</span>}
                    </div>
                  </header>
                  <div className="chat-messages" aria-live="polite">
                    {messages.map((message) => (
                      <article className={`chat-message ${message.senderId === user?.id ? "chat-message-mine" : ""}`} key={message.id}>
                        <strong>{message.senderId === user?.id ? "Siz" : message.sender?.displayName || "Kitobxon"}</strong>
                        {editingMessageId === message.id ? (
                          <form className="chat-edit-form" onSubmit={(event) => saveEditedMessage(event, message.id)}>
                            <textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} maxLength={2000} required autoFocus />
                            <div className="chat-message-actions">
                              <button className="chat-message-action" type="submit" disabled={!editingContent.trim()}>Saqlash</button>
                              <button className="chat-message-action" type="button" onClick={cancelEditMessage}>Bekor qilish</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            <div className="chat-message-footer">
                              <time dateTime={message.updatedAt || message.createdAt}>
                                {new Date(message.updatedAt || message.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                                {message.updatedAt && new Date(message.updatedAt).getTime() > new Date(message.createdAt).getTime() && " · tahrirlangan"}
                              </time>
                              {message.senderId === user?.id && (
                                <div className="chat-message-actions">
                                  <button className="chat-message-action" type="button" onClick={() => startEditMessage(message)}>Tahrirlash</button>
                                  <button className="chat-message-action danger-action" type="button" onClick={() => removeMessage(message)}>O‘chirish</button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </article>
                    ))}
                    {!messages.length && <p className="muted-copy">Suhbatni boshlash uchun birinchi xabaringizni yozing.</p>}
                  </div>
                  <form className="chat-compose" onSubmit={sendMessage}>
                    <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Xabar yozing..." aria-label="Xabar yozing" required />
                    <button className="primary-action" type="submit" disabled={isSending || !draft.trim()}>{isSending ? "..." : "Yuborish"}</button>
                  </form>
                </>
              ) : (
                <div className="chat-empty"><h2>Suhbatni tanlang</h2><p>Chap tomondan guruh yoki hamrohingizni tanlang.</p></div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Chat;
