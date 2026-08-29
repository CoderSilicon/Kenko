"use client";

import { useRef, useState } from "react";

interface WizardData {
  symptoms: string;
  bodyLocation: string[];
  bodyLocationOther: string;
  onset: string;
  onsetOther: string;
  duration: string;
  durationOther: string;
  severity: number;
  associatedSymptoms: string[];
  associatedSymptomsOther: string;
  skinContext: string;
  medicalHistory: string;
  images: Array<{ file: File; preview: string; name: string }>;
  hypothesis: string;
}

interface KenkoWizardProps {
  onComplete: (data: FormData) => void;
  isLoading: boolean;
}

const BODY_LOCATIONS = [
  "Head",
  "Face",
  "Eyes",
  "Mouth / Throat",
  "Neck",
  "Chest",
  "Back",
  "Abdomen",
  "Arms",
  "Hands / Wrists",
  "Legs",
  "Feet / Ankles",
  "Skin (General)",
  "Joints",
];

const ONSET_OPTIONS = [
  {
    value: "sudden",
    label: "Sudden",
    desc: "Appeared within minutes to hours",
  },
  { value: "gradual", label: "Gradual", desc: "Developed over days" },
  {
    value: "worsening",
    label: "Worsening",
    desc: "Was mild, now getting worse",
  },
  {
    value: "intermittent",
    label: "Comes and goes",
    desc: "Comes and goes in episodes",
  },
];

const DURATION_OPTIONS = [
  "Less than 24 hours",
  "1–3 days",
  "4–7 days",
  "1–2 weeks",
  "2–4 weeks",
  "More than a month",
  "Recurring / Chronic",
];

const ASSOCIATED_SYMPTOMS = [
  "Fever",
  "Chills",
  "Nausea",
  "Vomiting",
  "Fatigue",
  "Headache",
  "Dizziness",
  "Swelling",
  "Itching",
  "Burning",
  "Numbness",
  "Shortness of breath",
  "Chest pain",
  "Loss of appetite",
  "Weight change",
  "Sleep trouble",
  "Mood change",
  "Sensitivity to light",
];

const SEVERITY_LABELS: Record<number, string> = {
  1: "Barely noticeable",
  2: "Very mild",
  3: "Uncomfortable",
  4: "Moderate",
  5: "Noticeable",
  6: "Distressing",
  7: "Severe",
  8: "Very intense",
  9: "Almost unbearable",
  10: "Worst possible",
};

