import "./App.css";
import Sidebar from "@/components/layout/Sidebar";
import Landing from "@/components/layout/Landing";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans flex">
      <Sidebar />
      <div className="flex-1 ml-16 md:ml-64 transition-all duration-200">
        <Landing />
      </div>
    </div>
  );
}

export default App;
