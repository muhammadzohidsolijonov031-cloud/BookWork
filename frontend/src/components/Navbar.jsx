import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/react";
import { readingQuotes } from "../data/quotes";
import { getNotifications, markNotificationRead } from "../api/client";

function Navbar() {
  const { getToken, isSignedIn } = useAuth();
  const [quoteIndex] = useState(() =>
    Math.floor(Math.random() * readingQuotes.length),
  );
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem("bookwork-theme") === "dark",
  );

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("bookwork-theme", theme);
  }, [isDarkMode]);

  useEffect(() => {
    if (!isSignedIn) return undefined;
    let active = true;
    const loadNotifications = async () => {
      try {
        const token = await getToken();
        const items = await getNotifications(token);
        if (active) {
          setNotifications(items);
          setNotificationError("");
        }
      } catch {
        if (active) setNotificationError("Bildirishnomalarni yuklab bo‘lmadi.");
      }
    };
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [getToken, isSignedIn]);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-asosiy font-semibold"
      : "text-matn hover:text-asosiy transition";
  const quote = readingQuotes[quoteIndex];
  const unreadCount = isSignedIn
    ? notifications.filter((notification) => !notification.readAt).length
    : 0;
  const notificationHref = (notification) => {
    if (notification.type === "GROUP_MEMBER_ADDED" && notification.data?.groupId) {
      return `/chat?group=${notification.data.groupId}`;
    }
    if (notification.type === "PARTNER_ADDED" && notification.data?.partnerId) {
      return `/chat?partner=${encodeURIComponent(notification.data.partnerId)}`;
    }
    return "/chat";
  };

  const handleNotificationOpen = async (notification) => {
    if (notification.readAt) return;
    try {
      const token = await getToken();
      await markNotificationRead(token, notification.id);
      setNotifications((items) => items.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
      ));
    } catch {
      setNotificationError("Bildirishnomani o‘qilgan deb belgilab bo‘lmadi.");
    }
  };

  return (
    <header className="navbar-shell">
      <div className="navbar-frame">
        <Link to="/" className="font-heading text-xl text-matn">
          BookWork
        </Link>

        <button
          className="navbar-quote"
          type="button"
          onClick={() => setIsQuoteOpen(true)}
          aria-label="Iqtibos manbasi haqida ma'lumot"
        >
          <span>“{quote.text}”</span>
          <small>— {quote.author}</small>
        </button>

        <nav className="flex items-center gap-6">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDarkMode((currentMode) => !currentMode)}
            aria-label={isDarkMode ? "Yorug' rejimni yoqish" : "Qorong'i rejimni yoqish"}
            aria-pressed={isDarkMode}
            title={isDarkMode ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            <span aria-hidden="true">{isDarkMode ? "☀" : "☾"}</span>
            <span className="theme-toggle-label">
              {isDarkMode ? "Yorug‘" : "Qorong‘i"}
            </span>
          </button>

          <Show when="signed-in">
            <NavLink to="/discover" className={linkClass}>
              Kitoblar
            </NavLink>
            <NavLink to="/recommendations" className={linkClass}>
              Tavsiyalar
            </NavLink>
            <NavLink to="/community" className={linkClass}>
              Hamjamiyat
            </NavLink>
            <NavLink to="/chat" className={linkClass}>
              Chat
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Kutubxonam
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <div className="notification-menu">
              <button
                className="notification-toggle"
                type="button"
                aria-label={`Bildirishnomalar${unreadCount ? `, ${unreadCount} ta o‘qilmagan` : ""}`}
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((open) => !open)}
              >
                <span aria-hidden="true">♧</span>
                <span>Bildirishnomalar</span>
                {unreadCount > 0 && <b>{unreadCount > 9 ? "9+" : unreadCount}</b>}
              </button>
              {isNotificationsOpen && (
                <section className="notification-panel" aria-label="Bildirishnomalar ro‘yxati">
                  <div className="notification-panel-heading">
                    <strong>Bildirishnomalar</strong>
                    <button type="button" onClick={() => setIsNotificationsOpen(false)} aria-label="Yopish">×</button>
                  </div>
                  {notificationError && <p className="error-message">{notificationError}</p>}
                  {notifications.length ? notifications.map((notification) => (
                    <Link
                      className={`notification-item ${notification.readAt ? "" : "notification-unread"}`}
                      to={notificationHref(notification)}
                      key={notification.id}
                      onClick={() => {
                        handleNotificationOpen(notification);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      <span className="notification-dot" aria-hidden="true" />
                      <span>
                        <span>{notification.message}</span>
                        <small>{new Date(notification.createdAt).toLocaleString("uz-UZ")}</small>
                      </span>
                    </Link>
                  )) : <p className="muted-copy notification-empty">Hozircha bildirishnoma yo‘q.</p>}
                </section>
              )}
            </div>
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-matn hover:text-asosiy font-medium transition">
                Kirish
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-out">
            <SignUpButton when="signed-out" mode="modal">
              <button className="bg-archazor text-ohaktosh px-4 py-2 rounded-lg hover:opacity-90 transition font-medium">
                Ro'yxatdan o'tish
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-out">
            <UserButton afterSignOutUrl="/" />
          </Show>

          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </nav>

        {isQuoteOpen && (
          <div
            className="quote-dialog-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsQuoteOpen(false);
            }}
            role="presentation"
          >
            <section
              className="quote-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-dialog-title"
            >
              <button
                className="quote-dialog-close"
                type="button"
                onClick={() => setIsQuoteOpen(false)}
                aria-label="Yopish"
              >
                ×
              </button>
              <p className="eyebrow">KITOBDAN IQTIBOS</p>
              <h2 id="quote-dialog-title">“{quote.uzbek}”</h2>
              <p className="quote-dialog-original">“{quote.text}”</p>
              <p className="quote-dialog-source">
                {quote.author} · <em>{quote.book}</em> · {quote.year}
              </p>
            </section>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
