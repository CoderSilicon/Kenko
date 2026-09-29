/**
 * Body areas for the "Learn" page. Each one points at an official
 * MedlinePlus health-topic group, verified against the live service.
 */
export interface BodyArea {
  id: string;
  label: string;
  kidLabel: string;
  emoji: string;
  group: string;
}

export const BODY_AREAS: BodyArea[] = [
  {
    id: "lungs",
    label: "Lungs & Breathing",
    kidLabel: "Breathing and lungs",
    emoji: "🫁",
    group: "Lungs and Breathing",
  },
  {
    id: "heart",
    label: "Heart & Blood",
    kidLabel: "Heart and blood",
    emoji: "❤️",
    group: "Blood, Heart and Circulation",
  },
  {
    id: "stomach",
    label: "Tummy & Digestion",
    kidLabel: "Tummy and digestion",
    emoji: "🫃",
    group: "Digestive System",
  },
  {
    id: "skin",
    label: "Skin, Hair & Nails",
    kidLabel: "Skin, hair and nails",
    emoji: "🧴",
    group: "Skin, Hair and Nails",
  },
  {
    id: "head",
    label: "Head, Brain & Nerves",
    kidLabel: "Head, brain and nerves",
    emoji: "🧠",
    group: "Brain and Nerves",
  },
  {
    id: "eyes",
    label: "Eyes & Vision",
    kidLabel: "Eyes and seeing",
    emoji: "👁️",
    group: "Eyes and Vision",
  },
  {
    id: "mouth",
    label: "Mouth, Nose & Throat",
    kidLabel: "Mouth, nose and throat",
    emoji: "👄",
    group: "Ear, Nose and Throat",
  },
  {
    id: "bones",
    label: "Bones, Joints & Muscles",
    kidLabel: "Bones, joints and muscles",
    emoji: "🦴",
    group: "Bones, Joints and Muscles",
  },
  {
    id: "kidneys",
    label: "Kidneys & Urine",
    kidLabel: "Kidneys and pee",
    emoji: "💧",
    group: "Kidneys and Urinary System",
  },
  {
    id: "hormones",
    label: "Sugar & Hormones",
    kidLabel: "Sugar and hormones",
    emoji: "🍬",
    group: "Endocrine System",
  },
  {
    id: "mental",
    label: "Feelings & Mind",
    kidLabel: "Feelings and mind",
    emoji: "💭",
    group: "Mental Health and Behavior",
  },
  {
    id: "allergy",
    label: "Allergies & Germs",
    kidLabel: "Allergies and germs",
    emoji: "🤧",
    group: "Immune System",
  },
  {
    id: "infections",
    label: "Infections",
    kidLabel: "Germs and infections",
    emoji: "🦠",
    group: "Infections",
  },
  {
    id: "injuries",
    label: "Injuries & Wounds",
    kidLabel: "Cuts and injuries",
    emoji: "🩹",
    group: "Injuries and Wounds",
  },
  {
    id: "symptoms",
    label: "Common Symptoms",
    kidLabel: "Common symptoms",
    emoji: "🔍",
    group: "Symptoms",
  },
  {
    id: "sleep",
    label: "Sleep, Food & Moving",
    kidLabel: "Sleep, food and moving",
    emoji: "😴",
    group: "Wellness and Lifestyle",
  },
  {
    id: "medicines",
    label: "Medicines",
    kidLabel: "Medicines",
    emoji: "💊",
    group: "Drug Therapy",
  },
];

export function findArea(id: string | null): BodyArea | null {
  if (!id) return null;
  return BODY_AREAS.find((a) => a.id === id) ?? null;
}
