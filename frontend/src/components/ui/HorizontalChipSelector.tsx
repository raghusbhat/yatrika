import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalChipSelectorProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const HorizontalChipSelector: React.FC<HorizontalChipSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleResize = () => {};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [options.length]);

  const handleChipClick = (chip: string) => {
    if (value.includes(chip)) {
      onChange(value.filter((v) => v !== chip));
    } else {
      onChange([...value, chip]);
    }
  };

  const updateFadeIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    setTimeout(updateFadeIndicators, 50);
    el.addEventListener("scroll", updateFadeIndicators);
    window.addEventListener("resize", updateFadeIndicators);

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaX || e.deltaY,
          behavior: "smooth",
        });
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.pageX,
        scrollLeft: el.scrollLeft,
      });
      if (el) el.style.cursor = "grabbing";
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - dragStart.x) * 2;
      if (el) {
        el.scrollLeft = dragStart.scrollLeft - walk;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (el) el.style.cursor = "grab";
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      if (el) el.style.cursor = "grab";
    };

    el.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("scroll", updateFadeIndicators);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", updateFadeIndicators);
    };
  }, [updateFadeIndicators, options.length, isDragging, dragStart]);

  const scrollToDirection = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const chipWidth = 120;
    const scrollAmount = chipWidth * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full flex items-center h-10 sm:h-12">
      <button
        type="button"
        aria-label="Scroll left"
        className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center bg-slate-800/80 border border-slate-600 rounded-full shadow-md transition-all duration-200 opacity-80 hover:bg-slate-700 hover:scale-110 cursor-pointer mr-1.5 sm:mr-2"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        onClick={() => scrollToDirection("left")}
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-200" />
      </button>
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar flex-1 h-full"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
      >
        <div className="flex gap-2 sm:gap-3 w-max items-center h-full px-1">
          {options.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer select-none flex-shrink-0 whitespace-nowrap min-w-fit scroll-snap-align-start h-6 sm:h-7 flex items-center justify-center ${
                value.includes(chip)
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md scale-105"
                  : "bg-indigo-700/25 text-slate-200 border-indigo-400/40 hover:bg-indigo-700/50 hover:border-indigo-400/60"
              }`}
              onClick={() => handleChipClick(chip)}
              style={{
                scrollSnapAlign: "start",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Scroll right"
        className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center bg-slate-800/80 border border-slate-600 rounded-full shadow-md transition-all duration-200 opacity-80 hover:bg-slate-700 hover:scale-110 cursor-pointer ml-1.5 sm:ml-2"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        onClick={() => scrollToDirection("right")}
      >
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-200" />
      </button>
    </div>
  );
};
