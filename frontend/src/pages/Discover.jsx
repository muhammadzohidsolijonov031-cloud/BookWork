import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getBookGenres, getDiscoverBooks } from "../api/client";

function Discover() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getDiscoverBooks(), getBookGenres()])
      .then(([bookList, genreList]) => {
        if (active) {
          setBooks(bookList);
          setGenres(genreList);
        }
      })
      .catch(() => {
        if (active) setError("Kitoblar ro‘yxatini yuklab bo‘lmadi.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return books.filter((book) => {
      const matchesGenre = !selectedGenre || book.type === selectedGenre;
      const matchesQuery = [book.title, book.author, book.type, book.language]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesGenre && matchesQuery;
    });
  }, [books, query, selectedGenre]);

  return (
    <main className="platform-page">
      <div className="platform-container">
        <header className="platform-heading">
          <p className="eyebrow">KITOBXONLAR KUTUBXONASI</p>
          <h1>Ikkinchi olamni Kash eting.</h1>
          <p>Qidiring, ko‘rib chiqing va o‘qish uchun eng munosibini o'qing.</p>
        </header>

        <section className="discover-tools">
          <label className="discover-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kitob, muallif yoki til bo‘yicha izlash"
              aria-label="Kitob qidirish"
            />
          </label>
          <label className="genre-filter">
            <span>Janr</span>
            <select
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
            >
              <option value="">Barcha janrlar</option>
              {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
          </label>
          <Link className="primary-action discover-recommendations" to="/recommendations">
            Tavsiyalarim
          </Link>
        </section>

        {isLoading && <p className="library-message">Kitoblar yuklanmoqda...</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!isLoading && !error && visibleBooks.length > 0 && (
          <div className="discover-grid">
            {visibleBooks.map((book) => (
              <Link className="discover-card" to={`/book/${book.id}`} key={book.id}>
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt="" />
                ) : (
                  <span className="discover-cover" aria-hidden="true">📖</span>
                )}
                <div className="discover-card-content">
                  <p className="eyebrow">{book.type || book.language || "KITOB"}</p>
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                  <span>{book.viewCount} ko‘rish · {book._count.reviews} sharh</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!isLoading && !error && visibleBooks.length === 0 && (
          <div className="library-empty">
            {books.length
              ? "Qidiruvingizga mos kitob topilmadi."
              : "Hozircha ochiq kitob yo‘q. Kutubxonangizdan birinchi kitobni ulashing."}
          </div>
        )}
      </div>
    </main>
  );
}

export default Discover;
