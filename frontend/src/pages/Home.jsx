import { useEffect } from "react";
import { useNavigate } from "react-router";
import { SignInButton, SignUpButton, useAuth } from "@clerk/react";

function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate("/discover", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <p className="eyebrow">KITOBXONLAR UCHUN YANGI MAKON</p>
        <h1>
          Kitoblar sizni
          <br />
          <span>yangi olamlarga olib boradi.</span>
        </h1>
        <p className="landing-description">
          Sevimli kitoblaringizni toping va kutubxonangizga qo‘shing. Fikr
          almashing, o‘qish uchun hamroh va kitobxonlar guruhini toping.
        </p>
        <div className="landing-actions">
          <SignUpButton mode="modal">
            <button className="landing-primary-button">Kutubxonamni yaratish</button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="landing-secondary-button">Hisobimga kirish</button>
          </SignInButton>
        </div>
      </section>

      <section className="landing-features" aria-label="BookWork imkoniyatlari">
        <article>
          <span aria-hidden="true">⌕</span>
          <h2>Toping</h2>
          <p>Turli janrlardagi kitoblarni izlang va o‘quvchilar tavsiyasini ko‘ring.</p>
        </article>
        <article>
          <span aria-hidden="true">▤</span>
          <h2>Yig‘ing</h2>
          <p>Shaxsiy kutubxonangizni yarating va o‘qish rejangizni saqlang.</p>
        </article>
        <article>
          <span aria-hidden="true">◎</span>
          <h2>Ulashib o‘qing</h2>
          <p>Sharh qoldiring, kitobxon do‘st toping va o‘qish guruhiga qo‘shiling.</p>
        </article>
      </section>
    </main>
  );
}

export default Home;
