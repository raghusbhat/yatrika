import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "../../../public/logo.svg";

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMobileMenuClick }) => {
  return (
    <header className="w-full h-12 sm:h-14 flex items-center px-2 sm:px-4 bg-transparent border-b border-slate-900/80 z-30">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger menu button - only visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden p-1.5 h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onMobileMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <img src={logo} alt="logo" className="w-6 h-6 sm:w-8 sm:h-8" />
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight select-none">
          Yātrika
        </span>
      </div>
      <div className="flex-1" />
      {/* Right-aligned controls (add more controls as needed) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Placeholder for right controls */}
      </div>
    </header>
  );
};

export default TopBar;
