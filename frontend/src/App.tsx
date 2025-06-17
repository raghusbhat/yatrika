import "./App.css";
import Sidebar from "@/components/layout/Sidebar";
import ChatInterface from "@/components/layout/ChatInterface";
import { useState } from "react";
import { motion } from "framer-motion";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  // Sidebar width in px
  const sidebarWidth = collapsed ? 72 : 288;

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <motion.main
        animate={{ width: `calc(100vw - ${sidebarWidth}px)` }}
        className="flex-1 flex flex-col items-center justify-between transition-all duration-300 ml-0"
        style={{ marginLeft: sidebarWidth, minWidth: 0 }}
      >
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <ChatInterface
            sidebarCollapsed={collapsed}
            sidebarWidth={sidebarWidth}
          />
        </div>
      </motion.main>
    </div>
  );
}

export default App;
