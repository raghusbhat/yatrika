import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  Home,
  HelpCircle,
  Info,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const itineraries = [
  { title: "Weekend in Barcelona", subtitle: "2 days ago" },
  { title: "Tokyo Food Tour", subtitle: "1 week ago" },
  { title: "Bali Adventure Trip", subtitle: "2 weeks ago" },
  { title: "New York City Break", subtitle: "3 weeks ago" },
];

const COLLAPSED_WIDTH = "w-18"; // 72px
const EXPANDED_WIDTH = "w-72"; // 288px

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-slate-950 border-r border-slate-900/50 flex flex-col justify-between transition-all duration-200 ${
        collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
      }`}
    >
      {/* Top: Logo, Collapse Button, and New Itinerary */}
      <div>
        <div
          className={`flex items-center py-4 px-2 mb-2 border-b border-slate-900 justify-between relative`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src="../../../public/logo.svg" alt="logo" className="ml-7" />
            </div>
            {!collapsed && (
              <span className="text-2xl font-bold text-slate-400 shadow-2xl mx-4">
                Yātrika
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute -right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary p-0 h-8 w-8 flex items-center justify-center ${
              collapsed ? "" : "relative  translate-y-0 "
            }`}
            onClick={() => setCollapsed((c) => !c)}
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
          >
            {!collapsed && <span className="text-sm">New Itinerary</span>}
            <Plus className="w-4 h-4" />
          </Button>
          {!collapsed && (
            <Input
              type="text"
              placeholder="Search conversations..."
              className="bg-slate-900 border-none placeholder:text-center text-slate-200 placeholder-slate-400 rounded-lg px-3 my-2 py-4 text-xs focus:ring focus:ring-indigo-500/50"
            />
          )}
        </div>
        <div className={`pt-3 pb-1 ${collapsed ? "px-1" : "px-4"}`}>
          {!collapsed && (
            <div className="text-xs  text-slate-400 mb-4">
              Recent Itineraries
            </div>
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
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight">
                      {it.title}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {it.subtitle}
                    </span>
                  </div>
                )}
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
          <div className="w-11 h-11 rounded-full bg-indigo-500/50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
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
      </div>
    </aside>
  );
};

const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}> = ({ icon, label, collapsed }) => (
  <div
    className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition text-white justify-${
      collapsed ? "center" : "start"
    }`}
  >
    {icon}
    {!collapsed && <span className="text-xs font-semibold">{label}</span>}
  </div>
);

export default Sidebar;
