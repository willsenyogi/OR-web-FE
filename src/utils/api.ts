import { MDVRPData } from "../components/InputPage";
import { SolutionResult } from "./mdvrpSolver";

// API Configuration - Ganti dengan URL backend Django Anda
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:8000/api';

// Backend response format dari Django
interface BackendAlgorithmResult {
  best_assignment: number[];  // customer index -> vehicle index mapping
  best_value: number;         // total distance/fitness
  time: number;               // execution time in seconds
  history: number[];          // fitness history per iteration
  plot?: any;                 // Plotly JSON for route map visualization
}

export interface BackendResponse {
  pso?: BackendAlgorithmResult;
  ga?: BackendAlgorithmResult;
  ilp?: BackendAlgorithmResult;
}

export interface APIResponse {
  success: boolean;
  data?: {
    pso?: SolutionResult;
    ga?: SolutionResult;
    ilp?: SolutionResult;
  };
  rawBackendData?: BackendResponse;  // Keep original backend data
  error?: string;
  message?: string;
}

export interface SimulationRequest {
  depots: number[][];  // [[longitude, latitude], ...]
  customers: number[][];  // [[longitude, latitude], ...]
  vehicle_per_depot: number[];  // [vehicles_count_depot_0, vehicles_count_depot_1, ...]
  vehicle_capacities: number[];  // [capacity1, capacity2, ...]
  customer_demands: number[];  // [demand1, demand2, ...]
  parameters?: {
    maxIterations?: number;
    populationSize?: number;
    pso_c1?: number;
    pso_c2?: number;
    pso_w?: number;
    ga_crossover_prob?: number;
    ga_mutation_prob?: number;
    run_ilp?: boolean;
  };
}

/**
 * Calculate Euclidean distance
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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
      routeDistance += calculateDistance(depot.x, depot.y, firstCustomer.x, firstCustomer.y);
      
      // Distance between consecutive customers
      for (let i = 0; i < customerIndices.length - 1; i++) {
        const c1 = data.customers[customerIndices[i]];
        const c2 = data.customers[customerIndices[i + 1]];
        routeDistance += calculateDistance(c1.x, c1.y, c2.x, c2.y);
      }
      
      // Distance from last customer back to depot
      const lastCustomer = data.customers[customerIndices[customerIndices.length - 1]];
      routeDistance += calculateDistance(lastCustomer.x, lastCustomer.y, depot.x, depot.y);
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
    plotlyMap: backendResult.plot, // Include Plotly JSON if available
  };
}

/**
 * Menjalankan simulasi MDVRP dengan memanggil backend Django
 */
export async function runMDVRPSimulation(
  data: MDVRPData,
  parameters?: {
    maxIterations?: number;
    populationSize?: number;
    pso_c1?: number;
    pso_c2?: number;
    pso_w?: number;
    ga_crossover_prob?: number;
    ga_mutation_prob?: number;
    run_ilp?: boolean;
  }
): Promise<APIResponse> {
  try {
    // Transform data ke format yang diharapkan backend
    // Backend expects: [[lon, lat], ...] bukan [{x, y}, ...]
    const depots = data.depots.map(d => [d.x, d.y]);
    const customers = data.customers.map(c => [c.x, c.y]);
    const customer_demands = data.customers.map(c => c.demand);
    const vehicle_capacities = (data.vehicles || []).map(v => v.capacity);
    
    // Calculate vehicle_per_depot - distribusi merata (round-robin)
    const numDepots = data.numDepots;
    const numVehicles = (data.vehicles || []).length;
    const vehicle_per_depot: number[] = new Array(numDepots).fill(0);
    
    for (let i = 0; i < numVehicles; i++) {
      const depotIndex = i % numDepots;
      vehicle_per_depot[depotIndex]++;
    }

    const requestBody: SimulationRequest = {
      depots,
      customers,
      vehicle_per_depot,
      vehicle_capacities,
      customer_demands,
      parameters: parameters || {},
    };

    console.log('Sending request to backend:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/optimize`, {
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

    const responseJson = await response.json();
    
    console.log('Received backend response:', JSON.stringify(responseJson, null, 2));
    
    // Handle different response structures - backend may wrap data in a "data" field or return directly
    const backendData: BackendResponse = responseJson.data || responseJson;
    
    // Transform backend results to frontend format - only transform what exists
    const transformedData: any = {};
    
    if (backendData.pso) {
      transformedData.pso = transformBackendResult(backendData.pso, 'PSO', data);
    }
    if (backendData.ga) {
      transformedData.ga = transformBackendResult(backendData.ga, 'GA', data);
    }
    if (backendData.ilp) {
      transformedData.ilp = transformBackendResult(backendData.ilp, 'ILP', data);
    }
    
    // Check if at least one algorithm returned results
    if (!transformedData.pso && !transformedData.ga && !transformedData.ilp) {
      throw new Error('Backend tidak mengembalikan hasil algoritma apapun');
    }
    
    return {
      success: true,
      data: transformedData,
      rawBackendData: backendData,  // Keep original backend data for Plotly plots
    };
  } catch (error) {
    console.error('API Error:', error);

    if (error = 'Memory Error'){
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ukuran data terlalu besar untuk menjalankan ILP. Silakan coba dengan data yang lebih kecil.',
      };
    }
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
