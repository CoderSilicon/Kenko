"use client";

import { useRef, useState } from "react";

interface KenkoFormProps {
  onEvaluate: (data: FormData) => void;
  isLoading: boolean;
}

export default function KenkoForm({ onEvaluate, isLoading }: KenkoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<
    Array<{ file: File; preview: string; name: string }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newImages: typeof images = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
    setImages((prev) => [...prev, ...newImages].slice(0, 4));
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleSubmit(formData: FormData) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`image_${i}`, images[i].file);
    }
    formData.append("image_count", String(images.length));
    onEvaluate(formData);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="w-full space-y-8">
      <div>
        <label
          htmlFor="symptoms"
          className="mb-2 block text-xs font-medium tracking-wider text-[#6b6259] uppercase"
        >
          Primary Symptoms
          <span className="ml-2 font-light text-[#b8b0a6] normal-case">
            required
          </span>
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          required
          rows={5}
          placeholder="Describe your symptoms, duration, onset, and severity (1–10)."
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="skinContext"
          className="mb-2 block text-xs font-medium tracking-wider text-[#6b6259] uppercase"
        >
          Physical & Skin Context
          <span className="ml-2 font-light text-[#b8b0a6] normal-case">
            optional
          </span>
        </label>
        <textarea
          id="skinContext"
          name="skinContext"
          rows={3}
          placeholder="Skin moisture, pigmentation, lesions, vitals if available."
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label
          htmlFor="image-upload"
          className="mb-2 block text-xs font-medium tracking-wider text-[#6b6259] uppercase"
        >
          Photo Evidence
          <span className="ml-2 font-light text-[#b8b0a6] normal-case">
            optional — skin, rash, throat, lesion
          </span>
        </label>

        {/* Drop Zone */}
        <button
          type="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group w-full cursor-pointer border border-dashed px-6 py-8 text-center transition-colors ${
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
                Drag a photo here or{" "}
                <span className="font-medium text-[#6b6259]">browse</span>
              </>
            )}
          </p>
          <p className="mt-1 text-[10px] font-light text-[#b8b0a6]">
            JPG, PNG, WebP — up to 10MB
          </p>
        </button>

        <input
          id="image-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={img.preview}
                className="group relative border border-[#e8e4df]"
              >
                {/* biome-ignore lint/performance/noImgElement: blob URL preview, next/image doesn't support blob URLs */}
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

      <div>
        <label
          htmlFor="userHypothesis"
          className="mb-2 block text-xs font-medium tracking-wider text-[#6b6259] uppercase"
        >
          Your Hypothesis
          <span className="ml-2 font-light text-[#b8b0a6] normal-case">
            optional
          </span>
        </label>
        <input
          type="text"
          id="userHypothesis"
          name="userHypothesis"
          placeholder="What condition do you suspect?"
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="additionalNotes"
          className="mb-2 block text-xs font-medium tracking-wider text-[#6b6259] uppercase"
        >
          Additional Notes
          <span className="ml-2 font-light text-[#b8b0a6] normal-case">
            optional
          </span>
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          rows={3}
          placeholder="Medications, allergies, travel, pre-existing conditions."
          className="w-full border-b border-[#d4c8bc] bg-transparent px-0 py-3 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] transition-colors focus:border-[#8a8278] focus:outline-none"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full border border-[#2c2c2c] bg-[#2c2c2c] px-8 py-4 text-xs font-medium tracking-[0.2em] text-[#faf8f5] transition-all hover:bg-[#3d3d3d] disabled:cursor-not-allowed disabled:opacity-30"
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
              <span className="tracking-[0.3em]">Analyzing</span>
            </span>
          ) : (
            <span className="tracking-[0.3em]">Evaluate</span>
          )}
        </button>
      </div>
    </form>
  );
}
