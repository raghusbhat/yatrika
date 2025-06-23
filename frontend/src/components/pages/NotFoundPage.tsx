import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="bg-slate-900 text-slate-100 rounded-md shadow-lg p-8 border border-slate-800 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="mb-4 text-lg">Page Not Found</p>
        <p className="mb-6 text-slate-400">
          The page you are looking for does not exist or you do not have access.
        </p>
        <Button onClick={() => navigate("/")} variant="default">
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
