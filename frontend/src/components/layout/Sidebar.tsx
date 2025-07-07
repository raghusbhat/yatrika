import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  Home,
  HelpCircle,
  Info,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const itineraries = [
  { title: "Weekend in Barcelona", subtitle: "2 days ago" },
  { title: "Tokyo Food Tour", subtitle: "1 week ago" },
  { title: "Bali Adventure Trip", subtitle: "2 weeks ago" },
  { title: "New York City Break", subtitle: "3 weeks ago" },
];

const COLLAPSED_WIDTH = 72; // px
const EXPANDED_WIDTH = 288; // px

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  onTriggerReset?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  onTriggerReset,
  isMobile = false,
}) => {
  const navigate = useNavigate();

  // Only show collapse/expand and logo on desktop
  const showCollapse = !isMobile;
  const showLogo = !isMobile;
  const sidebarWidth = collapsed ? 72 : 288;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className={`h-full w-full box-border z-50 bg-slate-950 border-r border-slate-900/50 flex flex-col pb-6 ${
        isMobile ? "w-64" : ""
      }`}
      style={{
        minWidth: isMobile ? 256 : 72,
        maxWidth: isMobile ? 256 : 288,
        overflowX: "hidden",
      }}
    >
      {/* Top section */}
      <div className="w-full box-border">
        <div className="flex items-center py-4 mb-2 justify-between relative w-full box-border">
          <div className="flex items-center gap-2">
            {/* Logo removed - now in TopBar */}
          </div>
          {showCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary p-0 h-8 w-8 flex items-center justify-center"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <div
          className={`flex flex-col gap-2 py-3 px-3${
            collapsed ? " items-center" : ""
          } w-full box-border`}
        >
          <Button
            className={`w-full min-w-0 min-h-0 bg-indigo-500 text-indigo-50 flex items-center justify-center transition-all duration-300 ${
              collapsed ? "!w-12 !h-12 p-0" : "gap-2"
            } box-border`}
            onClick={() => {
              console.log("[Sidebar] New Itinerary clicked - triggering reset");
              if (onTriggerReset) {
                onTriggerReset();
              }
              navigate("/");
            }}
          >
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="new-itinerary-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  className="text-sm"
                >
                  New Itinerary
                </motion.span>
              )}
            </AnimatePresence>
            <Plus className="w-4 h-4" />
          </Button>
          {/* Always reserve space for search bar */}
          {collapsed ? (
            <div style={{ height: 48, margin: "8px 0" }} />
          ) : (
            <motion.div
              key="search-conv"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            >
              <Input
                type="text"
                placeholder="Search conversations..."
                className="w-full box-border bg-slate-900 border-none placeholder:text-center text-slate-200 placeholder-slate-400 rounded-lg px-3 my-2 py-4 text-xs focus:ring focus:ring-indigo-500/50"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Middle section: Recent Itineraries, flex-1, min-h-0, overflow-hidden */}
      <div
        className={`pt-3 pb-1 px-3${
          collapsed ? " px-1" : ""
        } flex-1 min-h-0 overflow-hidden w-full box-border relative`}
      >
        {collapsed ? (
          /* Show only map pin icons when collapsed */
          <div className="flex flex-col gap-1 items-center">
            {itineraries.slice(0, 4).map((_, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-indigo-500/20 cursor-pointer transition"
                style={{ background: "#273043" }}
              >
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        ) : (
          /* Show full itinerary list when expanded */
          <AnimatePresence>
            <motion.div
              key="recent-itineraries"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden h-full"
            >
              <div className="text-xs text-slate-400 mb-4">
                Recent Itineraries
              </div>
              <div
                className="flex flex-col gap-1 relative"
                style={{ maxHeight: "100%" }}
              >
                {itineraries.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 p-1 rounded-lg hover:bg-indigo-500/20 cursor-pointer transition group"
                    style={{ minHeight: 48 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#273043" }}
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">
                        {it.title}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        {it.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Fade-out gradient if content overflows */}
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-slate-950 to-transparent" />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom section: nav and avatar, always at bottom, w-full, box-border, with proper spacing */}
      <div className="w-full box-border pb-4">
        <div
          className={`flex flex-col gap-2 px-3 mb-4${
            collapsed ? " items-center" : ""
          } w-full box-border`}
        >
          <SidebarNavItem
            icon={<Home className="w-4 h-4" />}
            label="Home"
            collapsed={collapsed}
            onClick={() => {
              console.log("[Sidebar] Home clicked - triggering reset");
              if (onTriggerReset) {
                onTriggerReset();
              }
              navigate("/");
            }}
          />
          <SidebarNavItem
            icon={<HelpCircle className="w-4 h-4" />}
            label="Help / FAQ"
            collapsed={collapsed}
          />
          <SidebarNavItem
            icon={<Info className="w-4 h-4" />}
            label="About"
            collapsed={collapsed}
          />
          <SidebarNavItem
            icon={<MessageSquare className="w-4 h-4" />}
            label="Feedback"
            collapsed={collapsed}
          />
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-all duration-300 text-white w-full box-border mb-2 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={`flex items-center gap-2 w-full cursor-pointer hover:bg-indigo-500/20 p-2 rounded-md ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Avatar className="w-11 h-11 bg-indigo-500/50">
                  <AvatarImage src="/avatar.png" alt="User avatar" />
                  <AvatarFallback>RB</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      Raghu Bhat
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Premium Plan
                    </div>
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-0 bg-slate-900 border shadow-lg rounded-md ml-2"
            >
              <div className="flex flex-col">
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-200 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  <UserIcon className="w-4 h-4 text-indigo-300" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-200 transition-colors border-t border-slate-800 focus:outline-none cursor-pointer"
                  onClick={() => {
                    navigate("/settings");
                  }}
                >
                  <SettingsIcon className="w-4 h-4 text-indigo-400" />
                  <span>Settings</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-200 border-t border-slate-800 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => {
                    // TODO: Implement logout logic
                  }}
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.aside>
  );
};

const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}> = ({ icon, label, collapsed, onClick }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-all duration-300 text-white w-full box-border ${
      collapsed ? "justify-center" : "justify-start"
    }`}
    onClick={onClick}
  >
    <div className="flex-shrink-0">{icon}</div>
    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.span
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="text-xs font-semibold"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

export default Sidebar;
