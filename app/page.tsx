import Link from "next/link";

const FEATURES = [
  {
    icon: "01",
    title: "Guided questions",
    desc: "Describe how you feel, one step at a time.",
  },
  {
    icon: "02",
    title: "Photo scanning",
    desc: "Add a photo of a rash, skin issue, or throat.",
  },
  {
    icon: "03",
    title: "Your guess, tested",
    desc: "We check whether your theory holds up.",
  },
  {
    icon: "04",
    title: "Tracks over time",
    desc: "Daily check-ins to spot symptom trends.",
  },
];


export default function Home() {
  return (
    <div className="animate-in fade-in">
      {/* Hero */}
      <section className="flex min-h-svh items-center justify-center border-b border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-balance text-5xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Understand what your <span className="text-accent">symptoms</span>{" "}
            are telling you.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-body sm:text-xl">
            Answer a few focused questions, add optional photos, and get a
            plain-language evaluation you can act on.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/evaluate" className="k-btn px-9 py-4 text-base">
              Start evaluation
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/journal" className="k-btn-ghost px-7 py-4 text-base">
              View journal
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            What to expect
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            One mindful check-in, every time
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.icon}
              className="h-full rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-sm font-bold text-accent-strong">
                {f.icon}
              </span>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 md:pb-24">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-accent px-8 py-12 text-center shadow-sm md:py-16">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Not sure if something is worth worrying about?
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/90">
            An honest evaluation in about two minutes.
          </p>
          <Link
            href="/evaluate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-base font-semibold text-accent-strong shadow-sm transition-colors hover:bg-accent-soft"
          >
            Start your evaluation
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
