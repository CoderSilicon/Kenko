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
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <span className="text-xs font-medium text-muted">
            {Math.round(progress)}% complete
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={`step-segment-${i + 1}`}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < step
                  ? "bg-accent"
                  : i === step
                    ? "bg-accent-strong"
                    : "bg-line-soft"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[22rem] sm:min-h-[20rem]">
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
      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line-soft pt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="k-btn-ghost px-5 py-3 disabled:invisible"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance() || isLoading}
          className="k-btn px-8 py-3"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2.5">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                role="img"
                aria-label="Loading"
              >
                <title>Loading</title>
                <circle
                  className="opacity-30"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing
            </span>
          ) : step === TOTAL_STEPS - 1 ? (
            <span>
              Evaluate
              <span aria-hidden="true"> {" →"}</span>
            </span>
          ) : (
            <span>
              Continue
              <span aria-hidden="true"> {" →"}</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}

function StepBasic({
  data,
  update,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}) {
  return (
    <div>
      <StepHeader title="What&apos;s bothering you?" />
      <textarea
        value={data.symptoms}
        onChange={(e) => update("symptoms", e.target.value)}
        rows={5}
        placeholder="e.g., I have a throbbing headache on the right side that started yesterday..."
        className="k-input resize-none leading-relaxed"
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
      <StepHeader title="Where on your body?" />
      <div className="flex flex-wrap gap-2">
        {BODY_LOCATIONS.map((loc) => {
          const active = data.bodyLocation.includes(loc);
          return (
            <button
              key={loc}
              type="button"
              onClick={() => toggleArrayItem("bodyLocation", loc)}
              className={`k-chip ${active ? "k-chip-on" : "k-chip-off"}`}
            >
              {loc}
            </button>
          );
        })}
      </div>
      <div className="mt-5">
        <input
          type="text"
          value={data.bodyLocationOther}
          onChange={(e) => update("bodyLocationOther", e.target.value)}
          placeholder="Other location..."
          className="k-input"
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
      <StepHeader title="How did it start?" />
      <div className="space-y-2.5">
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
              className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-accent bg-accent-soft/60 ring-1 ring-accent"
                  : "border-line bg-white hover:border-accent"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    active ? "border-accent bg-accent" : "border-faint bg-white"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm font-semibold">{opt.label}</span>
              </span>
              <span className="text-xs font-normal text-muted">{opt.desc}</span>
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
            className="k-input mt-1"
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
      <StepHeader title="How long has this been going on?" />
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
              className={`w-full rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                active
                  ? "border-accent bg-accent-soft/60 text-ink ring-1 ring-accent"
                  : "border-line bg-white text-body hover:border-accent hover:text-ink"
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
            className="k-input mt-1"
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
      <StepHeader title="How severe is it?" />
      <div className="text-center">
        <span className="mb-1 block text-5xl font-semibold tracking-tight">
          {data.severity}
        </span>
        <span className="mb-8 block text-sm font-medium text-muted">
          {SEVERITY_LABELS[data.severity]}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={data.severity}
        onChange={(e) => update("severity", Number(e.target.value))}
        className="mx-auto mb-7 block w-full max-w-md accent-accent"
      />

      <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => update("severity", n)}
            className={`h-11 rounded-full text-sm font-medium transition-all ${
              data.severity === n
                ? "bg-accent text-white shadow-sm"
                : "border border-line bg-white text-body hover:border-accent hover:text-ink"
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
      <StepHeader title="Anything else you&apos;re feeling?" />
      <div className="flex flex-wrap gap-2">
        {ASSOCIATED_SYMPTOMS.map((sym) => {
          const active = data.associatedSymptoms.includes(sym);
          return (
            <button
              key={sym}
              type="button"
              onClick={() => toggleArrayItem("associatedSymptoms", sym)}
              className={`k-chip ${active ? "k-chip-on" : "k-chip-off"}`}
            >
              {sym}
            </button>
          );
        })}
      </div>
      <div className="mt-5">
        <input
          type="text"
          value={data.associatedSymptomsOther}
          onChange={(e) => update("associatedSymptomsOther", e.target.value)}
          placeholder="Other symptom..."
          className="k-input"
        />
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase"
    >
      {children}
    </label>
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
      <StepHeader
        title="Anything relevant about you?"
        subtitle="Medications, allergies, conditions, travel — skip what doesn&apos;t apply."
      />

      <div className="space-y-5">
        <div>
          <FieldLabel htmlFor="wiz-meds">Medications</FieldLabel>
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
            className="k-input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="wiz-allergies">Allergies</FieldLabel>
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
            className="k-input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="wiz-conditions">Existing conditions</FieldLabel>
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
            className="k-input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="wiz-vitals">Skin type &amp; vitals</FieldLabel>
          <textarea
            id="wiz-vitals"
            value={data.skinContext}
            onChange={(e) => update("skinContext", e.target.value)}
            rows={2}
            placeholder="e.g., Dry skin, temp 37.2°C, BP 130/85"
            className="k-input resize-none"
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
      <StepHeader title="Any photos?" />

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
        className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-soft/50"
            : "border-line bg-white hover:border-accent hover:bg-soft"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft transition-colors group-hover:bg-accent">
          <svg
            className="h-6 w-6 text-accent-strong transition-colors group-hover:text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
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
        </span>
        <p className="mt-4 text-sm font-medium">
          {isDragging ? (
            "Drop image here"
          ) : (
            <>
              Drag a photo or <span className="text-accent-strong">browse</span>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">JPG, PNG, WebP — up to 10MB</p>
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.images.map((img, i) => (
            <div
              key={img.preview}
              className="group relative overflow-hidden rounded-xl border border-line"
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
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${img.name}`}
              >
                ×
              </button>
              <p className="truncate px-2.5 py-1.5 text-[11px] font-medium text-muted">
                {img.name}
              </p>
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
      <StepHeader
        title="What do you think it might be?"
        subtitle="Optional — skip if you&apos;re not sure."
      />
      <input
        type="text"
        value={data.hypothesis}
        onChange={(e) => update("hypothesis", e.target.value)}
        placeholder="e.g., Migraine, eczema, food poisoning..."
        className="k-input"
      />
    </div>
  );
}
