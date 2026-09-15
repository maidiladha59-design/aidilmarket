"use client";

import { useRef, useState, useTransition } from "react";
import { Send, Paperclip, Loader2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendCustomerChatMessage, sendAdminChatMessage, getChatFileUrl } from "@/lib/actions/chat";

export type ChatMessage = {
  id: string;
  sender_type: "customer" | "admin";
  message_type: "text" | "image" | "document";
  content: string | null;
  file_url: string | null;
  created_at: string;
};

export function ChatPanel({ orderId, messages, role }: { orderId: string; messages: ChatMessage[]; role: "customer" | "admin" }) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const sendMessage = role === "customer" ? sendCustomerChatMessage : sendAdminChatMessage;

  function handleSendText() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(orderId, { messageType: "text", content: text.trim() });
      if (!result.ok) setError(result.error);
      else setText("");
    });
  }

  async function handleFileSelected(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Belum login.");
      setUploading(false);
      return;
    }

    const path = `${orderId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("chat-files").upload(path, file);
    if (uploadError) {
      setError("Gagal mengunggah file.");
      setUploading(false);
      return;
    }

    const isImage = file.type.startsWith("image/");
    const result = await sendMessage(orderId, { messageType: isImage ? "image" : "document", fileUrl: path });
    setUploading(false);
    if (!result.ok) setError(result.error);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-card border border-ink-900/8 bg-white flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-ink-900/8">
        <h2 className="font-display font-semibold text-ink-950 text-sm">Chat Pesanan</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 ? (
          <p className="text-xs text-ink-400 text-center pt-8">Belum ada pesan.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_type === role;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? "bg-signal-500 text-white" : "bg-paper-100 text-ink-900"
                  }`}
                >
                  {m.message_type === "text" && <p>{m.content}</p>}
                  {m.message_type !== "text" && m.file_url && (
                    <button
                      onClick={async () => {
                        const result = await getChatFileUrl(orderId, m.file_url!);
                        if (result.ok) window.open(result.url, "_blank");
                      }}
                      className="flex items-center gap-1.5 text-xs underline"
                    >
                      <FileText size={13} /> {m.file_url.split("/").pop()}
                    </button>
                  )}
                  <p className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-ink-400"}`}>
                    {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <p className="px-4 text-xs text-flag-500">{error}</p>}

      <div className="flex items-center gap-2 border-t border-ink-900/8 p-3">
        <label className="cursor-pointer text-ink-500 hover:text-signal-500">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          placeholder="Tulis pesan..."
          className="flex-1 rounded-full border border-ink-900/15 px-3.5 py-2 text-sm focus:border-signal-500 outline-none"
        />
        <button
          onClick={handleSendText}
          disabled={pending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-signal-500 text-white disabled:opacity-50"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
