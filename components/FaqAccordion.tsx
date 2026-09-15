"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-900/10 border-y border-ink-900/10">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open}
            >
              <span className="font-display font-medium text-ink-950">{item.question}</span>
              <Plus
                size={18}
                className={`shrink-0 text-signal-500 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
              />
            </button>
            {open && <p className="pb-5 text-sm text-ink-600 leading-relaxed pr-8">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
