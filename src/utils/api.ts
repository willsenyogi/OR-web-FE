import { MDVRPData } from "../components/InputPage";
import { SolutionResult } from "./mdvrpSolver";

// API Configuration - Ganti dengan URL backend Django Anda
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Backend response format dari Django
interface BackendAlgorithmResult {
  best_assignment: number[];  // customer index -> vehicle index mapping
  best_value: number;         // total distance/fitness
  time: number;               // execution time in seconds
  history: number[];          // fitness history per iteration
  plotly_map?: any;           // Optional: Plotly JSON for interactive map visualization
}

export interface APIResponse {
  success: boolean;
  data?: {
    pso: SolutionResult;
    ga: SolutionResult;
    ilp: SolutionResult;
  };
  plots?: {
    distance_comparison?: any; // Plotly JSON for distance bar chart
    time_comparison?: any;     // Plotly JSON for time bar chart
  };
  error?: string;
  message?: string;
}

export interface SimulationRequest {
  depots: Array<{ x: number; y: number }>;
  customers: Array<{ x: number; y: number; demand: number }>;
  vehicles: Array<{ id: number; capacity: number; depotId?: number }>;
  numDepots: number;
  numVehicles: number;
  vehicleCapacity: number;
  parameters?: {
    maxIterations?: number;
    populationSize?: number;
  };
}

/**
 * Calculate Haversine distance
 */
function calculateDistance(a: [number, number], b: [number, number]): number {
    const R_EARTH = 6371.0;
    const [lon1, lat1] = a.map(deg => (deg * Math.PI) / 180);
    const [lon2, lat2] = b.map(deg => (deg * Math.PI) / 180);

    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;

    const sa =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(sa));
    return R_EARTH * c;
}

/**
 * Transform backend assignment to detailed routes
 */
function transformBackendResult(
  backendResult: BackendAlgorithmResult,
  algorithmName: string,
  data: MDVRPData
): SolutionResult {
  // Group customers by vehicle
  const vehicleGroups: Map<number, number[]> = new Map();
  backendResult.best_assignment.forEach((vehicleIdx, customerIdx) => {
    if (!vehicleGroups.has(vehicleIdx)) {
      vehicleGroups.set(vehicleIdx, []);
    }
    vehicleGroups.get(vehicleIdx)!.push(customerIdx);
  });

  // Build routes with distances
  const routes = Array.from(vehicleGroups.entries()).map(([vehicleIdx, customerIndices]) => {
    if (customerIndices.length === 0) {
      return null;
    }

    // Determine depot for this vehicle
    let depotIdx = 0;
    if (data.vehicles && data.vehicles[vehicleIdx]) {
      depotIdx = data.vehicles[vehicleIdx].depotId || 0;
    }

    const depot = data.depots[depotIdx];
    
    // Calculate route distance
    let routeDistance = 0;
    
    if (customerIndices.length > 0) {
      // Distance from depot to first customer
      const firstCustomer = data.customers[customerIndices[0]];
      routeDistance += calculateDistance([depot.x, depot.y], [firstCustomer.x, firstCustomer.y]);
      
      // Distance between consecutive customers
      for (let i = 0; i < customerIndices.length - 1; i++) {
        const c1 = data.customers[customerIndices[i]];
        const c2 = data.customers[customerIndices[i + 1]];
        routeDistance += calculateDistance([c1.x, c1.y], [c2.x, c2.y]);
      }
      
      // Distance from last customer back to depot
      const lastCustomer = data.customers[customerIndices[customerIndices.length - 1]];
      routeDistance += calculateDistance([lastCustomer.x, lastCustomer.y], [depot.x, depot.y]);
    }

    return {
      depot: depotIdx,
      vehicle: vehicleIdx,
      customers: customerIndices,
      distance: routeDistance,
    };
  }).filter(route => route !== null) as Array<{
    depot: number;
    vehicle: number;
    customers: number[];
    distance: number;
  }>;

  // Transform convergence history
  const convergenceData = backendResult.history.map((fitness, iteration) => ({
    iteration,
    fitness,
  }));

  return {
    algorithm: algorithmName,
    totalDistance: backendResult.best_value,
    executionTime: backendResult.time * 1000, // Convert seconds to milliseconds
    routes,
    convergenceData,
    plotlyMap: backendResult.plotly_map, // Include Plotly JSON if available
  };
}

/**
 * Menjalankan simulasi MDVRP dengan memanggil backend Django
 */
export async function runMDVRPSimulation(
  data: MDVRPData,
  parameters?: { maxIterations?: number; populationSize?: number }
): Promise<APIResponse> {
  try {
    const requestBody: SimulationRequest = {
      depots: data.depots,
      customers: data.customers,
      vehicles: data.vehicles || [],
      numDepots: data.numDepots,
      numVehicles: data.numVehicles,
      vehicleCapacity: data.vehicleCapacity,
      parameters: parameters || {},
    };

    const response = await fetch(`${API_BASE_URL}/mdvrp/solve/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const backendResult = await response.json();
    
    // Transform backend results to frontend format
    const transformedData = {
      pso: transformBackendResult(backendResult.pso, 'PSO', data),
      ga: transformBackendResult(backendResult.ga, 'GA', data),
      ilp: transformBackendResult(backendResult.ilp, 'ILP', data),
    };
    
    return {
      success: true,
      data: transformedData,
      plots: {
        distance_comparison: backendResult.plots?.distance_comparison,
        time_comparison: backendResult.plots?.time_comparison,
      },
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi server',
    };
  }
}

/**
 * Fungsi untuk mengecek koneksi ke backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Fungsi untuk mendapatkan info backend
 */
export async function getBackendInfo(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/info/`, {
      method: 'GET',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to get backend info:', error);
    return null;
  }
}
