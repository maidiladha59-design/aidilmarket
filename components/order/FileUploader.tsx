"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, X, Loader2 } from "lucide-react";

export type UploadedFile = { path: string; name: string; size: number };

const ACCEPTED = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip";
const MAX_SIZE_MB = 25;

export function FileUploader({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Kamu harus login untuk mengunggah materi.");
      return;
    }

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}" melebihi batas ${MAX_SIZE_MB}MB.`);
        continue;
      }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("materials").upload(path, file);
      if (uploadError) {
        setError(`Gagal mengunggah "${file.name}".`);
        continue;
      }
      uploaded.push({ path, name: file.name, size: file.size });
    }

    onChange([...files, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(path: string) {
    onChange(files.filter((f) => f.path !== path));
  }

  return (
    <div>
      <label className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-ink-900/15 bg-paper-50 p-6 text-center cursor-pointer hover:border-signal-500/50 transition-colors">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-signal-500" />
        ) : (
          <Upload size={22} className="text-ink-500" />
        )}
        <span className="text-sm font-medium text-ink-800">Klik untuk pilih file</span>
        <span className="text-xs text-ink-500">PDF, DOC, PPT, XLS, JPG, PNG, TXT, ZIP · maks {MAX_SIZE_MB}MB</span>
      </label>

      {error && <p className="mt-2 text-xs text-flag-500">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li
              key={f.path}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/10 bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="shrink-0 text-signal-500" />
                <span className="truncate text-sm text-ink-800">{f.name}</span>
                <span className="shrink-0 text-xs text-ink-500">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <button onClick={() => removeFile(f.path)} className="shrink-0 text-ink-500 hover:text-flag-500">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
