/**
 * Emergency red-flag scanner.
 *
 * This runs BEFORE the AI on purpose. The AI is good at reasoning, but it is a
 * language model: it can miss something scary or soften it into fine print.
 * This scanner is boring and literal. If the words say "crushing chest pain",
 * we tell the person to call for help no matter what the AI decided.
 *
 * Every rule here is a widely recognised "get help now" signal.
 */

import type { KenkoResult } from "./types";

export interface RedFlag {
  id: string;
  /** Shown in the banner. Keep it short. */
  title: string;
  /** Shown under the title. One or two short sentences. */
  advice: string;
  /** The phrases that triggered this rule. */
  matched: string[];
}

type Rule = {
  id: string;
  title: string;
  advice: string;
  /**
   * Any single group matching is enough (groups are alternatives, OR'd).
   * Set `requireAll: true` when every group must match, which is how we
   * avoid flagging "my knee hurts" just because the word "pregnant"
   * appears somewhere else in the report.
   */
  anyOf: string[][];
  requireAll?: boolean;
};

const RULES: Rule[] = [
  {
    id: "chest",
    title: "Chest pain that needs urgent help",
    advice:
      "Chest pain that crushes or spreads to your arm, jaw or back, especially with sweating or feeling sick, can be a heart attack.",
    anyOf: [
      [
        "chest pain",
        "pain in my chest",
        "chest hurts",
        "my chest hurts",
        "tightness in my chest",
        "tight chest",
        "chest pressure",
        "crushing chest",
        "crushing pain in my chest",
        "pain in the middle of my chest",
        "chest feels heavy",
        "pressure in my chest",
        "pain spreading to my arm",
        "pain spreading to my jaw",
        "pain spreading to my back",
      ],
    ],
  },
  {
    id: "breathing",
    title: "Serious trouble breathing",
    advice:
      "Not being able to breathe properly, or blue lips or fingertips, means you need help right now.",
    anyOf: [
      [
        "can't breathe",
        "cannot breathe",
        "cant breathe",
        "struggling to breathe",
        "struggling to breathe properly",
        "gasping",
        "gasping for air",
        "wheezing badly",
        "severe wheezing",
        "stopped breathing",
        "not breathing",
        "choking",
        "choke on",
        "shortness of breath that is severe",
        "severe shortness of breath",
      ],
      [
        "blue lips",
        "blue fingernails",
        "turning blue",
        "lips are blue",
        "my lips are blue",
        "going blue",
      ],
    ],
  },
  {
    id: "stroke",
    title: "Possible stroke signs",
    advice:
      "Sudden weakness on one side, a droopy face, slurred speech or sudden loss of sight can be a stroke. Every minute counts.",
    anyOf: [
      [
        "face drooping",
        "droopy face",
        "drooping face",
        "one side of my face",
        "face is sagging",
        "can't smile",
        "face looks uneven",
        "half my face",
      ],
      [
        "slurred speech",
        "speech is slurred",
        "can't speak properly",
        "trouble speaking",
        "confused speech",
        "words are slurred",
      ],
      [
        "sudden weakness",
        "can't move my arm",
        "cannot move my arm",
        "numb on one side",
        "one side is numb",
        "arm is weak",
        "can't lift my arm",
        "weakness on one side",
        "half my body",
      ],
      [
        "sudden vision loss",
        "sudden loss of vision",
        "lost vision",
        "blurry vision",
        "double vision",
        "can't see out of one eye",
      ],
    ],
  },
  {
    id: "unconscious",
    title: "Unresponsive or very confused",
    advice:
      "Someone who will not wake up, is very hard to wake, or is acting very confused needs help now.",
    anyOf: [
      [
        "unconscious",
        "won't wake up",
        "will not wake up",
        "wont wake up",
        "passed out",
        "unresponsive",
        "hard to wake",
        "hard to wake up",
        "not waking up",
        "cannot be woken",
      ],
      [
        "very confused",
        "confused and",
        "don't know where i am",
        "not making sense",
        "talking nonsense",
        "confused and disoriented",
      ],
    ],
  },
  {
    id: "bleeding",
    title: "Bleeding that will not stop",
    advice:
      "Heavy bleeding that does not stop, or bleeding from the head, needs help now.",
    anyOf: [
      [
        "bleeding heavily",
        "heavy bleeding",
        "won't stop bleeding",
        "wont stop bleeding",
        "so much blood",
        "pouring blood",
        "bleeding from the head",
        "bleeding from my ear",
        "blood everywhere",
        "bleeding a lot",
      ],
    ],
  },
  {
    id: "severe_burn",
    title: "Bad burn or electric shock",
    advice:
      "A deep or large burn, or any electric shock, needs emergency care.",
    anyOf: [
      [
        "deep burn",
        "severe burn",
        "burn is blistering",
        "burnt badly",
        "badly burned",
        "electric shock",
        "electrocuted",
        "electrocuted myself",
      ],
    ],
  },
  {
    id: "poison",
    title: "Ate or drank something dangerous",
    advice:
      "Swallowing something poisonous, too many pills, or too much alcohol needs help now.",
    anyOf: [
      [
        "swallowed",
        "ate something",
        "drank something",
        "poison",
        "poisoned",
        "poisoning",
        "took too many pills",
        "overdose",
        "overdosed",
        "too much alcohol",
        "drank too much",
      ],
    ],
  },
  {
    id: "seizure",
    title: "Seizure or fit",
    advice: "A seizure, a fit, or shaking you cannot control needs help now.",
    anyOf: [
      [
        "seizure",
        "seizures",
        "having a fit",
        "had a fit",
        "convulsion",
        "convulsions",
        "shaking uncontrollably",
        "shaking and can't stop",
      ],
    ],
  },
  {
    id: "child_fever",
    title: "Very sick child",
    advice:
      "A child who is hard to wake, has a rash that does not fade when you press it, or is floppy and limp needs help right now.",
    anyOf: [
      [
        "rash that doesn't fade",
        "rash that does not fade",
        "rash won't fade",
        "rash does not fade when pressed",
        "non blanching rash",
        "purple rash",
        "rash that doesn't blanch",
      ],
      [
        "limp",
        "floppy",
        "soft and floppy",
        "won't stop crying",
        "crying all the time",
        "not responding",
        "unresponsive baby",
      ],
    ],
  },
  {
    id: "dehydration",
    title: "Very dehydrated",
    advice:
      "No urine for a whole day, sunken eyes, or a baby with no wet nappies needs same-day medical help.",
    anyOf: [
      [
        "no urine",
        "haven't peed",
        "no wet nappy",
        "no wet diaper",
        "no urine for a day",
        "sunken eyes",
        "very dry mouth",
        "hasn't urinated",
      ],
    ],
  },
  {
    id: "allergic",
    title: "Bad allergic reaction",
    advice:
      "A swollen tongue, lips or throat, or trouble breathing after a sting, medicine or food, needs help now.",
    anyOf: [
      [
        "swollen tongue",
        "swollen lips",
        "swelling in my throat",
        "throat is closing",
        "throat is swelling",
        "throat feels closing",
        "anaphylaxis",
        "anaphylactic",
        "lips are swelling",
        "face is swelling after eating",
      ],
    ],
  },
  {
    id: "severe_pain",
    title: "Pain that is unbearable",
    advice:
      "The worst pain you have ever had, especially in the belly, needs urgent medical attention.",
    anyOf: [
      [
        "worst pain of my life",
        "worst pain i have ever had",
        "unbearable pain",
        "excruciating pain",
        "worst headache of my life",
        "worst pain ever",
        "agony",
        "cannot bear the pain",
      ],
    ],
  },
  {
    id: "pregnancy",
    title: "Worrying signs in pregnancy",
    advice:
      "Bleeding, bad belly pain, or leaking fluid while pregnant needs urgent medical help.",
    anyOf: [
      [
        "pregnant",
        "pregnancy",
        "i'm pregnant",
        "i am pregnant",
        "i'm pregnant again",
      ],
      [
        "bleeding while pregnant",
        "bleeding in pregnancy",
        "severe abdominal pain while pregnant",
        "fluid leaking while pregnant",
        "stomach pain while pregnant",
        "belly pain while pregnant",
        "bleeding and pregnant",
      ],
    ],
    requireAll: true,
  },
];

