import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getBookGenres,
  getRecommendations,
  getReaderProfile,
  saveReaderProfile,
} from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Recommendations() {
  const { getToken } = useAuth();
  const { displayName } = useCurrentUser();
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const token = await getToken();
        const [availableGenres, profile, recommendations] = await Promise.all([
          getBookGenres(),
          getReaderProfile(token),
          getRecommendations(token),
        ]);
        if (!active) return;
        setGenres(availableGenres);
        setSelectedGenres(profile.genres || []);
        setBooks(recommendations.books || []);
      } catch {
        if (active) setError("Tavsiyalarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [getToken]);

  const toggleGenre = (genre) => {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre],
    );
  };

  const savePreferences = async () => {
    setError("");
    setSavedMessage("");
    try {
      const token = await getToken();
      const profile = await getReaderProfile(token);
      await saveReaderProfile(token, {
        displayName: profile.displayName === "Kitobxon" ? displayName : profile.displayName,
        bio: profile.bio || "",
        genres: selectedGenres,
        openToPartners: profile.openToPartners,
      });
      const recommendations = await getRecommendations(token);
      setBooks(recommendations.books || []);
      setSavedMessage("Qiziqishlaringiz saqlandi. Tavsiyalar yangilandi.");
    } catch {
      setError("Qiziqishlarni saqlab bo‘lmadi. Qayta urinib ko‘ring.");
    }
  };

  return (
    <main className="platform-page">
      <div className="platform-container">
        <header className="platform-heading">
          <p className="eyebrow">SIZ UCHUN SARALANDI</p>
          <h1>Keyingi kitobingiz shu yerdadir.</h1>
          <p>Janrlarni tanlang — tavsiyalar o‘qishlar va sharhlar asosida saralanadi.</p>
        </header>

        <section className="preference-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">1-QADAM</p>
              <h2>Qaysi kitoblarni yoqtirasiz?</h2>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={savePreferences}
              disabled={isLoading}
            >
              Tanlovni saqlash
            </button>
          </div>
          {genres.length === 0 && !isLoading ? (
            <p className="muted-copy">Hozircha janrlar yo‘q. Kitoblar qo‘shilgach paydo bo‘ladi.</p>
          ) : (
            <div className="genre-options">
              {genres.map((genre) => (
                <label className="genre-option" key={genre}>
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          )}
          {savedMessage && <p className="success-message" role="status">{savedMessage}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        <section className="platform-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">2-QADAM</p>
              <h2>O‘quvchilar tanlovi</h2>
            </div>
            <span className="muted-copy">Ko‘rishlar va sharhlar bo‘yicha</span>
          </div>
          {isLoading ? (
            <p className="library-message">Tavsiyalar yuklanmoqda...</p>
          ) : books.length ? (
            <div className="platform-book-grid">
              {books.map((book, index) => (
                <Link className="recommendation-card" to={`/book/${book.id}`} key={book.id}>
                  <span className="recommendation-rank">#{index + 1}</span>
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt="" />
                  ) : (
                    <span className="recommendation-cover" aria-hidden="true">📖</span>
                  )}
                  <div>
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <span>{book.viewCount} o‘qish · {book._count.reviews} sharh</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="library-empty">Tanlangan janrlarda hozircha kitob topilmadi.</div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Recommendations;
