import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { InputPage, MDVRPData, AlgorithmParameters } from "./components/InputPage";
import { ResultsPage } from "./components/ResultsPage";
import { AboutPage } from "./components/AboutPage";
import { SolutionResult } from "./utils/mdvrpSolver";
import { dummyInputData, dummyResults } from "./utils/dummyData";
import { runMDVRPSimulation, BackendResponse } from "./utils/api";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [inputData, setInputData] = useState<MDVRPData | null>(null);
  const [results, setResults] = useState<{
    pso?: SolutionResult;
    ga?: SolutionResult;
    ilp?: SolutionResult;
  } | null>(null);
  const [backendData, setBackendData] = useState<BackendResponse | null>(null);

  const handleRunSimulation = async (
    data: MDVRPData,
    parameters: AlgorithmParameters
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
      
      console.log('Transformed results:', response.data);
      console.log('Backend data:', response.rawBackendData);
      
      setResults(response.data);
      setBackendData(response.rawBackendData || null);
      
      // Check if there are any warnings about failed algorithms
      if (response.message) {
        toast.warning("Simulasi selesai dengan peringatan", {
          id: loadingToast,
          description: response.message
        });
      } else {
        toast.success("Simulasi selesai!", {
          id: loadingToast,
          description: "Hasil perhitungan berhasil didapatkan untuk semua algoritma"
        });
      }
      
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
        return <ResultsPage results={results} inputData={inputData} backendData={backendData} onNavigate={setCurrentPage} />;
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
