import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  createBook,
  getAllBooks,
  shareBook,
  updateBook,
  uploadBookCover,
} from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";

const coverPalettes = [
  ["#243b35", "#8fa995"],
  ["#4c3342", "#c38c8d"],
  ["#30415c", "#94a9c4"],
  ["#5b472f", "#c1a77b"],
  ["#34364e", "#9a9bc1"],
];

function getCoverUrl(imageUrl) {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl);
    if (url.hostname.endsWith("google.com") && url.pathname === "/imgres") {
      return url.searchParams.get("imgurl") || imageUrl;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}

function BookCover({ book }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getCoverUrl(book.imageUrl);
  const paletteIndex =
    Array.from(book.title || "").reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % coverPalettes.length;
  const [darkColor, lightColor] = coverPalettes[paletteIndex];
  const initials = (book.title || "Kitob")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase();

  if (imageUrl && !hasError) {
    return (
      <div className="book-cover">
        <img
          src={imageUrl}
          alt={`${book.title} kitobining muqovasi`}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="book-cover book-cover-fallback"
      style={{ "--cover-dark": darkColor, "--cover-light": lightColor }}
      aria-label={`${book.title} uchun muqova`}
      role="img"
    >
      <span className="cover-mark" aria-hidden="true">
        {initials}
      </span>
      <div className="cover-copy">
        <span>{book.type || "SHAXSIY KUTUBXONA"}</span>
        <strong>{book.title}</strong>
        <small>{book.author}</small>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, isLoaded, displayName, email, avatar } = useCurrentUser();
  const { getToken } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [sharingBookId, setSharingBookId] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadBooks = async () => {
      try {
        const token = await getToken();
        const items = await getAllBooks(token);

        if (isActive) setBooks(items);
      } catch (error) {
        if (isActive) {
          setBooksError(
            error.message || "Kitoblarni yuklashda xatolik yuz berdi.",
          );
        }
      } finally {
        if (isActive) setIsLoadingBooks(false);
      }
    };

    loadBooks();

    return () => {
      isActive = false;
    };
  }, [getToken]);

  const startEditing = (book) => {
    setIsAddingBook(false);
    setEditingBook(book);
    setSelectedImageFile(null);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      imageUrl: book.imageUrl || "",
      pdfUrl: book.pdfUrl || "",
      licenseConfirmed: book.licenseConfirmed || false,
      isPublic: book.isPublic || false,
      language: book.language || "",
      status: book.status || "",
      rating: book.rating ?? "",
      type: book.type || "",
      hooks: book.hooks || "",
      pages: book.pages || "",
      cost: book.cost || "",
    });
    setEditError("");
  };

  const startAddingBook = () => {
    setEditingBook(null);
    setIsAddingBook(true);
    setSelectedImageFile(null);
    setEditForm({
      title: "",
      author: "",
      description: "",
      imageUrl: "",
      pdfUrl: "",
      licenseConfirmed: false,
      isPublic: false,
      language: "",
      status: "wishlist",
      rating: "",
      type: "",
      hooks: "",
      pages: "",
      cost: "",
    });
    setEditError("");
  };

  const closeEditForm = () => {
    if (isSavingEdit) return;
    setEditingBook(null);
    setIsAddingBook(false);
    setEditForm(null);
    setSelectedImageFile(null);
    setEditError("");
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if ((!editingBook && !isAddingBook) || !editForm) return;

    setIsSavingEdit(true);
    setEditError("");

    try {
      const token = await getToken();
      const imageUrl = selectedImageFile
        ? await uploadBookCover(token, selectedImageFile)
        : editForm.imageUrl.trim() || null;
      const bookData = {
        ...editForm,
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        imageUrl,
        pdfUrl: editForm.pdfUrl.trim() || null,
        rating: editForm.rating === "" ? null : Number(editForm.rating),
      };

      if (isAddingBook) {
        const createdBook = await createBook(token, bookData);
        setBooks((currentBooks) => [createdBook, ...currentBooks]);
      } else {
        const updatedBook = await updateBook(token, editingBook.id, bookData);
        setBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.id === updatedBook.id ? updatedBook : book,
          ),
        );
      }
      setEditingBook(null);
      setIsAddingBook(false);
      setEditForm(null);
      setSelectedImageFile(null);
    } catch (error) {
      const responseError = error.response?.data?.error;
      const message =
        typeof responseError === "string"
          ? responseError
          : responseError?.[0]?.message;
      setEditError(
        message === "Kitob topilmadi"
          ? "Bu kitob akkauntingizga tegishli emas yoki o‘chirilgan. Sahifani yangilab, o‘z kutubxonangizdagi kitobni tahrirlang."
          : message ||
            "Kitobni yoki rasmini saqlashda xatolik yuz berdi. Ma'lumotlarni tekshirib qayta urinib ko'ring.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  };

  const handleShareBook = async (book) => {
    setSharingBookId(book.id);
    setShareError("");
    try {
      const token = await getToken();
      await shareBook(token, book.id);
      setBooks((currentBooks) =>
        currentBooks.map((item) =>
          item.id === book.id ? { ...item, isPublic: true } : item,
        ),
      );
      setShareLink(`${window.location.origin}/book/${book.id}`);
      setShareCopied(false);
    } catch {
      setShareError("Kitobni ulashib bo‘lmadi. Qayta urinib ko‘ring.");
    } finally {
      setSharingBookId(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="dashboard-loading" role="status">
        Kutubxonangiz ochilmoqda...
      </div>
    );
  }

  if (!user) return null;

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const visibleBooks = books.filter((book) =>
    [book.title, book.author, book.language, book.type]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch)),
  );

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="library-intro">
          <div className="dashboard-account">
            <div>
              <strong>{displayName}</strong>
              <span>{email}</span>
            </div>
            {avatar ? (
              <img src={avatar} alt="" />
            ) : (
              <span className="account-initial" aria-hidden="true">
                {displayName?.[0] || "M"}
              </span>
            )}
          </div>
          <p className="eyebrow">SHAXSIY KUTUBXONA</p>
          <h1>
            Har bir kitob —
            <br />
            <span>yangi bir olam.</span>
          </h1>
          <p className="intro-description">
            O‘qiganlaringizni eslang, navbatdagisini tanlang va o‘z
            kutubxonangizni bir joyda saqlang.
          </p>
          <div className="library-total">
            <strong>{books.length}</strong>
            <span>
              {books.length === 1 ? "ta kitob" : "ta kitob kolleksiyangizda"}
            </span>
          </div>
        </section>

        <section className="library-section" aria-labelledby="library-heading">
          <div className="library-toolbar">
            <div>
              <p className="eyebrow">SIZNING TO‘PLAMINGIZ</p>
              <h2 id="library-heading">Kitoblar</h2>
            </div>
            <div className="library-toolbar-actions">
              <label className="book-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Kitob yoki muallifni izlash"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Kitob yoki muallifni izlash"
                />
              </label>
              <button
                className="add-book-button"
                type="button"
                onClick={startAddingBook}
              >
                <span aria-hidden="true">+</span>
                Kitob qo‘shish
              </button>
            </div>
          </div>

          {isLoadingBooks && (
            <div className="library-message" role="status">
              Kitoblaringiz yuklanmoqda...
            </div>
          )}

          {!isLoadingBooks && booksError && (
            <div className="library-message library-error" role="alert">
              {booksError}
            </div>
          )}

          {!isLoadingBooks && !booksError && books.length === 0 && (
            <div className="library-empty">
              <span aria-hidden="true">✳</span>
              <h3>Kolleksiyangiz endi boshlanadi</h3>
              <p>Kitoblar qo‘shilgach, ular shu yerda tartibli ko‘rinadi.</p>
            </div>
          )}

          {!isLoadingBooks &&
            !booksError &&
            books.length > 0 &&
            visibleBooks.length === 0 && (
              <div className="library-message">
                “{searchTerm}” bo‘yicha kitob topilmadi.
              </div>
            )}

          {!isLoadingBooks && !booksError && visibleBooks.length > 0 && (
            <div className="book-grid">
              {visibleBooks.map((book) => (
                <article className="book-card" key={book.id}>
                  <Link
                    className="book-card-cover-link"
                    to={`/book/${book.id}`}
                    aria-label={`${book.title} kitobini ochish`}
                  >
                    <BookCover book={book} />
                  </Link>
                  <div className="book-card-content">
                    <div className="book-card-heading">
                      <div className="flex gap-16">
                        <div>
                          <h3>
                            <Link className="book-title-link" to={`/book/${book.id}`}>
                              {book.title}
                            </Link>
                          </h3>
                          <p>{book.author}</p>
                        </div>
                        <div className="book-card-actions">
                          <button
                            type="button"
                            className="book-edit-button"
                            onClick={() => startEditing(book)}
                            aria-label={`${book.title} kitobini tahrirlash`}
                          >
                            Tahrirlash
                          </button>
                          <button
                            type="button"
                            className="book-share-button"
                            onClick={() => handleShareBook(book)}
                            disabled={sharingBookId === book.id}
                          >
                            {sharingBookId === book.id ? "Tayyorlanmoqda..." : "Ulashish"}
                          </button>
                        </div>
                      </div>
                      {book.rating != null && (
                        <span
                          className="book-rating"
                          aria-label={`Reyting ${book.rating} dan 5`}
                        >
                          ★ {book.rating}
                        </span>
                      )}
                    </div>
                    {(book.status || book.language || book.type) && (
                      <div className="book-tags">
                        {[book.status, book.language, book.type]
                          .filter(Boolean)
                          .map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                      </div>
                    )}
                    {book.description && (
                      <p className="book-description">{book.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {(editingBook || isAddingBook) && editForm && (
          <div
            className="edit-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeEditForm();
            }}
            role="presentation"
          >
            <section
              className="edit-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-book-title"
            >
              <div className="edit-modal-heading">
                <div>
                  <p className="eyebrow">KITOB MA'LUMOTLARI</p>
                  <h2 id="edit-book-title">
                    {isAddingBook ? "Yangi kitob qo‘shish" : "Kitobni tahrirlash"}
                  </h2>
                </div>
                <button
                  className="edit-modal-close"
                  type="button"
                  onClick={closeEditForm}
                  disabled={isSavingEdit}
                  aria-label="Kitob formasini yopish"
                >
                  ×
                </button>
              </div>

              <form className="edit-book-form" onSubmit={handleEditSubmit}>
                <label>
                  Kitob nomi
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm({ ...editForm, title: event.target.value })
                    }
                    minLength={2}
                    required
                  />
                </label>
                <label>
                  Muallif
                  <input
                    name="author"
                    value={editForm.author}
                    onChange={(event) =>
                      setEditForm({ ...editForm, author: event.target.value })
                    }
                    minLength={2}
                    required
                  />
                </label>
                <label>
                  Tavsif
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        description: event.target.value,
                      })
                    }
                    rows={3}
                  />
                </label>
                <label>
                  PDF manba havolasi (majburiy)
                  <input
                    name="pdfUrl"
                    type="url"
                    value={editForm.pdfUrl}
                    onChange={(event) =>
                      setEditForm({ ...editForm, pdfUrl: event.target.value })
                    }
                    placeholder="https://ochiq-manba.uz/kitob.pdf"
                    required={isAddingBook}
                  />
                </label>
                <label className="license-confirmation">
                    <input
                      type="checkbox"
                      checked={editForm.licenseConfirmed}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          licenseConfirmed: event.target.checked,
                        })
                      }
                      required={isAddingBook || Boolean(editForm.pdfUrl.trim())}
                    />
                    <span>
                      PDF manbasi public domain yoki ochiq litsenziyali ekanini
                      tekshirdim.
                    </span>
                </label>
                <label className="license-confirmation">
                  <input
                    type="checkbox"
                    checked={editForm.isPublic}
                    onChange={(event) =>
                      setEditForm({ ...editForm, isPublic: event.target.checked })
                    }
                  />
                  <span>
                    {editForm.isPublic
                      ? "Kitob ommaviy katalogda ko‘rinadi va havolasi borlar ocha oladi."
                      : "Kitobni o‘zimning kutubxonamda saqlayman; ulashish tugmasini bossam ommaviy bo‘ladi."}
                  </span>
                </label>
                <label>
                  PDF kitob manbasi havolasi (majburiy)
                  <input
                    name="pdfUrl"
                    type="url"
                    value={editForm.pdfUrl}
                    onChange={(event) =>
                      setEditForm({ ...editForm, pdfUrl: event.target.value })
                    }
                    placeholder="https://ochiq-manba.uz/kitob.pdf"
                    required={isAddingBook}
                  />
                </label>
                {isAddingBook && (
                  <label className="license-confirmation">
                    <input
                      type="checkbox"
                      checked={editForm.licenseConfirmed}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          licenseConfirmed: event.target.checked,
                        })
                      }
                      required
                    />
                    <span>
                      Ushbu PDF public domain yoki ochiq litsenziya bilan
                      tarqatilishini tekshirdim va manba havolasini ko‘rsatdim.
                    </span>
                  </label>
                )}
                <label>
                  Muqova rasmini yuklash
                  <input
                    name="coverFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (!file) {
                    setSelectedImageFile(null);
                    return;
                  }
                  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                    setEditError("Faqat JPG, PNG yoki WebP formatidagi rasm tanlang.");
                    event.target.value = "";
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setEditError("Rasm hajmi 5 MB dan oshmasligi kerak.");
                    event.target.value = "";
                    return;
                  }
                  setEditError("");
                  setSelectedImageFile(file);
                    }}
                  />
                  {selectedImageFile && (
                    <small className="selected-image-name">
                      Tanlandi: {selectedImageFile.name}
                    </small>
                  )}
                </label>
                <p className="image-input-alternative">
                  Fayl tanlamasangiz, rasm havolasini kiriting. Fayl tanlansa,
                  havola o‘rniga shu rasm yuklanadi.
                </p>
                <label>
                  Muqova rasmi URL manzili
                  <input
                    name="imageUrl"
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(event) => {
                      setEditForm({ ...editForm, imageUrl: event.target.value });
                      setSelectedImageFile(null);
                    }}
                    placeholder="https://..."
                  />
                </label>
                <div className="edit-form-row">
                  <label>
                    Til
                    <input
                      name="language"
                      value={editForm.language}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          language: event.target.value,
                        })
                      }
                      minLength={2}
                      required
                    />
                  </label>
                  <label>
                    Holati
                    <input
                      name="status"
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm({ ...editForm, status: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="edit-form-row">
                  <label>
                    Reyting
                    <select
                      name="rating"
                      value={editForm.rating}
                      onChange={(event) =>
                        setEditForm({ ...editForm, rating: event.target.value })
                      }
                    >
                      <option value="">Reyting qo'yilmagan</option>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} / 5
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Janr / turi
                    <input
                      name="type"
                      value={editForm.type}
                      onChange={(event) =>
                        setEditForm({ ...editForm, type: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="edit-form-row">
                  <label>
                    Sahifalar
                    <input
                      name="pages"
                      value={editForm.pages}
                      onChange={(event) =>
                        setEditForm({ ...editForm, pages: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Narxi
                    <input
                      name="cost"
                      value={editForm.cost}
                      onChange={(event) =>
                        setEditForm({ ...editForm, cost: event.target.value })
                      }
                    />
                  </label>
                </div>

                {editError && (
                  <p className="edit-form-error" role="alert">
                    {editError}
                  </p>
                )}

                <div className="edit-form-actions">
                  <button
                    type="button"
                    className="edit-cancel-button"
                    onClick={closeEditForm}
                    disabled={isSavingEdit}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="edit-save-button"
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit
                      ? "Saqlanmoqda..."
                      : isAddingBook
                        ? "Kitobni qo‘shish"
                        : "O‘zgarishlarni saqlash"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {shareLink && (
          <div
            className="edit-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShareLink("");
            }}
            role="presentation"
          >
            <section
              className="edit-modal share-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-book-title"
            >
              <div className="edit-modal-heading">
                <div>
                  <p className="eyebrow">OCHIQ KITOB SAHIFASI</p>
                  <h2 id="share-book-title">Kitobni ulashing</h2>
                </div>
                <button
                  className="edit-modal-close"
                  type="button"
                  onClick={() => setShareLink("")}
                  aria-label="Yopish"
                >
                  ×
                </button>
              </div>
              <p className="share-description">
                Ushbu havolaga ega bo‘lgan har kim kitob ma’lumotlari va
                sharhlarni ko‘ra oladi.
              </p>
              <input
                className="share-link-input"
                readOnly
                value={shareLink}
                onFocus={(event) => event.target.select()}
                aria-label="Ulashish havolasi"
              />
              <div className="edit-form-actions">
                <button
                  className="edit-save-button"
                  type="button"
                  onClick={copyShareLink}
                >
                  {shareCopied ? "Havola nusxalandi" : "Havolani nusxalash"}
                </button>
              </div>
            </section>
          </div>
        )}
        {shareError && (
          <p className="error-message share-error" role="alert">
            {shareError}
          </p>
        )}

        <footer className="dashboard-footer">
          Kitoblaringiz, sizning hikoyangiz.
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
