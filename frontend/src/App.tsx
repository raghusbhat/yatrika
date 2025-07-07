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
import { Menu } from "lucide-react";
import logo from "../public/logo.svg";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TopBar from "@/components/layout/TopBar";

function RouterErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950">
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
      <div className="flex flex-col items-center justify-center h-full bg-slate-950">
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
      <div className="flex flex-col items-center justify-center h-full bg-slate-950">
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarWidth = collapsed ? 72 : 288;
  const triggerChatReset = () => setResetTrigger((prev) => prev + 1);

  return (
    <LocaleProvider>
      <Router>
        <div className="h-screen bg-slate-950 font-sans flex flex-col overflow-hidden box-border">
          {/* TopBar with hamburger menu */}
          <TopBar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Mobile Sidebar as Sheet */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetContent side="left" className="p-0 w-64 md:hidden">
                <Sidebar
                  collapsed={false}
                  setCollapsed={() => {}}
                  onTriggerReset={triggerChatReset}
                  isMobile
                />
              </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onTriggerReset={triggerChatReset}
                isMobile={false}
              />
            </div>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-between transition-all duration-300 ml-0 w-full h-full box-border min-w-0">
              <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden h-full box-border">
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
            </main>
          </div>
        </div>
      </Router>
    </LocaleProvider>
  );
}

export default App;
