"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadName, setUploadName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

  async function handleUpload() {
    if (!file) return;
    setUploadState("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setUploadName(file.name);
      setUploadState("done");
    } catch {
      setUploadState("error");
    }
  }

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAsked(true);
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch {
      setAnswer("Request failed. The backend may be unreachable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10 sm:py-16">
      <div className="max-w-[720px] mx-auto">

        <header className="mb-10 pb-6 border-b border-[var(--border)]">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h1
              className="text-[15px] tracking-[0.25em] uppercase text-[var(--foreground)]"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              TrialDocs
            </h1>
            <span
              className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-sm border border-[var(--accent-dim)] text-[var(--accent)]"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Grounded in source
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] max-w-[52ch]">
            Upload a clinical trial protocol. Ask it questions. Every answer traces
            back to a passage — if it isn&apos;t in the document, the assistant says so.
          </p>
        </header>

        <section className="mb-8">
          <div
            className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            §1 &nbsp;Document intake
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[13px] px-3 py-2 rounded-sm border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent-dim)] transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Choose PDF
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setUploadState("idle");
                }}
              />
              <span className="text-[13px] text-[var(--muted)] truncate max-w-[240px]">
                {file ? file.name : "No file selected"}
              </span>
              <button
                onClick={handleUpload}
                disabled={!file || uploadState === "uploading"}
                className="ml-auto text-[13px] px-4 py-2 rounded-sm bg-[var(--accent-dim)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors"
              >
                {uploadState === "uploading" ? "Ingesting…" : "Ingest"}
              </button>
            </div>

            {uploadState === "done" && (
              <p className="mt-3 text-[13px] text-[var(--accent)]">
                ✓ {uploadName} indexed and ready for questions.
              </p>
            )}
            {uploadState === "error" && (
              <p className="mt-3 text-[13px] text-[#c17b6b]">
                Ingestion failed. Confirm the file is a valid PDF and try again.
              </p>
            )}
          </div>
        </section>

        <section className="mb-8">
          <div
            className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            §2 &nbsp;Query
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-5">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the exclusion criteria for Arm B?"
              rows={3}
              className="w-full bg-transparent text-[15px] text-[var(--foreground)] outline-none resize-none placeholder:text-[var(--muted)]"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="text-[13px] px-4 py-2 rounded-sm bg-[var(--accent-dim)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors"
              >
                {loading ? "Searching…" : "Ask"}
              </button>
            </div>
          </div>
        </section>

        {asked && (
          <section>
            <div
              className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              §3 &nbsp;Response
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-5">
              {loading ? (
                <p className="text-[15px] text-[var(--muted)]">
                  Retrieving relevant passages
                  <span className="inline-block w-[8px] animate-pulse">▌</span>
                </p>
              ) : (
                <>
                  <p
                    className="text-[16px] leading-[1.7] text-[var(--foreground)] whitespace-pre-wrap"
                    style={{ fontFamily: "'Source Serif 4', serif" }}
                  >
                    {answer}
                  </p>
                  {sources.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
                      {sources.map((s, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-1 rounded-sm border border-[var(--tag)] text-[var(--tag)]"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          [§{i + 1}] {s}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        <footer className="mt-14 pt-6 border-t border-[var(--border)] text-[12px] text-[var(--muted)]">
          Answers are generated only from ingested documents. Absence of an answer
          is reported as such, not inferred.
        </footer>
      </div>
    </div>
  );
}
