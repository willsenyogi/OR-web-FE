import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { InputPage, MDVRPData } from "./components/InputPage";
import { ResultsPage } from "./components/ResultsPage";
import { AboutPage } from "./components/AboutPage";
import { SolutionResult } from "./utils/mdvrpSolver";
import { dummyInputData, dummyResults } from "./utils/dummyData";
import { runMDVRPSimulation } from "./utils/api";
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
  const [plotlyPlots, setPlotlyPlots] = useState<{
    distance_comparison?: any;
    time_comparison?: any;
  } | null>(null);

  const handleRunSimulation = async (
    data: MDVRPData,
    parameters: { maxIterations: number; populationSize: number }
  ) => {
    const loadingToast = toast.loading("Mengirim data ke server...", {
      description: "Mohon tunggu, algoritma sedang bekerja"
    });
    
    // Save input data
    setInputData(data);
    
    try {
      // Call backend API
      const response = await runMDVRPSimulation(data, parameters);
      
      if (!response.success || !response.data) {
        toast.error("Simulasi gagal", {
          id: loadingToast,
          description: response.error || "Terjadi kesalahan saat menjalankan simulasi"
        });
        return;
      }
      
      setResults(response.data);
      setPlotlyPlots(response.plots || null);
      
      toast.success("Simulasi selesai!", {
        id: loadingToast,
        description: "Hasil perhitungan PSO, GA, dan ILP berhasil didapatkan"
      });
      
      setCurrentPage('results');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error("Terjadi kesalahan", {
        id: loadingToast,
        description: error instanceof Error ? error.message : "Gagal menghubungi server backend"
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'input':
        return <InputPage onRunSimulation={handleRunSimulation} />;
      case 'results':
        return <ResultsPage results={results} inputData={inputData} plotlyPlots={plotlyPlots} onNavigate={setCurrentPage} />;
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