/**
 * Lowercase, drop punctuation (but keep apostrophes so "can't" survives),
 * collapse spaces, then pad so a phrase can match inside a sentence.
 */
function normalise(text: string): string {
  const flat = text
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${flat} `;
}

function has(text: string, phrase: string): boolean {
  return text.includes(normalise(phrase));
}

function findMatches(text: string, rule: Rule): string[] {
  const found: string[] = [];
  for (const group of rule.anyOf) {
    const hit = group.find((phrase) => has(text, phrase));
    if (hit) found.push(hit);
  }
  if (rule.requireAll) return found.length === rule.anyOf.length ? found : [];
  return found.length > 0 ? found : [];
}

/** Scans free text and returns every danger sign it can see. */
export function scanRedFlags(
  ...inputs: Array<string | null | undefined>
): RedFlag[] {
  const text = normalise(
    inputs
      .filter((t): t is string => typeof t === "string" && t.length > 0)
      .join(" . "),
  );
  const flags: RedFlag[] = [];

  for (const rule of RULES) {
    const matched = findMatches(text, rule);
    if (matched.length > 0) {
      flags.push({
        id: rule.id,
        title: rule.title,
        advice: rule.advice,
        matched,
      });
    }
  }

  return flags;
}

/**
 * A confirmed danger sign always wins. Whatever the AI decided about the
 * emergency flag, the warning text, or the level of care, a word-scanner
 * hit forces all three to the most urgent setting.
 */
export function applyRedFlagOverride<T extends KenkoResult>(
  result: T,
  flags: RedFlag[],
): T {
  if (flags.length === 0) return result;
  const first = flags[0];
  return {
    ...result,
    is_emergency: true,
    emergency_warning:
      result.emergency_warning ?? `${first.title}. ${first.advice}`,
    triage_level: "Immediate Emergency Care",
  };
}
