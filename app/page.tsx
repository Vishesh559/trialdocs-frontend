"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:8000";

  async function handleUpload() {
    if (!file) return;
    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || "Upload complete");
    } catch (err) {
      setUploadStatus("Upload failed");
    }
  }

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
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
    } catch (err) {
      setAnswer("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">TrialDocs</h1>
          <p className="text-gray-500 mt-1">
            Ask questions about clinical trial protocols, grounded in the actual document.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
          <h2 className="font-medium text-gray-900">Upload a protocol (PDF)</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600"
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-40"
          >
            Upload
          </button>
          {uploadStatus && <p className="text-sm text-gray-500">{uploadStatus}</p>}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
          <h2 className="font-medium text-gray-900">Ask a question</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What are the exclusion criteria?"
            className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900"
            rows={3}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-40"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {answer && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <h2 className="font-medium text-gray-900">Answer</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
            {sources.length > 0 && (
              <p className="text-xs text-gray-400 pt-2">
                Sources: {sources.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
