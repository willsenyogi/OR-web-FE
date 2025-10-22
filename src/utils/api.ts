import { MDVRPData } from "../components/InputPage";
import { SolutionResult } from "./mdvrpSolver";


const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:8000/api';

interface BackendAlgorithmResult {
  best_assignment: number[];
  best_value: number;
  time: number;
  history: number[];
  plot?: any;
  vehicle_depot_map?: number[];
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
  rawBackendData?: BackendResponse;
  error?: string;
  message?: string;
}

export interface SimulationRequest {
  depots: number[][];
  customers: number[][];
  vehicle_per_depot: number[];
  vehicle_capacities: number[];
  customer_demands: number[];
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
 * Calculate Haversine distance
 */
function calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper untuk mengambil koordinat (agar lebih mudah dibaca)
type Location = { x: number; y: number };
function getCoords(loc: Location): [number, number] {
    return [loc.x, loc.y];
}

function isValidBackendResult(backendResult: BackendAlgorithmResult): boolean {
  if (backendResult.plot && Object.keys(backendResult.plot).length === 0) {
    return false;
  }
  if (!backendResult.best_assignment || backendResult.best_assignment.length === 0) {
    return false;
  }
  return true;
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
    if (backendResult.vehicle_depot_map && backendResult.vehicle_depot_map[vehicleIdx] !== undefined) {
      depotIdx = backendResult.vehicle_depot_map[vehicleIdx];
    }
    const depot = data.depots[depotIdx];
    
    
    let routeDistance = 0;
    const orderedRoute: number[] = [];
    
    const unvisited = new Set(customerIndices);
    let currentLocation: Location = depot;

    while (unvisited.size > 0) {
      let nearestDist = Infinity;
      let nearestCustIdx = -1;

      for (const custIdx of unvisited) {
        const customer = data.customers[custIdx];
        const dist = calculateDistance(...getCoords(currentLocation), ...getCoords(customer));
        
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestCustIdx = custIdx;
        }
      }

      routeDistance += nearestDist;
      orderedRoute.push(nearestCustIdx);
      currentLocation = data.customers[nearestCustIdx];
      unvisited.delete(nearestCustIdx);
    }
    
    routeDistance += calculateDistance(...getCoords(currentLocation), ...getCoords(depot));

    return {
      depot: depotIdx,
      vehicle: vehicleIdx,
      customers: orderedRoute,
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
    const failedAlgorithms: string[] = [];
    
    if (backendData.pso) {
      if (isValidBackendResult(backendData.pso)) {
        transformedData.pso = transformBackendResult(backendData.pso, 'PSO', data);
      } else {
        failedAlgorithms.push('PSO');
        console.warn('PSO algorithm did not produce valid routes');
      }
    }
    if (backendData.ga) {
      if (isValidBackendResult(backendData.ga)) {
        transformedData.ga = transformBackendResult(backendData.ga, 'GA', data);
      } else {
        failedAlgorithms.push('GA');
        console.warn('GA algorithm did not produce valid routes');
      }
    }
    if (backendData.ilp) {
      if (isValidBackendResult(backendData.ilp)) {
        transformedData.ilp = transformBackendResult(backendData.ilp, 'ILP', data);
      } else {
        failedAlgorithms.push('ILP');
        console.warn('ILP algorithm did not produce valid routes');
      }
    }
    
    // Check if at least one algorithm returned results
    if (!transformedData.pso && !transformedData.ga && !transformedData.ilp) {
      throw new Error('Backend tidak mengembalikan hasil algoritma apapun');
    }
    
    return {
      success: true,
      data: transformedData,
      rawBackendData: backendData,  // Keep original backend data for Plotly plots
      message: failedAlgorithms.length > 0 ? `Algoritma ${failedAlgorithms.join(', ')} gagal menghasilkan rute` : undefined,
    };
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error && error.message.includes('Memory Error')) {
      return {
        success: false,
        error: 'Ukuran data terlalu besar untuk menjalankan ILP. Silakan coba dengan data yang lebih kecil.',
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