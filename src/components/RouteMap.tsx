import { SolutionResult } from "../utils/mdvrpSolver";
import { MDVRPData } from "./InputPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Warehouse, Truck } from "lucide-react";

interface RouteMapProps {
  data: MDVRPData;
  result: SolutionResult;
  algorithmName: string;
}

export function RouteMap({ data, result, algorithmName }: RouteMapProps) {
  // Calculate bounding box for all points
  const allX = [
    ...data.depots.map(d => d.x),
    ...data.customers.map(c => c.x)
  ];
  const allY = [
    ...data.depots.map(d => d.y),
    ...data.customers.map(c => c.y)
  ];

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  // Add padding
  const padding = 20;
  const width = 600;
  const height = 500;
  
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Scale function to convert coordinates to SVG space
  const scaleX = (x: number) => ((x - minX) / rangeX) * (width - 2 * padding) + padding;
  const scaleY = (y: number) => height - (((y - minY) / rangeY) * (height - 2 * padding) + padding);

  // Colors for different routes
  const routeColors = [
    '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisasi Rute - {algorithmName}</CardTitle>
        <CardDescription>
          Peta distribusi rute kendaraan dari depot ke pelanggan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* SVG Map */}
          <div className="flex-1">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${width} ${height}`}
              className="border rounded-lg bg-secondary/20"
            >
              {/* Draw routes first (behind points) */}
              {result.routes.map((route, routeIdx) => {
                const color = routeColors[routeIdx % routeColors.length];
                const depot = data.depots[route.depot];
                
                if (route.customers.length === 0) return null;

                // Create path: depot -> customers -> depot
                const points = [
                  { x: scaleX(depot.x), y: scaleY(depot.y) },
                  ...route.customers.map(custIdx => ({
                    x: scaleX(data.customers[custIdx].x),
                    y: scaleY(data.customers[custIdx].y)
                  })),
                  { x: scaleX(depot.x), y: scaleY(depot.y) }
                ];

                const pathD = points.map((p, i) => 
                  `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                ).join(' ');

                return (
                  <g key={`route-${routeIdx}`}>
                    <path
                      d={pathD}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                  </g>
                );
              })}

              {/* Draw depots */}
              {data.depots.map((depot, idx) => {
                const x = scaleX(depot.x);
                const y = scaleY(depot.y);
                return (
                  <g key={`depot-${idx}`}>
                    <rect
                      x={x - 8}
                      y={y - 8}
                      width="16"
                      height="16"
                      fill="#dc2626"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#000"
                    >
                      D{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Draw customers */}
              {data.customers.map((customer, idx) => {
                const x = scaleX(customer.x);
                const y = scaleY(customer.y);
                
                // Find which route this customer belongs to
                const routeIdx = result.routes.findIndex(r => 
                  r.customers.includes(idx)
                );
                const color = routeIdx >= 0 
                  ? routeColors[routeIdx % routeColors.length]
                  : '#6b7280';

                return (
                  <g key={`customer-${idx}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666"
                    >
                      {customer.demand}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="lg:w-48 space-y-4">
            <div>
              <h4 className="mb-2">Legenda</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 border-2 border-white" />
                  <span className="text-sm">Depot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                  <span className="text-sm">Pelanggan</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="2">
                    <line x1="0" y1="1" x2="20" y2="1" stroke="#666" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                  <span className="text-sm">Rute</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2">Rute</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {result.routes.map((route, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: routeColors[idx % routeColors.length] }}
                    />
                    <span className="text-xs">
                      V{route.vehicle + 1}: {route.customers.length} pelanggan
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Jarak:</span>
                  <span>{result.totalDistance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span>{result.executionTime.toFixed(2)} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
