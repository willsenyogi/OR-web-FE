import { MDVRPData } from "../components/InputPage";
import { SolutionResult } from "./mdvrpSolver";

// Dummy input data
export const dummyInputData: MDVRPData = {
  numDepots: 2,
  numVehicles: 3,
  vehicleCapacity: 100,
  depots: [
    { x: 50, y: 50 },
    { x: 150, y: 150 }
  ],
  customers: [
    { x: 30, y: 80, demand: 15 },
    { x: 70, y: 90, demand: 20 },
    { x: 90, y: 60, demand: 25 },
    { x: 40, y: 120, demand: 18 },
    { x: 110, y: 100, demand: 22 },
    { x: 130, y: 130, demand: 30 },
    { x: 160, y: 110, demand: 12 },
    { x: 170, y: 160, demand: 28 },
    { x: 140, y: 180, demand: 16 },
    { x: 100, y: 140, demand: 19 },
    { x: 60, y: 100, demand: 24 },
    { x: 80, y: 130, demand: 21 }
  ],
  vehicles: [
    { id: 0, capacity: 100, depotId: 0 },
    { id: 1, capacity: 100, depotId: 0 },
    { id: 2, capacity: 100, depotId: 1 },
    { id: 3, capacity: 100, depotId: 1 }
  ]
};

// Dummy PSO result
export const dummyPSOResult: SolutionResult = {
  routes: [
    { depot: 0, vehicle: 0, customers: [0, 1, 3, 10], distance: 142.35 },
    { depot: 0, vehicle: 1, customers: [2, 4], distance: 98.67 },
    { depot: 1, vehicle: 2, customers: [5, 6, 7], distance: 156.89 },
    { depot: 1, vehicle: 3, customers: [8, 9, 11], distance: 134.21 }
  ],
  totalDistance: 532.12,
  executionTime: 245.67,
  convergenceData: [
    { iteration: 0, fitness: 680.5 },
    { iteration: 5, fitness: 645.2 },
    { iteration: 10, fitness: 612.8 },
    { iteration: 15, fitness: 589.3 },
    { iteration: 20, fitness: 570.1 },
    { iteration: 25, fitness: 558.6 },
    { iteration: 30, fitness: 548.9 },
    { iteration: 35, fitness: 542.3 },
    { iteration: 40, fitness: 537.8 },
    { iteration: 45, fitness: 534.5 },
    { iteration: 50, fitness: 532.12 }
  ]
};

// Dummy GA result
export const dummyGAResult: SolutionResult = {
  routes: [
    { depot: 0, vehicle: 0, customers: [0, 3, 10, 11], distance: 148.92 },
    { depot: 0, vehicle: 1, customers: [1, 2, 4], distance: 125.43 },
    { depot: 1, vehicle: 2, customers: [5, 6, 7, 9], distance: 168.74 },
    { depot: 1, vehicle: 3, customers: [8], distance: 45.28 }
  ],
  totalDistance: 488.37,
  executionTime: 312.45,
  convergenceData: [
    { iteration: 0, fitness: 720.4 },
    { iteration: 5, fitness: 672.1 },
    { iteration: 10, fitness: 628.5 },
    { iteration: 15, fitness: 595.7 },
    { iteration: 20, fitness: 568.3 },
    { iteration: 25, fitness: 545.9 },
    { iteration: 30, fitness: 528.2 },
    { iteration: 35, fitness: 514.6 },
    { iteration: 40, fitness: 503.8 },
    { iteration: 45, fitness: 495.2 },
    { iteration: 50, fitness: 488.37 }
  ]
};

// Dummy ILP result (best solution)
export const dummyILPResult: SolutionResult = {
  routes: [
    { depot: 0, vehicle: 0, customers: [0, 1, 3], distance: 115.64 },
    { depot: 0, vehicle: 1, customers: [2, 4, 10], distance: 132.89 },
    { depot: 1, vehicle: 2, customers: [5, 6, 7, 8], distance: 152.36 },
    { depot: 1, vehicle: 3, customers: [9, 11], distance: 67.45 }
  ],
  totalDistance: 468.34,
  executionTime: 89.23,
  convergenceData: [
    { iteration: 0, fitness: 650.2 },
    { iteration: 5, fitness: 580.5 },
    { iteration: 10, fitness: 532.8 },
    { iteration: 15, fitness: 505.3 },
    { iteration: 20, fitness: 485.6 },
    { iteration: 25, fitness: 473.9 },
    { iteration: 30, fitness: 468.34 }
  ]
};

export const dummyResults = {
  pso: dummyPSOResult,
  ga: dummyGAResult,
  ilp: dummyILPResult
};
