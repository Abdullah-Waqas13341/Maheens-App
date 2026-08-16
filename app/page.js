"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TAUNTS = [
  "Go on. Click one. No pressure. 😊",
  "Hey! Where do you think you're going? 🏃",
  "The No button has commitment issues.",
  "Nope. Try again, slowpoke. 🐌",
  "You cannot catch what does not want to be caught. 🧘",
  "Bro is really out here fighting a button. 💀",
  "The button has filed a restraining order.",
  "Even your WiFi is faster than that click.",
  "No has left the chat. Twice.",
  "Plot twist: the answer was always Yes. 💚",
  "Your mouse is tired. Abdullah is not.",
  "10 attempts?! This is a cry for help.",
  "Fine. Keep trying. I've got all day. ⏳",
  "The No button is now legally a bird. 🐦",
  "Just click Yes. Your wrist will thank you.",
];

// The No button shrinks a little as you chase it, but stays comfortably
// tappable — it should look worn down, never turn into a pinhead.
const MIN_SCALE = 0.8;
const SHRINK_PER_DODGE = 0.012;

export default function Home() {
  const [dodges, setDodges] = useState(0);
  const [taunt, setTaunt] = useState(TAUNTS[0]);
  const [loose, setLoose] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const noRef = useRef(null);
  const yesRef = useRef(null);

  /** Teleport the No button to a random spot far from wherever the cursor is. */
  const flee = useCallback(
    (cursorX, cursorY) => {
      const btn = noRef.current;
      if (!btn) return;

      // Measure the unscaled box so the shrink doesn't skew the math.
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      const pad = 10;
      const maxX = Math.max(pad, window.innerWidth - w - pad);
      const maxY = Math.max(pad, window.innerHeight - h - pad);

      // Never park on top of the Yes button — that would block the only
      // button that actually works.
      const yesBox = yesRef.current?.getBoundingClientRect();

      // Sample random spots and keep the best one: far from the cursor, and
      // not overlapping Yes. Also require a real hop so it never nudges 5px.
      const minHop = Math.min(window.innerWidth, window.innerHeight) * 0.28;
      let best = null;

      for (let i = 0; i < 24; i++) {
        const x = pad + Math.random() * (maxX - pad);
        const y = pad + Math.random() * (maxY - pad);
        const cx = x + w / 2;
        const cy = y + h / 2;

        if (yesBox) {
          const overlaps =
            x < yesBox.right + 16 &&
            x + w > yesBox.left - 16 &&
            y < yesBox.bottom + 16 &&
            y + h > yesBox.top - 16;
          if (overlaps) continue;
        }

        const dist = Math.hypot(cx - cursorX, cy - cursorY);
        // Prefer a visible leap over a twitch.
        const hop = Math.hypot(x - pos.x, y - pos.y);
        const score = dist + (hop > minHop ? 220 : 0);

        if (!best || score > best.score) best = { x, y, score };
      }

      if (!best) best = { x: pad, y: pad, score: 0 };

      // On the first dodge it pops out of the flex row into fixed positioning.
      if (!loose) setLoose(true);
      setPos({ x: best.x, y: best.y });

      setDodges((n) => {
        const next = n + 1;
        setTaunt(TAUNTS[Math.min(next, TAUNTS.length - 1)]);
        return next;
      });
    },
    [loose, pos.x, pos.y]
  );

  // Proximity dodge: bail out before the cursor ever lands on it.
  useEffect(() => {
    if (won) return;

    const onMove = (e) => {
      const btn = noRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      // Scale the panic radius to the viewport so it feels the same on a
      // laptop and a small window, and never exceeds the button's own size
      // by so much that it dodges from across the screen.
      const radius = Math.max(90, Math.min(150, window.innerWidth * 0.12));
      if (dist < radius) flee(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [flee, won]);

  // On rotate/resize the button can end up off-screen — pull it back in.
  useEffect(() => {
    if (!loose || won) return;

    const onResize = () => {
      const btn = noRef.current;
      if (!btn) return;
      const pad = 10;
      const maxX = Math.max(pad, window.innerWidth - btn.offsetWidth - pad);
      const maxY = Math.max(pad, window.innerHeight - btn.offsetHeight - pad);
      setPos((p) => ({
        x: Math.min(Math.max(pad, p.x), maxX),
        y: Math.min(Math.max(pad, p.y), maxY),
      }));
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [loose, won]);

  // Touch devices have no hover, so dodge on tap/drag instead.
  const onNoTouch = (e) => {
    e.preventDefault();
    const t = e.touches?.[0] ?? e.changedTouches?.[0];
    flee(t?.clientX ?? window.innerWidth / 2, t?.clientY ?? window.innerHeight / 2);
  };

  const onYes = () => {
    setWon(true);
    const pieces = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      duration: 2.4 + Math.random() * 2.2,
      size: 8 + Math.random() * 12,
      color: ["#ff2e88", "#ffe600", "#22e06a", "#00d4ff", "#a24bff", "#ff8a00"][
        Math.floor(Math.random() * 6)
      ],
    }));
    setConfetti(pieces);
  };

  const reset = () => {
    setWon(false);
    setConfetti([]);
    setDodges(0);
    setLoose(false);
    setTaunt(TAUNTS[0]);
  };

  const scale = Math.max(MIN_SCALE, 1 - dodges * SHRINK_PER_DODGE);

  if (won) {
    return (
      <>
        <div className="bg" />
        {confetti.map((c) => (
          <div
            key={c.id}
            className="confetti"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 0.6,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
        <main className="stage win">
          <div className="emoji">🎉👑🎉</div>
          <h1 className="title">
            CORRECT ANSWER!<br />
            <span className="name">Abdullah</span> wins again.
          </h1>
          <div className="certificate">
            <h2>🏆 OFFICIAL CERTIFICATE 🏆</h2>
            <p>
              This certifies that <strong>Abdullah</strong> is, beyond any
              reasonable doubt, the <strong>coolest cousin</strong> in the entire
              extended family — including the ones we only see at weddings.
            </p>
            <p>
              You resisted for <strong>{dodges}</strong>{" "}
              {dodges === 1 ? "dodge" : "dodges"} before accepting the truth.
              {dodges === 0
                ? " Instant recognition. Respect. 🫡"
                : dodges > 10
                ? " That was genuinely embarrassing to watch. 💀"
                : " Took you long enough. 😌"}
            </p>
            <div className="sig">
              Notarized by the Cousin Council · No refunds · No takebacks
            </div>
          </div>
          <button className="btn again" onClick={reset}>
            🔁 Ask me again (I'll still say yes)
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg" />
      <main className="stage">
        <div className="emoji">🤨</div>
        <h1 className="title">
          Is <span className="name">Abdullah</span> your coolest cousin?
        </h1>
        <div className="taunt">{taunt}</div>

        <div className="buttons">
          <button ref={yesRef} className="btn yes" onClick={onYes}>
            YES, obviously 💚
          </button>

          <button
            ref={noRef}
            className={`btn no${loose ? " loose" : ""}`}
            onClick={(e) => flee(e.clientX, e.clientY)}
            onTouchStart={onNoTouch}
            style={
              loose
                ? {
                    transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
                    opacity: Math.max(0.72, 1 - dodges * 0.012),
                  }
                : undefined
            }
          >
            no 🙄
          </button>
        </div>

        {dodges > 0 && (
          <div className="counter">
            Failed attempts: {dodges} {dodges > 6 ? "😭" : "😏"}
          </div>
        )}
        <div className="hint">psst — one of these buttons is a coward</div>
      </main>
    </>
  );
}
