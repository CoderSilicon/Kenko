import Link from "next/link";

const STEPS = [
  {
    icon: "1",
    title: "Tell us what hurts",
    desc: "Answer a few short questions. Skip anything you do not know.",
  },
  {
    icon: "2",
    title: "Add a photo",
    desc: "Optional. A clear photo of a rash or sore helps a lot.",
  },
  {
    icon: "3",
    title: "Get a clear answer",
    desc: "We show what it might be, and what to do right now.",
  },
  {
    icon: "4",
    title: "Watch how it changes",
    desc: "A quick daily check-in shows if you are getting better.",
  },
];

const ALSO = [
  {
    emoji: "🚨",
    title: "Danger signs come first",
    desc: "We check for emergency signs before anything else, so nothing scary gets missed.",
  },
  {
    emoji: "❓",
    title: "We ask you back",
    desc: "Two or three extra questions make the answer much more accurate.",
  },
  {
    emoji: "📚",
    title: "Real reading, not guesses",
    desc: "Links come from MedlinePlus, the U.S. National Library of Medicine.",
  },
];

export default function Home() {
  return (
    <div className="animate-in fade-in">
      {/* Hero */}
      <section className="flex min-h-svh items-center justify-center border-b border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-balance text-5xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Find out what your <span className="text-accent">symptoms</span>{" "}
            could mean.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-body sm:text-xl">
            Answer a few easy questions. Get a clear, honest answer you can
            actually use.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/evaluate" className="k-btn px-9 py-4 text-base">
              Check my symptoms
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/learn" className="k-btn-ghost px-7 py-4 text-base">
              Learn about a topic
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Takes about two minutes. Nothing to sign up for.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Four simple steps
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.icon}
              className="h-full rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-base font-bold text-accent-strong">
                {s.icon}
              </span>
              <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What makes it better */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Why trust it
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Built to be careful, not clever
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ALSO.map((f) => (
              <div
                key={f.title}
                className="h-full rounded-2xl border border-line bg-paper p-6"
              >
                <span aria-hidden="true" className="text-2xl">
                  {f.emoji}
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-accent px-8 py-12 text-center shadow-sm md:py-16">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Not sure if something is worth worrying about?
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/90">
            You will get an honest answer in about two minutes.
          </p>
          <Link
            href="/evaluate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-base font-semibold text-accent-strong shadow-sm transition-colors hover:bg-accent-soft"
          >
            Check my symptoms
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
