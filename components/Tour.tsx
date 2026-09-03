"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui";

/**
 * The first-run walkthrough.
 *
 * Written for a relative in their seventies who was sent a link, has never met
 * this app, and will decide in about a minute whether it is for them.
 *
 * Deliberate choices, all of which cost something:
 *
 *  - One idea per screen. Six short screens beat one dense one; a list of six
 *    things is read as "six things I have to remember".
 *  - The icons here are the same shapes as the real buttons, so the tour
 *    teaches recognition rather than instructions to memorise.
 *  - No pointing at live elements. Coach marks that anchor to a real button
 *    drift when the layout reflows, and land off-target on the phones most
 *    likely to need them.
 *  - "Skip" is always visible and never styled as the wrong answer. Someone
 *    who wants to poke around first should not have to defeat a tutorial.
 *  - It reopens from the help button, so skipping is not permanent.
 */

const STORAGE_KEY = "dynasty.tour.v1";

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const STEPS: Step[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="5" r="2.4" />
        <circle cx="5.5" cy="18" r="2.4" />
        <circle cx="18.5" cy="18" r="2.4" />
        <path d="M12 7.4V12m0 0l-5 3.8M12 12l5 3.8" />
      </svg>
    ),
    title: "This is your family tree",
    body: "Every person is a card, and the lines between them show how they're related. You can drag the tree around with one finger to see more of it.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    ),
    title: "Tap a person to read about them",
    body: "A panel opens with their dates, where they live, and who they're connected to. Tap the X at the top of that panel to close it again.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M12 5v14M5 12h14" strokeWidth="2.4" />
      </svg>
    ),
    title: "Add a relative with the + button",
    body: "It's at the top right of the screen. You'll be asked for their name, and who they're related to. A name on its own is enough to start — you can fill in the rest later.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: "Looking for someone in particular?",
    body: "Use the search box to type a name. Tap the result and the tree moves to them. This is the quickest way around a big family.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
      </svg>
    ),
    title: "This works best together",
    body: "Use Invite to send a relative their own link. They can add the parts of the family they remember — nobody has to know everything on their own.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.4M12 17h.01" />
      </svg>
    ),
    title: "Nothing here can be broken",
    body: "Every change records who made it, and the family can correct anything that looks wrong. If you get stuck, the ? button at the top brings this guide back.",
  },
];

export function Tour({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);

  // Restart from the top each time it opens, so reopening from the help
  // button isn't a resume into the middle of something.
  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Getting started"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="animate-rise flex w-full max-w-md flex-col rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-800/8 text-teal-800">
          <span className="block h-8 w-8">{step.icon}</span>
        </div>

        <h2 className="font-display mt-5 text-center text-2xl font-semibold leading-snug text-stone-900">
          {step.title}
        </h2>
        <p className="mt-3 text-center text-[17px] leading-relaxed text-stone-600">
          {step.body}
        </p>

        {/* Where you are, without asking anyone to count. */}
        <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === i ? "w-6 bg-teal-800" : "w-1.5 bg-stone-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton
            onClick={() => (last ? onClose() : setI(i + 1))}
            className="w-full !py-4 !text-base"
          >
            {last ? "Start using Dynasty" : "Next"}
          </PrimaryButton>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setI(Math.max(0, i - 1))}
              disabled={i === 0}
              className="rounded-xl px-4 py-3 text-[15px] font-medium text-stone-500 transition hover:text-stone-800 disabled:invisible"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-3 text-[15px] font-medium text-stone-500 transition hover:text-stone-800"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Whether this browser has been through the tour, and a way to mark it done.
 * Starts null so the first paint doesn't flash a tour at someone who has
 * already dismissed it.
 */
export function useTour() {
  const [seen, setSeen] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const done = window.localStorage.getItem(STORAGE_KEY) === "1";
    setSeen(done);
    if (!done) setOpen(true);
  }, []);

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setSeen(true);
    setOpen(false);
  };

  return { open, close, reopen: () => setOpen(true), seen };
}
