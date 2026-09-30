"use client";

import { useState } from "react";

type Faq = { question: string; answer: string };

export default function AboutFaqClient({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="abt-faq-wrap">
      {faqs.map((faq, i) => (
        <div key={faq.question} className={`abt-faq-item${openIndex === i ? " open" : ""}`}>
          <button
            className="abt-faq-q"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span>{faq.question}</span>
            <span className="abt-faq-plus" aria-hidden="true">+</span>
          </button>
          <div className="abt-faq-a">
            <div>
              <p>{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
