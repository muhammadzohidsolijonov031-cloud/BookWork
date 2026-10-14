import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import {
  connectReadingPartner,
  createReadingGroup,
  deleteReadingGroup,
  getAllBooks,
  getReadingGroups,
  getMyPartnerInterests,
  getReadingPartners,
  getReaderProfile,
  joinReadingGroup,
  saveReaderProfile,
  setPartnerInterest,
  updateReadingGroup,
} from "../api/client";
import { Link } from "react-router";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Community() {
  const { getToken } = useAuth();
  const { displayName: clerkName, user } = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [partners, setPartners] = useState([]);
  const [groups, setGroups] = useState([]);
  const [interests, setInterests] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [groupForm, setGroupForm] = useState({ name: "", description: "", genre: "" });
  const [isPartnerSearchOpen, setIsPartnerSearchOpen] = useState(false);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCommunity = async () => {
    const token = await getToken();
    const [bookList, partnerList, groupList, interestList, readerProfile] = await Promise.all([
      getAllBooks(token),
      getReadingPartners(token),
      getReadingGroups(token),
      getMyPartnerInterests(token),
      getReaderProfile(token),
    ]);
    setBooks(bookList);
    setPartners(partnerList);
    setGroups(groupList);
    setInterests(interestList);
    setProfile({
      ...readerProfile,
      displayName: readerProfile.displayName === "Kitobxon" ? clerkName : readerProfile.displayName,
    });
  };

  useEffect(() => {
    let active = true;
    getToken()
      .then((token) => Promise.all([
        getAllBooks(token),
        getReadingPartners(token),
        getReadingGroups(token),
        getMyPartnerInterests(token),
        getReaderProfile(token),
      ]))
      .then(([bookList, partnerList, groupList, interestList, readerProfile]) => {
        if (!active) return;
        setBooks(bookList);
        setPartners(partnerList);
        setGroups(groupList);
        setInterests(interestList);
        setProfile({
          ...readerProfile,
          displayName: readerProfile.displayName === "Kitobxon" ? clerkName : readerProfile.displayName,
        });
      })
      .catch(() => {
        if (active) setError("Hamjamiyat ma'lumotlarini yuklab bo‘lmadi.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [getToken, clerkName]);

  const handleInterestToggle = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = await getToken();
      const enabled = !interests.includes(Number(selectedBookId));
      await setPartnerInterest(token, selectedBookId, enabled);
      await loadCommunity();
      setMessage(enabled
        ? "Hamroh izlash boshlandi. Sizni shu kitobga qiziqqan kitobxonlar ko‘ra oladi."
        : "Hamroh izlash shu kitob uchun to‘xtatildi.");
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Hamroh izlash sozlamasini saqlab bo‘lmadi.");
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = await getToken();
      const updated = await saveReaderProfile(token, profile);
      setProfile(updated);
      setMessage("Kitobxon profilingiz saqlandi.");
    } catch (saveError) {
      setError(saveError.response?.data?.error?.[0]?.message || "Profilni saqlab bo‘lmadi.");
    }
  };

  const handleConnect = async (recipientId, bookId, title) => {
    setError("");
    setMessage("");
    try {
      const token = await getToken();
      await connectReadingPartner(token, recipientId, bookId);
      setMessage(`Siz “${title}” kitobi bo‘yicha hamroh bo‘ldingiz. Hamrohingizga bildirishnoma yuborildi.`);
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Hamroh qo‘shib bo‘lmadi.");
    }
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await getToken();
      await createReadingGroup(token, groupForm);
      setGroupForm({ name: "", description: "", genre: "" });
      setIsGroupFormOpen(false);
      await loadCommunity();
      setMessage("Kitobxonlar guruhi yaratildi.");
    } catch (submitError) {
      setError(submitError.response?.data?.error?.[0]?.message || "Guruh yaratilmadi. Ma'lumotlarni tekshiring.");
    }
  };

  const handleEditGroup = async (event, groupId) => {
    event.preventDefault();
    setError("");
    try {
      const token = await getToken();
      await updateReadingGroup(token, groupId, groupForm);
      setEditingGroupId(null);
      setGroupForm({ name: "", description: "", genre: "" });
      await loadCommunity();
      setMessage("Guruh ma'lumotlari yangilandi.");
    } catch (saveError) {
      setError(saveError.response?.data?.error?.[0]?.message || "Guruhni tahrirlab bo‘lmadi.");
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`“${group.name}” guruhini va uning chat xabarlarini o‘chirmoqchimisiz?`)) return;
    setError("");
    try {
      const token = await getToken();
      await deleteReadingGroup(token, group.id);
      if (editingGroupId === group.id) setEditingGroupId(null);
      await loadCommunity();
      setMessage("Guruh o‘chirildi.");
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || "Guruhni o‘chirib bo‘lmadi.");
    }
  };

  const handleJoinGroup = async (groupId) => {
    setError("");
    try {
      const token = await getToken();
      await joinReadingGroup(token, groupId);
      await loadCommunity();
      setMessage("Guruhga qo‘shildingiz. Guruh egasiga bildirishnoma yuborildi.");
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Guruhga qo‘shilib bo‘lmadi.");
    }
  };

  if (isLoading || !profile) {
    return <main className="platform-page"><p className="library-message">Hamjamiyat yuklanmoqda...</p></main>;
  }

  const selectedBook = books.find((book) => book.id === Number(selectedBookId));
  const matchingPartners = selectedBook
    ? partners.filter((partner) => partner.book.title.trim().toLocaleLowerCase() === selectedBook.title.trim().toLocaleLowerCase())
    : [];

  return (
    <main className="platform-page">
      <div className="platform-container">
        <header className="platform-heading">
          <p className="eyebrow">BIRGA O‘QISH YANADA QIZIQ</p>
          <h1>Kitobxonlar hamjamiyati</h1>
          <p>Muayyan kitob uchun hamroh toping, guruh yarating va kitobxonlar bilan suhbatlashing.</p>
        </header>

        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="error-message" role="alert">{error}</p>}

        <div className="community-columns">
          <section className="preference-panel">
            <p className="eyebrow">BIRGA MUTOLAA</p>
            <h2>Kitobxon hamroh</h2>
            <p className="muted-copy">Hamroh izlash hech qachon ochiq turmaydi. Tugmani bosib, qaysi kitobni birga o‘qimoqchi ekaningizni tanlang.</p>
            <form className="community-form" onSubmit={handleSaveProfile}>
              <label>
                Ko‘rinadigan ismingiz
                <input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} minLength={2} maxLength={60} required />
              </label>
              <label>
                O‘zingiz haqingizda
                <textarea value={profile.bio || ""} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} maxLength={500} rows={2} placeholder="Qanday kitoblarni yoqtirasiz?" />
              </label>
              <button className="secondary-action" type="submit">Profilni saqlash</button>
            </form>
            <button
              className="primary-action"
              type="button"
              onClick={() => setIsPartnerSearchOpen((open) => !open)}
            >
              {isPartnerSearchOpen ? "Hamroh izlashni yopish" : "Hamroh izlash"}
            </button>

            {isPartnerSearchOpen && (
              <form className="community-form partner-search-form" onSubmit={handleInterestToggle}>
                <label>
                  Qaysi kitob uchun hamroh izlayapsiz?
                  <select value={selectedBookId} onChange={(event) => setSelectedBookId(event.target.value)} required>
                    <option value="">Kitobni tanlang</option>
                    {books.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}
                  </select>
                </label>
                {books.length === 0 && <p className="muted-copy">Avval kutubxonangizga kitob qo‘shing.</p>}
                {selectedBook && (
                  <button className="secondary-action" type="submit">
                    {interests.includes(selectedBook.id) ? "Hamroh izlashni to‘xtatish" : "Shu kitobga hamroh izlashni boshlash"}
                  </button>
                )}
                {selectedBook && interests.includes(selectedBook.id) && (
                  <div className="partner-list">
                    <h3>“{selectedBook.title}” kitobi uchun hamrohlar</h3>
                    {matchingPartners.length ? matchingPartners.map((partner) => (
                      <article className="community-person" key={`${partner.userId}-${partner.book.title}`}>
                        {partner.book.imageUrl
                          ? <img className="person-avatar partner-book-avatar" src={partner.book.imageUrl} alt="" />
                          : <div className="person-avatar">{partner.reader.displayName?.[0] || "K"}</div>}
                        <div className="partner-person-copy">
                          <strong>{partner.reader.displayName}</strong>
                          <p>{partner.reader.bio || "Bu kitobni birga o‘qishga qiziqadi."}</p>
                          <small>{partner.book.title} · {partner.book.author}</small>
                          <button
                            className="secondary-action"
                            type="button"
                            onClick={() => handleConnect(partner.userId, selectedBook.id, selectedBook.title)}
                          >
                            Hamroh bo‘lish
                          </button>
                        </div>
                      </article>
                    )) : <p className="muted-copy">Hozircha bu kitobga qiziqqan boshqa kitobxon topilmadi.</p>}
                  </div>
                )}
              </form>
            )}
          </section>

          <section className="preference-panel">
            <p className="eyebrow">KITOBXONLAR KLUBI</p>
            <h2>O‘qish guruhlari</h2>
            <p className="muted-copy">O‘zingiz guruh oching yoki mavjud kitobxonlar guruhiga qo‘shiling.</p>
            <button className="primary-action" type="button" onClick={() => setIsGroupFormOpen((open) => !open)}>
              {isGroupFormOpen ? "Yaratishni bekor qilish" : "Guruh yaratish"}
            </button>
            {isGroupFormOpen && (
              <form className="community-form" onSubmit={handleCreateGroup}>
                <label>
                  Guruh nomi
                  <input value={groupForm.name} onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} minLength={3} maxLength={80} required />
                </label>
                <label>
                  Guruh haqida
                  <textarea value={groupForm.description} onChange={(event) => setGroupForm({ ...groupForm, description: event.target.value })} minLength={10} maxLength={1000} rows={3} required />
                </label>
                <label>
                  Janr (ixtiyoriy)
                  <input value={groupForm.genre} onChange={(event) => setGroupForm({ ...groupForm, genre: event.target.value })} maxLength={60} />
                </label>
                <button className="primary-action" type="submit">Guruhni yaratish</button>
              </form>
            )}
            <div className="group-list">
              {groups.length ? groups.map((group) => {
                const isMember = group.members.length > 0;
                return (
                  <article className="group-card" key={group.id}>
                    <div className="group-card-heading">
                      <h3>{group.name}</h3>
                      <span>{group._count.members} a'zo</span>
                    </div>
                    <p>{group.description}</p>
                    {group.genre && <small>{group.genre}</small>}
                    {group.ownerId === user?.id && (
                      <div className="group-owner-actions">
                        <button
                          className="secondary-action"
                          type="button"
                          onClick={() => {
                            setEditingGroupId(editingGroupId === group.id ? null : group.id);
                            setGroupForm({ name: group.name, description: group.description, genre: group.genre || "" });
                          }}
                        >
                          {editingGroupId === group.id ? "Tahrirni yopish" : "Tahrirlash"}
                        </button>
                        <button className="secondary-action danger-action" type="button" onClick={() => handleDeleteGroup(group)}>
                          Guruhni o‘chirish
                        </button>
                      </div>
                    )}
                    {editingGroupId === group.id && (
                      <form className="community-form" onSubmit={(event) => handleEditGroup(event, group.id)}>
                        <label>
                          Guruh nomi
                          <input value={groupForm.name} onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} minLength={3} maxLength={80} required />
                        </label>
                        <label>
                          Guruh haqida
                          <textarea value={groupForm.description} onChange={(event) => setGroupForm({ ...groupForm, description: event.target.value })} minLength={10} maxLength={1000} rows={3} required />
                        </label>
                        <label>
                          Janr (ixtiyoriy)
                          <input value={groupForm.genre} onChange={(event) => setGroupForm({ ...groupForm, genre: event.target.value })} maxLength={60} />
                        </label>
                        <button className="primary-action" type="submit">O‘zgarishlarni saqlash</button>
                      </form>
                    )}
                    <div className="group-card-actions">
                      <button className="secondary-action" type="button" onClick={() => handleJoinGroup(group.id)} disabled={isMember}>
                        {isMember ? "Siz a'zosiz" : "Guruhga qo‘shilish"}
                      </button>
                      {isMember && <Link className="secondary-action" to={`/chat?group=${group.id}`}>Guruh chatiga o‘tish</Link>}
                    </div>
                  </article>
                );
              }) : <p className="muted-copy">Hali guruh yaratilmagan. Birinchi guruhni siz oching.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Community;
