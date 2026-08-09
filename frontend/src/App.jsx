import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const SECTION_LABELS = [
  "Overall description",
  "Identified location",
  "Main objects identified in the image",
  "Texts observed in the image",
  "List of tags representing the image"
];

function normalizeAnalysisMarkdown(rawText) {
  if (!rawText) {
    return "";
  }

  const text = String(rawText).trim();
  if (!text) {
    return "";
  }

  const hasMarkdownSyntax = /(^|\n)\s{0,3}(#{1,6}\s|[-*]\s|\d+\.\s|>\s)/m.test(text);
  if (hasMarkdownSyntax) {
    return text;
  }

  // Convert plain section-label text to markdown headings when model omits markdown syntax.
  const lines = text.split(/\r?\n/);
  const normalizedLines = [];
  let convertedSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const label = SECTION_LABELS.find((item) =>
      new RegExp(`^\\*{0,2}\\s*${item.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*:`, "i").test(trimmed)
    );

    if (label) {
      const value = trimmed.replace(
        new RegExp(`^\\*{0,2}\\s*${label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*:\\s*`, "i"),
        ""
      );
      if (normalizedLines.length > 0) {
        normalizedLines.push("");
      }
      normalizedLines.push(`## ${label}`);
      if (value) {
        normalizedLines.push(value);
      }
      convertedSection = true;
      continue;
    }

    normalizedLines.push(line);
  }

  if (convertedSection) {
    return normalizedLines.join("\n").trim();
  }

  return text;
}

function App() {
  const [runtimeHostname, setRuntimeHostname] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisMarkdown, setAnalysisMarkdown] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadServerInfo = async () => {
      try {
        const response = await fetch("/api/health");
        const payload = await response.json();

        if (!response.ok || !payload?.serverHostname || !isMounted) {
          return;
        }

        setRuntimeHostname(String(payload.serverHostname));
      } catch {
        // Keep fallback text when hostname cannot be retrieved.
      }
    };

    loadServerInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) {
      return "Please select an image file.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG and PNG files are supported.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "Image must be 10 MB or smaller.";
    }

    return "";
  };

  const onFileChange = (event) => {
    if (isLoading) {
      return;
    }

    const file = event.target.files?.[0] ?? null;
    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setAnalysisMarkdown("");
      setErrorMessage(validationError);
      return;
    }

    setSelectedFile(file);
    setAnalysisMarkdown("");
    setErrorMessage("");
  };

  const analyzeImage = async () => {
    if (!selectedFile || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setAnalysisMarkdown("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const payload = await response.json();

      if (!response.ok) {
        const backendMessage =
          payload?.detail?.message ||
          payload?.error?.message ||
          payload?.message ||
          "Failed to analyze image.";
        throw new Error(backendMessage);
      }

      setAnalysisMarkdown(normalizeAnalysisMarkdown(payload.analysisMarkdown || "No analysis returned."));
    } catch (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Image Analyzer ({runtimeHostname || "unknown-host"})
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload a JPG or PNG image and generate a detailed markdown analysis using Azure OpenAI.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <label
              aria-disabled={isLoading}
              className={[
                "inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium text-white transition",
                isLoading
                  ? "cursor-not-allowed bg-slate-400 pointer-events-none"
                  : "cursor-pointer bg-slate-900 hover:bg-slate-700"
              ].join(" ")}
            >
              <span>{selectedFile ? "Replace Image" : "Upload Image"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                disabled={isLoading}
                onChange={onFileChange}
              />
            </label>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Supported formats: JPG, PNG. Max file size: 10 MB.
            </div>

            <div className="relative mt-6 aspect-video w-full overflow-auto rounded-2xl border border-slate-200 bg-white">
              {!selectedFile && (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Upload an image to preview it here.
                </div>
              )}

              {selectedFile && (
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="block h-full w-full object-contain"
                />
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/45">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedFile || isLoading}
              onClick={analyzeImage}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </button>

            {errorMessage && (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Image Description</h2>
            <div className="mt-3 h-[29rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-5">
              {!analysisMarkdown && !isLoading && (
                <p className="text-sm text-slate-400">Analysis results will appear here.</p>
              )}

              <article className="prose prose-slate max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-1">
                <ReactMarkdown>{analysisMarkdown}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
