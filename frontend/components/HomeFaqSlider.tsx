"use client";

import { useRef, useState } from "react";

type Faq = { question: string; answer: string };

export default function HomeFaqSlider({ faqs }: { faqs: Faq[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const cardStep = (track: HTMLDivElement) => {
    const card = track.querySelector<HTMLElement>(".home-answer-card");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.offsetWidth + gap : track.clientWidth;
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(faqs.length - 1, index));
    track.scrollTo({ left: clamped * cardStep(track), behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    // With 2 cards in view the last card never reaches scrollLeft = index * step,
    // so treat hitting the right edge as "last card active".
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      setActive(faqs.length - 1);
      return;
    }
    setActive(Math.round(track.scrollLeft / cardStep(track)));
  };

  return (
    <div className="home-answer-slider reveal">
      <div
        className="home-answer-track"
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label="Techsara company facts"
      >
        {faqs.map((item) => (
          <article className="home-answer-card" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
      <div className="home-answer-nav">
        <div className="home-answer-dots">
          {faqs.map((item, i) => (
            <button
              type="button"
              key={item.question}
              className={i === active ? "is-active" : ""}
              aria-label={`Go to question ${i + 1} of ${faqs.length}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
