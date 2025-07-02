import "./App.css";
import Sidebar from "@/components/layout/Sidebar";
import ChatInterface from "@/components/layout/ChatInterface";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SettingsPage from "@/components/pages/SettingsPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import ProfilePage from "@/components/pages/ProfilePage";
import { LocaleProvider } from "@/lib/LocaleProvider";

function RouterErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="bg-rose-900 text-rose-100 rounded-md shadow-lg p-8 border border-rose-700 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">
            {error.status} {error.statusText}
          </h1>
          <p className="mb-2">{error.data || "Sorry, something went wrong."}</p>
          <a href="/" className="text-indigo-400 underline">
            Go Home
          </a>
        </div>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="bg-rose-900 text-rose-100 rounded-md shadow-lg p-8 border border-rose-700 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="mb-2">{error.message}</p>
          <a href="/" className="text-indigo-400 underline">
            Go Home
          </a>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="bg-rose-900 text-rose-100 rounded-md shadow-lg p-8 border border-rose-700 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Unknown Error</h1>
          <a href="/" className="text-indigo-400 underline">
            Go Home
          </a>
        </div>
      </div>
    );
  }
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Sidebar width in px
  const sidebarWidth = collapsed ? 72 : 288;

  // Function to trigger chat reset
  const triggerChatReset = () => {
    console.log("[App] Triggering chat reset");
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <LocaleProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans flex">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onTriggerReset={triggerChatReset}
          />
          <motion.main
            animate={{ width: `calc(100vw - ${sidebarWidth}px)` }}
            className="flex-1 flex flex-col items-center justify-between transition-all duration-300 ml-0"
            style={{ marginLeft: sidebarWidth, minWidth: 0 }}
          >
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ChatInterface
                      sidebarWidth={sidebarWidth}
                      resetTrigger={resetTrigger}
                    />
                  }
                  errorElement={<RouterErrorBoundary />}
                />
                <Route
                  path="/settings"
                  element={<SettingsPage />}
                  errorElement={<RouterErrorBoundary />}
                />
                <Route
                  path="/profile"
                  element={<ProfilePage />}
                  errorElement={<RouterErrorBoundary />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </motion.main>
        </div>
      </Router>
    </LocaleProvider>
  );
}

export default App;
