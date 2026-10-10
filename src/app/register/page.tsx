
"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type FormData = {
  fullName: string;
  domain: string;
  position: string;
  srn: string;
  email: string;
  linkedin: string;
  github: string;
  branch: string;
  semester: string;
  bio: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    domain: "",
    position: "",
    srn: "",
    email: "",
    linkedin: "",
    github: "",
    branch: "",
    semester: "",
    bio: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function updateField(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setMessage({
        type: "error",
        text: "Please select a PNG, JPG, or JPEG image.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPhoto(URL.createObjectURL(file));
    setMessage(null);
  }

  function convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not process the selected image."));
          return;
        }

        context.drawImage(image, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image conversion failed."));
              return;
            }

            resolve(blob);
          },
          "image/webp",
          0.85
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not read the selected image."));
      };

      image.src = objectUrl;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!selectedFile) {
      setMessage({
        type: "error",
        text: "Please select a profile picture.",
      });
      return;
    }

    if (form.bio.trim().length === 0) {
      setMessage({
        type: "error",
        text: "Please enter a short bio.",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert the selected image to WebP in the browser.
      const webpBlob = await convertToWebP(selectedFile);

      if (webpBlob.size > 5 * 1024 * 1024) {
        throw new Error(
          "Your converted photo exceeds 5 MB. Please choose a smaller image."
        );
      }

      const webpFile = new File(
        [webpBlob],
        `${crypto.randomUUID()}.webp`,
        { type: "image/webp" }
      );

      // Upload the converted photo to Supabase Storage.
      const filePath = `${crypto.randomUUID()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, webpFile, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      const { data: photoData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(filePath);

      // Save the application with pending approval status.
      const { error: insertError } = await supabase
        .from("members")
        .insert({
          name: form.fullName.trim(),
          domain: form.domain,
          position: form.position,
          srn: form.srn.trim(),
          email: form.email.trim(),
          linkedin_url: form.linkedin.trim() || null,
          github_url: form.github.trim() || null,
          branch: form.branch,
          semester: Number(form.semester),
          bio: form.bio.trim(),
          photo_url: photoData.publicUrl,
          status: "pending",
        });

      if (insertError) {
        throw new Error(
          `Application could not be saved: ${insertError.message}`
        );
      }

      setMessage({
        type: "success",
        text: "Application submitted successfully! Your membership is pending admin approval.",
      });

      setForm({
        fullName: "",
        domain: "",
        position: "",
        srn: "",
        email: "",
        linkedin: "",
        github: "",
        branch: "",
        semester: "",
        bio: "",
      });

      setSelectedFile(null);
      setPhoto("");

      const fileInput = document.getElementById(
        "profile-picture"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-400";

  return (
    <main className="min-h-screen bg-[#080B12] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-xl font-bold tracking-tight">
          VYNTHRA<span className="text-violet-400">.</span>
        </a>

        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Join our community
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Member Registration
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Create your member profile and see how it looks before submitting
            your application.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold">Your details</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-300">
                Full name *
                <input
                  className={inputClass}
                  name="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                SRN *
                <input
                  className={inputClass}
                  name="srn"
                  placeholder="Enter your SRN"
                  value={form.srn}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Email address *
                <input
                  className={inputClass}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Domain *
                <select
                  className={inputClass}
                  name="domain"
                  value={form.domain}
                  onChange={updateField}
                  required
                >
                  <option value="">Select domain</option>
                  <option>Web Development</option>
                  <option>Design</option>
                  <option>Logistics</option>
                  <option>Operations</option>
                  <option>Sponsorship</option>
                  <option>Hospitality</option>
                  <option>Social Media</option>
                  <option>Event Management</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Position *
                <select
                  className={inputClass}
                  name="position"
                  value={form.position}
                  onChange={updateField}
                  required
                >
                  <option value="">Select position</option>
                  <option>Head</option>
                  <option>Vice-Head</option>
                  <option>Core Member</option>
                  <option>Member</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Branch *
                <select
                  className={inputClass}
                  name="branch"
                  value={form.branch}
                  onChange={updateField}
                  required
                >
                  <option value="">Select branch</option>
                  <option>CSE</option>
                  <option>AIML</option>
                  <option>ECE</option>
                  <option>EEE</option>
                  <option>ME</option>
                  <option>Biotech</option>
                  <option>Civil</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Semester *
                <select
                  className={inputClass}
                  name="semester"
                  value={form.semester}
                  onChange={updateField}
                  required
                >
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                Profile picture *
                <input
                  id="profile-picture"
                  className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:font-semibold file:text-white"
                  type="file"
                  accept="image/png,image/jpeg,.jpg,.jpeg"
                  onChange={handlePhoto}
                  required
                />
                <span className="block text-xs text-gray-500">
                  PNG, JPG or JPEG. Converted to WebP before upload.
                </span>
              </label>
            </div>

            <label className="block space-y-2 text-sm text-gray-300">
              LinkedIn profile
              <input
                className={inputClass}
                type="url"
                name="linkedin"
                placeholder="https://linkedin.com/in/your-profile"
                value={form.linkedin}
                onChange={updateField}
              />
            </label>

            <label className="block space-y-2 text-sm text-gray-300">
              GitHub profile
              <input
                className={inputClass}
                type="url"
                name="github"
                placeholder="https://github.com/your-username"
                value={form.github}
                onChange={updateField}
              />
            </label>

            <label className="block space-y-2 text-sm text-gray-300">
              Short bio *
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                name="bio"
                placeholder="Describe your skills, interests, and experience..."
                value={form.bio}
                onChange={updateField}
                maxLength={200}
                required
              />
              <span className="block text-right text-xs text-gray-500">
                {form.bio.length}/200 characters
              </span>
            </label>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl border p-4 text-sm leading-6 ${
                  message.type === "success"
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-500 px-6 py-3 font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting application..." : "Submit application →"}
            </button>

            <p className="text-xs leading-5 text-gray-500">
              Your application will remain pending until an administrator
              approves it.
            </p>
          </form>

          <aside className="lg:sticky lg:top-8">
            <h2 className="mb-4 text-xl font-semibold">Live card preview</h2>

            <div className="overflow-hidden rounded-2xl border border-violet-400/30 bg-[#101523]">
              <div className="h-24 bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-500" />

              <div className="px-6 pb-7">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#101523] bg-[#25243b] text-3xl font-bold text-violet-300">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    form.fullName.trim().charAt(0).toUpperCase() || "V"
                  )}
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-violet-300">
                  VYNTHRA MEMBER
                </p>

                <h3 className="mt-2 break-words text-2xl font-bold">
                  {form.fullName || "Your Name"}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {form.position || "Your Position"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300">
                    {form.domain || "Your Domain"}
                  </span>

                  {form.branch && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                      {form.branch}
                    </span>
                  )}

                  {form.semester && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                      Semester {form.semester}
                    </span>
                  )}
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
                  {form.bio || "Your short bio will appear here."}
                </p>

                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-gray-400">
                  {form.email && (
                    <p className="break-all">✉ {form.email}</p>
                  )}

                  {form.linkedin && (
                    <a
                      href={form.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-violet-300 hover:underline"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                  {form.github && (
                    <a
                      href={form.github}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-violet-300 hover:underline"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              This preview updates automatically as you fill in the form.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