export default function KenkoWizard({
  onComplete,
  isLoading,
}: KenkoWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    symptoms: "",
    bodyLocation: [],
    bodyLocationOther: "",
    onset: "",
    onsetOther: "",
    duration: "",
    durationOther: "",
    severity: 5,
    associatedSymptoms: [],
    associatedSymptomsOther: "",
    skinContext: "",
    medicalHistory: "",
    images: [],
    hypothesis: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const TOTAL_STEPS = 9;

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem<K extends keyof WizardData>(key: K, value: string) {
    setData((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return data.symptoms.trim().length > 0;
      case 1:
        return (
          data.bodyLocation.length > 0 ||
          data.bodyLocationOther.trim().length > 0
        );
      case 2:
        return data.onset.length > 0 || data.onsetOther.trim().length > 0;
      case 3:
        return data.duration.length > 0 || data.durationOther.trim().length > 0;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return true;
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleSubmit() {
    const fd = new FormData();
    fd.append("symptoms", buildFullSymptoms());
    fd.append("skinContext", data.skinContext);
    fd.append("userHypothesis", data.hypothesis);
    fd.append("additionalNotes", data.medicalHistory);
    for (let i = 0; i < data.images.length; i++) {
      fd.append(`image_${i}`, data.images[i].file);
    }
    fd.append("image_count", String(data.images.length));
    onComplete(fd);
  }

  function buildFullSymptoms(): string {
    const parts: string[] = [data.symptoms];
    const allLocations = [
      ...data.bodyLocation,
      ...(data.bodyLocationOther ? [data.bodyLocationOther] : []),
    ];
    if (allLocations.length > 0) {
      parts.push(`Location: ${allLocations.join(", ")}`);
    }
    const onsetVal = data.onsetOther || data.onset;
    if (onsetVal) {
      parts.push(`Onset: ${onsetVal}`);
    }
    const durationVal = data.durationOther || data.duration;
    if (durationVal) {
      parts.push(`Duration: ${durationVal}`);
    }
    parts.push(`Severity: ${data.severity}/10`);
    const allSymptoms = [
      ...data.associatedSymptoms,
      ...(data.associatedSymptomsOther ? [data.associatedSymptomsOther] : []),
    ];
    if (allSymptoms.length > 0) {
      parts.push(`Associated symptoms: ${allSymptoms.join(", ")}`);
    }
    return parts.join(". ");
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newImages: WizardData["images"] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
    setData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 4),
    }));
  }

  function removeImage(index: number) {
    setData((prev) => {
      URL.revokeObjectURL(prev.images[index].preview);
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-[0.3em] text-[#2c2c2c] uppercase">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <span className="text-[10px] font-light tracking-wider text-[#b8b0a6]">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Step indicator */}
        <div className="mb-4 flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={`step-segment-${i + 1}`}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < step
                  ? "bg-[#2c2c2c]"
                  : i === step
                    ? "bg-[#8a8278]"
                    : "bg-[#e8e4df]"
              }`}
            />
          ))}
        </div>

        <div className="h-px w-full bg-[#e8e4df]">
          <div
            className="h-full bg-[#2c2c2c] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-80">
        {step === 0 && <StepBasic data={data} update={update} />}
        {step === 1 && (
          <StepLocation
            data={data}
            toggleArrayItem={toggleArrayItem}
            update={update}
          />
        )}
        {step === 2 && <StepOnset data={data} update={update} />}
        {step === 3 && <StepDuration data={data} update={update} />}
        {step === 4 && <StepSeverity data={data} update={update} />}
        {step === 5 && (
          <StepAssociated
            data={data}
            toggleArrayItem={toggleArrayItem}
            update={update}
          />
        )}
        {step === 6 && <StepHistory data={data} update={update} />}
        {step === 7 && (
          <StepPhoto
            data={data}
            fileInputRef={fileInputRef}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            handleFiles={handleFiles}
            removeImage={removeImage}
          />
        )}
        {step === 8 && <StepHypothesis data={data} update={update} />}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#8a8278] uppercase transition-colors hover:text-[#2c2c2c] disabled:cursor-not-allowed disabled:opacity-0"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance() || isLoading}
          className="group inline-flex items-center justify-center gap-3 border border-[#2c2c2c] bg-[#2c2c2c] px-10 py-3.5 text-xs font-semibold tracking-[0.25em] text-[#faf8f5] uppercase transition-all hover:bg-[#3d3d3d] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-3">
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                role="img"
                aria-label="Loading"
              >
                <title>Loading</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="tracking-[0.25em]">Analyzing</span>
            </span>
          ) : step === TOTAL_STEPS - 1 ? (
            <span>
              Evaluate
              <span className="transition-transform group-hover:translate-x-1">
                {" →"}
              </span>
            </span>
          ) : (
            <span>
              Continue
              <span className="transition-transform group-hover:translate-x-1">
                {" →"}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepBasic({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        What&apos;s bothering you?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Describe your main complaint in your own words.
      </p>
      <textarea
        value={data.symptoms}
        onChange={(e) => update("symptoms", e.target.value)}
        rows={4}
        placeholder="e.g., I have a throbbing headache on the right side that started yesterday..."
        className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
      />
    </div>
  );
}

function StepLocation({
  data,
  toggleArrayItem,
  update,
}: {
  data: WizardData;
  toggleArrayItem: <K extends keyof WizardData>(key: K, value: string) => void;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        Where on your body?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Select all that apply.
      </p>
      <div className="flex flex-wrap gap-2">
        {BODY_LOCATIONS.map((loc) => {
          const active = data.bodyLocation.includes(loc);
          return (
            <button
              key={loc}
              type="button"
              onClick={() => toggleArrayItem("bodyLocation", loc)}
              className={`border px-4 py-2 text-xs font-light tracking-wider transition-colors ${
                active
                  ? "border-[#2c2c2c] bg-[#2c2c2c] text-[#faf8f5]"
                  : "border-[#d4c8bc] bg-transparent text-[#6b6259] hover:border-[#8a8278]"
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={data.bodyLocationOther}
          onChange={(e) => update("bodyLocationOther", e.target.value)}
          placeholder="Other location..."
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
        />
      </div>
    </div>
  );
}

function StepOnset({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        How did it start?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Choose the option that best describes the onset.
      </p>
      <div className="space-y-3">
        {ONSET_OPTIONS.map((opt) => {
          const active = data.onset === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                update("onset", opt.value);
                update("onsetOther", "");
              }}
              className={`w-full border p-4 text-left transition-colors ${
                active
                  ? "border-[#2c2c2c] bg-[#f0ece6]"
                  : "border-[#e8e4df] bg-transparent hover:border-[#b8b0a6]"
              }`}
            >
              <span className="text-sm font-medium text-[#2c2c2c]">
                {opt.label}
              </span>
              <span className="ml-3 text-xs font-light text-[#a09890]">
                {opt.desc}
              </span>
            </button>
          );
        })}
        <div>
          <input
            type="text"
            value={data.onsetOther}
            onChange={(e) => {
              update("onsetOther", e.target.value);
              if (e.target.value) update("onset", "");
            }}
            placeholder="Other description..."
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function StepDuration({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        How long has this been going on?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Select the closest duration.
      </p>
      <div className="space-y-2">
        {DURATION_OPTIONS.map((dur) => {
          const active = data.duration === dur;
          return (
            <button
              key={dur}
              type="button"
              onClick={() => {
                update("duration", dur);
                update("durationOther", "");
              }}
              className={`w-full border p-3 text-left text-sm font-light transition-colors ${
                active
                  ? "border-[#2c2c2c] bg-[#f0ece6] text-[#2c2c2c]"
                  : "border-[#e8e4df] bg-transparent text-[#6b6259] hover:border-[#b8b0a6]"
              }`}
            >
              {dur}
            </button>
          );
        })}
        <div>
          <input
            type="text"
            value={data.durationOther}
            onChange={(e) => {
              update("durationOther", e.target.value);
              if (e.target.value) update("duration", "");
            }}
            placeholder="Other duration..."
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function StepSeverity({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        How severe is it?
      </h2>
      <p className="mb-8 text-xs font-light text-[#a09890]">
        Drag the slider or tap a number.
      </p>

      <div className="text-center">
        <span className="mb-6 block text-5xl font-light text-[#2c2c2c]">
          {data.severity}
        </span>
        <span className="mb-8 block text-xs font-light tracking-wider text-[#8a8278]">
          {SEVERITY_LABELS[data.severity]}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={data.severity}
        onChange={(e) => update("severity", Number(e.target.value))}
        className="mx-auto mb-6 block w-full max-w-md accent-[#2c2c2c]"
      />

      <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => update("severity", n)}
            className={`py-2 text-xs font-light transition-colors ${
              data.severity === n
                ? "border border-[#2c2c2c] bg-[#2c2c2c] text-[#faf8f5]"
                : "border border-[#e8e4df] text-[#6b6259] hover:border-[#b8b0a6]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepAssociated({
  data,
  toggleArrayItem,
  update,
}: {
  data: WizardData;
  toggleArrayItem: <K extends keyof WizardData>(key: K, value: string) => void;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        Anything else you&apos;re feeling?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Select any other symptoms. Skip if none.
      </p>
      <div className="flex flex-wrap gap-2">
        {ASSOCIATED_SYMPTOMS.map((sym) => {
          const active = data.associatedSymptoms.includes(sym);
          return (
            <button
              key={sym}
              type="button"
              onClick={() => toggleArrayItem("associatedSymptoms", sym)}
              className={`border px-3 py-1.5 text-xs font-light tracking-wider transition-colors ${
                active
                  ? "border-[#2c2c2c] bg-[#2c2c2c] text-[#faf8f5]"
                  : "border-[#d4c8bc] bg-transparent text-[#6b6259] hover:border-[#8a8278]"
              }`}
            >
              {sym}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={data.associatedSymptomsOther}
          onChange={(e) => update("associatedSymptomsOther", e.target.value)}
          placeholder="Other symptom..."
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
        />
      </div>
    </div>
  );
}

function StepHistory({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        Anything relevant about you?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Medications, allergies, conditions, recent travel. Skip if none.
      </p>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="wiz-meds"
            className="mb-2 block text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase"
          >
            Medications
          </label>
          <input
            id="wiz-meds"
            type="text"
            value={data.medicalHistory.split("|")[0] || ""}
            onChange={(e) => {
              const parts = data.medicalHistory.split("|");
              parts[0] = e.target.value;
              update("medicalHistory", parts.join("|"));
            }}
            placeholder="e.g., Ibuprofen, Metformin"
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="wiz-allergies"
            className="mb-2 block text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase"
          >
            Allergies
          </label>
          <input
            id="wiz-allergies"
            type="text"
            value={data.medicalHistory.split("|")[1] || ""}
            onChange={(e) => {
              const parts = data.medicalHistory.split("|");
              parts[1] = e.target.value;
              update("medicalHistory", parts.join("|"));
            }}
            placeholder="e.g., Penicillin, Peanuts"
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="wiz-conditions"
            className="mb-2 block text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase"
          >
            Existing conditions
          </label>
          <input
            id="wiz-conditions"
            type="text"
            value={data.medicalHistory.split("|")[2] || ""}
            onChange={(e) => {
              const parts = data.medicalHistory.split("|");
              parts[2] = e.target.value;
              update("medicalHistory", parts.join("|"));
            }}
            placeholder="e.g., Diabetes, Hypertension"
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="wiz-vitals"
            className="mb-2 block text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase"
          >
            Skin type & vitals
          </label>
          <textarea
            id="wiz-vitals"
            value={data.skinContext}
            onChange={(e) => update("skinContext", e.target.value)}
            rows={2}
            placeholder="e.g., Dry skin, temp 37.2°C, BP 130/85"
            className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function StepPhoto({
  data,
  fileInputRef,
  isDragging,
  setIsDragging,
  handleFiles,
  removeImage,
}: {
  data: WizardData;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  handleFiles: (f: FileList | null) => void;
  removeImage: (i: number) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">Any photos?</h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Upload images of the affected area. Skip if not applicable.
      </p>

      <button
        type="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group w-full cursor-pointer border border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-[#8a8278] bg-[#f0ece6]"
            : "border-[#d4c8bc] bg-transparent hover:border-[#b8b0a6] hover:bg-[#faf8f5]"
        }`}
      >
        <svg
          className="mx-auto mb-3 h-6 w-6 text-[#b8b0a6] transition-colors group-hover:text-[#8a8278]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          role="img"
          aria-label="Upload photo"
        >
          <title>Upload photo</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
          />
        </svg>
        <p className="text-xs font-light text-[#8a8278]">
          {isDragging ? (
            "Drop image here"
          ) : (
            <>
              Drag a photo or{" "}
              <span className="font-medium text-[#6b6259]">browse</span>
            </>
          )}
        </p>
        <p className="mt-1 text-[10px] font-light text-[#b8b0a6]">
          JPG, PNG, WebP — up to 10MB
        </p>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {data.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.images.map((img, i) => (
            <div
              key={img.preview}
              className="group relative border border-[#e8e4df]"
            >
              {/* biome-ignore lint/performance/noImgElement: blob URL preview */}
              <img
                src={img.preview}
                alt={img.name}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center bg-[#2c2c2c] text-[8px] text-[#faf8f5] opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${img.name}`}
              >
                x
              </button>
              <div className="px-2 py-1.5">
                <p className="truncate text-[9px] font-light text-[#b8b0a6]">
                  {img.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepHypothesis({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-light text-[#2c2c2c]">
        What do you think it might be?
      </h2>
      <p className="mb-6 text-xs font-light text-[#a09890]">
        Your guess — Kenko will evaluate it objectively. Skip if unsure.
      </p>
      <input
        type="text"
        value={data.hypothesis}
        onChange={(e) => update("hypothesis", e.target.value)}
        placeholder="e.g., Migraine, eczema, food poisoning..."
        className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
      />
    </div>
  );
}
