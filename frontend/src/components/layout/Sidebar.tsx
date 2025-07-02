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
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  onTriggerReset,
}) => {
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      className="h-full z-40 bg-slate-950 border-r border-slate-900/50 flex flex-col justify-between fixed top-0 left-0"
      style={{ minWidth: COLLAPSED_WIDTH, maxWidth: EXPANDED_WIDTH }}
    >
      {/* Top: Logo, Collapse Button, and New Itinerary */}
      <div>
        <div className="flex items-center py-4 px-2 mb-2 border-b border-slate-900 justify-between relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src="../../../public/logo.svg" alt="logo" className="ml-7" />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="yatrika-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="text-2xl font-bold text-slate-400 shadow-2xl mx-4"
                >
                  Yātrika
                </motion.span>
              )}
            </AnimatePresence>
          </div>
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
        </div>
        <div
          className={`flex flex-col gap-2 px-2 py-3${
            collapsed ? " items-center" : ""
          }`}
        >
          <Button
            className={`min-w-0 min-h-0 bg-indigo-500 text-indigo-50 flex items-center justify-center ${
              collapsed ? "" : "w-full gap-2 px-2"
            }`}
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
                  transition={{ duration: 0.18, ease: "easeInOut" }}
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
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <Input
                type="text"
                placeholder="Search conversations..."
                className="bg-slate-900 border-none placeholder:text-center text-slate-200 placeholder-slate-400 rounded-lg px-3 my-2 py-4 text-xs focus:ring focus:ring-indigo-500/50"
              />
            </motion.div>
          )}
        </div>
        <div className={`pt-3 pb-1 ${collapsed ? "px-1" : "px-4"}`}>
          {!collapsed && (
            <motion.div
              key="recent-itineraries"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="text-xs text-slate-400 mb-4"
            >
              Recent Itineraries
            </motion.div>
          )}
          <div className="flex flex-col gap-1">
            {itineraries.map((it, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-1 rounded-lg hover:bg-indigo-500/20 cursor-pointer transition group ${
                  collapsed ? "justify-center py-2" : ""
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#273043" }}
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      key={`itinerary-title-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="flex flex-col"
                    >
                      <span className="text-xs font-bold text-white leading-tight">
                        {it.title}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        {it.subtitle}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Navigation and Profile */}
      <div>
        <div
          className={`border-t-[0.2px] mx-4 opacity-50 flex flex-col gap-2 ${
            collapsed ? "px-1 py-2" : "px-2 py-3"
          }`}
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
          className={`border-t-[0.2px] border-indigo-950 flex items-center gap-2 ${
            collapsed ? "px-2 py-4 justify-center" : "px-2 py-4"
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
    className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition text-white justify-${
      collapsed ? "center" : "start"
    }`}
    onClick={onClick}
  >
    {icon}
    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.span
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="text-xs font-semibold"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

export default Sidebar;
