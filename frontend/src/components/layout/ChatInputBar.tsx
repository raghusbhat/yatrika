import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, X as XIcon } from "lucide-react";

interface ChatInputBarProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  displayed: string;
  sidebarWidth: number;
  maxWidth: number;
}

const MAX_TEXTAREA_HEIGHT = 120;
const MAX_IMAGES = 4;

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputValue,
  setInputValue,
  loading,
  handleSubmit,
  fileInputRef,
  displayed,
  sidebarWidth,
  maxWidth,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
    }
  }, [inputValue]);

  // Image previews
  useEffect(() => {
    const urls = images.map((img) => URL.createObjectURL(img));
    setImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Keyboard handling: Enter to send, Shift+Enter for newline
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && inputValue.trim()) {
        // @ts-ignore: parent will handle submit
        handleSubmit(e);
      }
    }
  };

  // Add images (up to MAX_IMAGES)
  const addImages = (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!fileArr.length) return;
    setImages((prev) => {
      const next = [...prev, ...fileArr].slice(0, MAX_IMAGES);
      return next;
    });
  };

  // Handle file input
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle paste image
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      addImages(files);
      e.preventDefault();
    }
  };

  // Handle drop image
  const onDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-6 flex justify-center z-50 pointer-events-none transition-all duration-300"
      style={{
        left: sidebarWidth,
        width: `calc(100vw - ${sidebarWidth}px)`,
        boxSizing: "border-box",
        transition:
          "left 0.3s cubic-bezier(0.4,0,0.2,1) 80ms, width 0.3s cubic-bezier(0.4,0,0.2,1) 80ms",
      }}
    >
      <div
        className={`pointer-events-auto w-full bg-slate-900 shadow shadow-black border px-2 py-2 rounded-xl flex flex-col gap-1 transition-all duration-150
        ${
          isFocused
            ? "border-indigo-500 shadow-[0_4px_32px_rgba(80,80,180,0.10)]"
            : "border-slate-800 shadow-2xl"
        } mx-auto`}
        style={{ maxWidth }}
      >
        {/* Image chips above input */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1 max-w-[140px] cursor-pointer border border-slate-700"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <img
                  src={imagePreviews[idx]}
                  alt="preview"
                  className="w-7 h-7 object-cover rounded-md"
                />
                <span className="text-xs text-slate-300 truncate max-w-[60px]">
                  {img.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  className="h-5 w-5 p-0 ml-1 text-slate-400 hover:text-rose-400"
                  onClick={() => removeImage(idx)}
                  aria-label="Remove image"
                >
                  <XIcon className="w-3 h-3" />
                </Button>
                {/* Large preview on hover */}
                {hoveredIdx === idx && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-2 flex flex-col items-center">
                    <img
                      src={imagePreviews[idx]}
                      alt="full preview"
                      className="w-40 h-40 object-contain rounded-md"
                    />
                    <span className="text-xs text-slate-300 mt-1 max-w-[120px] truncate">
                      {img.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Upper row: input only */}
        <div className="flex items-center w-full">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={1000}
            placeholder={displayed || "Type your message..."}
            className="flex-1 resize-none bg-slate-800 border-none text-slate-200 placeholder-slate-500 px-3 py-2 font-sans text-base leading-relaxed outline-none rounded-lg min-h-[44px] max-h-[120px] transition-all"
            autoComplete="off"
            aria-label="Chat message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onDrop={onDrop}
            disabled={loading}
            style={{ maxHeight: MAX_TEXTAREA_HEIGHT, minHeight: 44 }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        {/* Lower row: buttons */}
        <div className="flex items-center justify-between w-full gap-2 mt-1">
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 p-0 bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg border border-slate-700"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
            tabIndex={-1}
            disabled={images.length >= MAX_IMAGES}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            tabIndex={-1}
            onChange={onFileChange}
            multiple
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow border border-indigo-700"
            disabled={loading}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInputBar;
