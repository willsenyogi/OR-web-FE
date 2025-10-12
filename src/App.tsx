import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { InputPage, MDVRPData } from "./components/InputPage";
import { ResultsPage } from "./components/ResultsPage";
import { AboutPage } from "./components/AboutPage";
import { solvePSO, solveGA, solveILP, SolutionResult } from "./utils/mdvrpSolver";
import { dummyInputData, dummyResults } from "./utils/dummyData";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // Initialize with dummy data for demo purposes
  const [inputData, setInputData] = useState<MDVRPData | null>(dummyInputData);
  const [results, setResults] = useState<{
    pso: SolutionResult;
    ga: SolutionResult;
    ilp: SolutionResult;
  } | null>(dummyResults);

  const handleRunSimulation = (data: MDVRPData) => {
    toast.loading("Menjalankan simulasi...");
    
    // Save input data
    setInputData(data);
    
    // Simulate async computation with setTimeout
    setTimeout(() => {
      const psoResult = solvePSO(data);
      const gaResult = solveGA(data);
      const ilpResult = solveILP(data);
      
      setResults({
        pso: psoResult,
        ga: gaResult,
        ilp: ilpResult,
      });
      
      toast.success("Simulasi selesai!");
      setCurrentPage('results');
    }, 1000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'input':
        return <InputPage onRunSimulation={handleRunSimulation} />;
      case 'results':
        return <ResultsPage results={results} inputData={inputData} onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="min-h-[calc(100vh-4rem)]">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
}
