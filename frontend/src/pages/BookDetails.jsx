import { SignInButton, useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  createBookPost,
  getBookDetails,
  getPublicBook,
  recordBookRead,
  saveBookReview,
} from "../api/client";

function BookDetails() {
  const { id } = useParams();
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const [bookResource, setBookResource] = useState({
    id: null,
    book: null,
    error: "",
  });
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);
  const [readError, setReadError] = useState("");
  const [postKind, setPostKind] = useState("THOUGHT");
  const [postContent, setPostContent] = useState("");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postError, setPostError] = useState("");

  useEffect(() => {
    let active = true;
    if (!isAuthLoaded) {
      return () => {
        active = false;
      };
    }

    const load = isSignedIn
      ? getToken().then((token) => getBookDetails(token, id))
      : getPublicBook(id);
    load
      .then((item) => {
        if (active) {
          setBookResource({ id, book: item, error: "" });
          setCoverFailed(false);
          setReadError("");
        }
      })
      .catch(() => {
        if (active) {
          setBookResource({
            id,
            book: null,
            error: "Bu kitob topilmadi yoki havolasi noto‘g‘ri.",
          });
        }
      })

    return () => {
      active = false;
    };
  }, [getToken, id, isAuthLoaded, isSignedIn]);
  const isLoading = bookResource.id !== id;
  const book = isLoading ? null : bookResource.book;
  const error = isLoading ? "" : bookResource.error;
  const featuredExcerpt = book?.posts.find(
    (post) => post.kind === "QUOTE" && post.excerpt?.trim(),
  );

  const submitReview = async (event) => {
    event.preventDefault();
    setIsSavingReview(true);
    setReviewError("");
    try {
      const token = await getToken();
      const review = await saveBookReview(token, id, {
        content: reviewText,
        rating: reviewRating ? Number(reviewRating) : null,
      });
      setBookResource((resource) => {
        const current = resource.book;
        if (!current) return resource;
        const reviews = [
          review,
          ...(current.reviews || []).filter((item) => item.id !== review.id),
        ];
        return { ...resource, book: {
          ...current,
          reviews,
          _count: { ...current._count, reviews: reviews.length },
        } };
      });
      setReviewText("");
      setReviewRating("");
    } catch (submitError) {
      setReviewError(
        submitError.response?.data?.error?.[0]?.message ||
          "Sharhni saqlab bo‘lmadi. Qayta urinib ko‘ring.",
      );
    } finally {
      setIsSavingReview(false);
    }
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setIsSavingPost(true);
    setPostError("");
    try {
      const token = await getToken();
      const post = await createBookPost(token, id, {
        kind: postKind,
        content: postContent,
        excerpt: postKind === "QUOTE" ? postExcerpt : null,
        location: postLocation || null,
      });
      setBookResource((resource) => {
        if (!resource.book) return resource;
        const posts = [post, ...(resource.book.posts || [])].slice(0, 100);
        return {
          ...resource,
          book: {
            ...resource.book,
            posts,
            _count: { ...resource.book._count, posts: (resource.book._count?.posts || 0) + 1 },
          },
        };
      });
      setPostContent("");
      setPostExcerpt("");
      setPostLocation("");
    } catch (submitError) {
      setPostError(
        submitError.response?.data?.error?.[0]?.message ||
          submitError.response?.data?.error ||
          "Postni saqlab bo‘lmadi. Qayta urinib ko‘ring.",
      );
    } finally {
      setIsSavingPost(false);
    }
  };

  if (isLoading) {
    return <main className="platform-page"><p className="library-message">Kitob ochilmoqda...</p></main>;
  }
  if (error || !book) {
    return <main className="platform-page"><p className="library-message library-error">{error}</p></main>;
  }

  return (
    <main className="platform-page">
      <article className="book-detail">
        <Link className="back-link" to="/discover">← Kitoblar ro‘yxatiga qaytish</Link>
        <div className="book-detail-layout">
          {book.imageUrl && !coverFailed ? (
            <img
              className="book-detail-cover"
              src={book.imageUrl}
              alt={`${book.title} muqovasi`}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="book-detail-cover cover-placeholder" aria-hidden="true">📖</div>
          )}
          <div className="book-detail-copy">
            <p className="eyebrow">{book.type || "KITOB"}</p>
            <h1>{book.title}</h1>
            <p className="book-detail-author">{book.author}</p>
            <p className="book-detail-description">{book.description || "Bu kitob uchun tavsif kiritilmagan."}</p>
            <div className="detail-stats">
              <span>{book.language}</span>
              {book.pages && <span>{book.pages} sahifa</span>}
              <span className="detail-reading-count"><strong>{book.viewCount}</strong> marta ko‘rilgan</span>
              <span className="detail-reading-count"><strong>{book.readCount}</strong> marta o‘qish havolasi ochilgan</span>
              <span>{book._count.posts} kitobxon posti</span>
              <span>{book._count.reviews} sharh</span>
            </div>
            {book.pdfUrl && book.licenseConfirmed && (
              <a
                className="primary-action pdf-link"
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setReadError("");
                  getToken()
                    .then((token) => recordBookRead(isSignedIn ? token : null, id))
                    .then(({ readCount }) => {
                      setBookResource((resource) => resource.book
                        ? { ...resource, book: { ...resource.book, readCount } }
                        : resource);
                    })
                    .catch(() => setReadError("O‘qish havolasini ochdik, lekin o‘qishlar sonini yangilab bo‘lmadi."));
                }}
              >
                Kitobni o‘qish ↗
              </a>
            )}
            {readError && <p className="error-message" role="alert">{readError}</p>}
            <a className="primary-action channel-jump" href="#book-channel">
              Kitobxonlar postlarini ko‘rish ↓
            </a>
            {!book.pdfUrl && <p className="muted-copy">Kitobni o‘qish havolasi hali qo‘shilmagan.</p>}
            {book.pdfUrl && !book.licenseConfirmed && (
              <p className="muted-copy">Havola ochiq litsenziyali ekani tasdiqlanmagani uchun ko‘rsatilmaydi.</p>
            )}
          </div>
        </div>

        {featuredExcerpt && (
          <section className="featured-book-excerpt" aria-label="Kitobxonlar ulashgan tavsiya etilgan parcha">
            <div className="featured-excerpt-heading">
              <span aria-hidden="true">“</span>
              <div>
                <p className="eyebrow">KITOBXONLAR ULASHGAN PARCHA</p>
                <h2>O‘quvchini qiziqtirgan parcha</h2>
              </div>
            </div>
            <blockquote>{featuredExcerpt.excerpt}</blockquote>
            <div className="featured-excerpt-footer">
              <span>
                {featuredExcerpt.reader.displayName}
                {featuredExcerpt.location ? ` · ${featuredExcerpt.location}` : ""}
              </span>
              <a href="#book-channel">Barcha postlarni ko‘rish ↓</a>
            </div>
          </section>
        )}
        {!featuredExcerpt && (
          <section className="featured-book-excerpt featured-excerpt-empty">
            <div className="featured-excerpt-heading">
              <span aria-hidden="true">“</span>
              <div>
                <p className="eyebrow">SIZNI O‘QISHGA UNDAGAN JOY</p>
                <h2>Sevimli parchani kitobxonlar bilan ulashing</h2>
              </div>
            </div>
            <p className="muted-copy">Bu kitobdan hali parcha ulashilmagan. Birinchi bo‘lib yoqqan joyingizni qoldiring.</p>
            <a href="#book-channel">Kitob kanaliga o‘tish ↓</a>
          </section>
        )}

        <section className="book-channel" id="book-channel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">KITOBXONLAR HAMJAMIYATI</p>
              <h2>“{book.title}” kitobxonlar kanali</h2>
              <p className="muted-copy">Parcha ulashing, yoqqan joyingiz yoki taassurotingiz haqida yozing.</p>
            </div>
            <span className="channel-count">{book._count.posts} post</span>
          </div>
          {isSignedIn ? (
            <form className="book-post-form" onSubmit={submitPost}>
              <label>
                Post turi
                <select value={postKind} onChange={(event) => setPostKind(event.target.value)}>
                  <option value="THOUGHT">Fikrim yoki taassurotim</option>
                  <option value="QUOTE">Kitobdan parcha</option>
                </select>
              </label>
              {postKind === "QUOTE" && (
                <label>
                  Kitobdan parcha
                  <textarea
                    value={postExcerpt}
                    onChange={(event) => setPostExcerpt(event.target.value)}
                    maxLength={1200}
                    placeholder="Sizga yoqqan parchani yozing"
                    required
                  />
                </label>
              )}
              <label>
                {postKind === "QUOTE" ? "Parcha haqida fikringiz" : "Post"}
                <textarea
                  value={postContent}
                  onChange={(event) => setPostContent(event.target.value)}
                  minLength={3}
                  maxLength={2000}
                  placeholder={postKind === "QUOTE" ? "Bu parcha sizga nima uchun yoqdi?" : "Kitobning qaysi jihati sizga yoqdi?"}
                  required
                />
              </label>
              <label>
                Sahifa yoki bob (ixtiyoriy)
                <input
                  value={postLocation}
                  onChange={(event) => setPostLocation(event.target.value)}
                  maxLength={100}
                  placeholder="Masalan: 42-sahifa yoki 3-bob"
                />
              </label>
              {postError && <p className="error-message" role="alert">{postError}</p>}
              <button className="primary-action" type="submit" disabled={isSavingPost}>
                {isSavingPost ? "Yuborilmoqda..." : "Kanalga joylash"}
              </button>
            </form>
          ) : (
            <p className="muted-copy">
              Post yozish uchun <SignInButton mode="modal"><button className="inline-link">tizimga kiring</button></SignInButton>.
            </p>
          )}
          <div className="book-post-list">
            {book.posts.map((post) => (
              <article className="book-post-card" key={post.id}>
                <div className="book-post-heading">
                  <strong>{post.reader.displayName}</strong>
                  <span>{post.kind === "QUOTE" ? "PARCHA" : "FIKR"}</span>
                </div>
                {post.excerpt && <blockquote>{post.excerpt}</blockquote>}
                <p>{post.content}</p>
                <div className="book-post-meta">
                  {post.location && <span>{post.location}</span>}
                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("uz-UZ")}</time>
                </div>
              </article>
            ))}
            {book.posts.length === 0 && <p className="muted-copy">Hozircha post yo‘q. Birinchi taassurotingizni ulashing.</p>}
          </div>
        </section>

        <section className="reviews-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">KITOBXONLAR FIKRI</p>
              <h2>Sharhlar</h2>
            </div>
          </div>
          {isSignedIn ? (
            <form className="review-form" onSubmit={submitReview}>
              <label>
                Fikringiz
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  minLength={3}
                  maxLength={2000}
                  placeholder="Kitob sizga qanday taassurot qoldirdi?"
                  required
                />
              </label>
              <label>
                Baho
                <select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}>
                  <option value="">Bahosiz</option>
                  {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                </select>
              </label>
              {reviewError && <p className="error-message" role="alert">{reviewError}</p>}
              <button className="primary-action" type="submit" disabled={isSavingReview}>
                {isSavingReview ? "Yuborilmoqda..." : "Sharh qoldirish"}
              </button>
            </form>
          ) : (
            <p className="muted-copy">
              Sharh qoldirish uchun <SignInButton mode="modal"><button className="inline-link">tizimga kiring</button></SignInButton>.
            </p>
          )}
          <div className="review-list">
            {book.reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-heading">
                  <strong>{review.reader.displayName}</strong>
                  {review.rating && <span>★ {review.rating}/5</span>}
                </div>
                <p>{review.content}</p>
                <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("uz-UZ")}</time>
              </article>
            ))}
            {book.reviews.length === 0 && <p className="muted-copy">Hali sharh yo‘q. Birinchi bo‘lib fikr bildiring.</p>}
          </div>
        </section>
      </article>
    </main>
  );
}

export default BookDetails;
