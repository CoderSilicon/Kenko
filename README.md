![](./public/kenko.png)

# Kenko

**Find out what your symptoms could mean.**

Kenko takes what you type in, checks it against real health information, and
gives you one clear answer: what it might be, and what to do right now.

It is built to be understandable. Short sentences, no jargon, and one idea at
a time.

---

## What it does

**1. Danger signs come first.**
Before the AI is even asked, a plain word scanner looks for emergency signals
like chest pain, trouble breathing, stroke signs, heavy bleeding, a seizure or
an allergic reaction. If it finds one, the red banner appears no matter what
the AI said. Safety never depends on a language model being right.

**2. It tests your own guess.**
If you think it might be a migraine, Kenko says plainly whether that fits,
partly fits, or does not fit, and explains why.

**3. It asks you back.**
Two or three short follow-up questions are generated from what you described.
Answering them and tapping through re-runs the evaluation with better
information, which usually moves the answer around in a useful way.

**4. The reading is real, not invented.**
Each possible condition is looked up in the
[MedlinePlus Web service](https://wsearch.nlm.nih.gov/ws/query), a free service
of the U.S. National Library of Medicine. The app links to those pages instead
of writing its own medical advice. English and Spanish are both available.

**5. You can browse without asking anything.**
The **Learn** page lists conditions by body part (lungs, skin, tummy, mind and
so on) with a short plain description of each.

**6. It keeps a journal.**
Every result is saved, and you can add a daily check-in. A small chart shows
whether you are getting better or worse.

---

## Setup

```bash
npm install
cp .env.example .env.local     # then paste in your GEMINI_API_KEY
npm run dev
```

A free Gemini key is available from
[Google AI Studio](https://aistudio.google.com/apikey). MedlinePlus needs no
key and no registration.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Biome checks |

---

## How it is put together

| Path | What it holds |
| --- | --- |
| `app/api/evaluate` | Runs the red-flag scan, then the AI, then fetches reading |
| `app/api/followup` | Re-runs the evaluation with the follow-up answers |
| `app/api/learn` | Proxies the MedlinePlus Web service |
| `lib/redflags.ts` | The emergency word scanner. Pure, no dependencies, easy to test |
| `lib/medlineplus.ts` | XML parsing, rate limiting, cache lookups |
| `lib/db.ts` | The SQLite cache (24 hour expiry) |
| `lib/bodyAreas.ts` | The body areas on the Learn page, mapped to MedlinePlus groups |

### The SQLite cache

NLM asks every client to stay under 85 requests per minute and to cache
responses for 12 to 24 hours. Kenko does both: `lib/medlineplus.ts` caps itself
at 60 requests a minute, and every response is stored in a local SQLite file
for 24 hours. The file lives in `./data/` and is gitignored. If the database
cannot be opened, the app logs a warning and carries on uncached rather than
breaking.

Your journal is kept in your browser's local storage. It never leaves your
device and is not sent to the server.

---

> **Please remember:** Kenko is a learning tool, not a doctor. It cannot
> diagnose or treat you, and it can be wrong. Health information comes from
> MedlinePlus.gov, which does not endorse Kenko. If something feels dangerous,
> call your local emergency number straight away. For anything else, talk to a
> real healthcare professional.
