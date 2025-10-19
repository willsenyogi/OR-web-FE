import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SolutionResult } from "../utils/mdvrpSolver";
import { MDVRPData } from "./InputPage";
import { BackendResponse } from "../utils/api";
import { RouteMap } from "./RouteMap";
import { PlotlyRouteMap } from "./PlotlyRouteMap";
import { PlotlyComparisonCharts } from "./PlotlyComparisonCharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Trophy, Clock, Route, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";

interface ResultsPageProps {
  results: {
    pso?: SolutionResult;
    ga?: SolutionResult;
    ilp?: SolutionResult;
  } | null;
  inputData: MDVRPData | null;
  backendData?: BackendResponse | null;
  onNavigate?: (page: string) => void;
}

export function ResultsPage({ results, inputData, backendData, onNavigate }: ResultsPageProps) {
  if (!results || !inputData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="mb-2">Hasil Simulasi</h1>
            <p className="text-muted-foreground">
              Lihat perbandingan performa algoritma PSO, GA, dan ILP
            </p>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <AlertCircle className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3>Belum Ada Hasil Simulasi</h3>
                <p className="text-muted-foreground">
                  Anda belum menjalankan simulasi. Silakan masuk ke halaman Input Data untuk mengupload data dan menjalankan simulasi algoritma MDVRP.
                </p>
              </div>
              
              {onNavigate && (
                <Button onClick={() => onNavigate('input')} size="lg">
                  Ke Halaman Input Data
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Yang Akan Ditampilkan</CardTitle>
              <CardDescription>
                Setelah menjalankan simulasi, halaman ini akan menampilkan:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Plot Map Pembagian Rute:</strong> Visualisasi depot, pelanggan, dan rute kendaraan</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Tabel Perbandingan:</strong> Waktu komputasi dan total jarak rute untuk PSO, GA, dan ILP</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Grafik Batang:</strong> Perbandingan visual jarak dan waktu eksekusi</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Kurva Konvergensi:</strong> Grafik konvergensi iterasi untuk setiap algoritma</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Detail Rute:</strong> Informasi lengkap setiap rute kendaraan</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use backend data if available, otherwise use frontend calculated
  // Order: ILP first, then PSO, then GA
  const comparisonData = [
    ...(results.ilp ? [{ 
      name: 'ILP', 
      distance: backendData?.ilp?.best_value ?? results.ilp.totalDistance, 
      time: backendData?.ilp?.time ? backendData.ilp.time * 1000 : results.ilp.executionTime, 
      routes: results.ilp.routes.length 
    }] : []),
    ...(results.pso ? [{ 
      name: 'PSO', 
      distance: backendData?.pso?.best_value ?? results.pso.totalDistance, 
      time: backendData?.pso?.time ? backendData.pso.time * 1000 : results.pso.executionTime, 
      routes: results.pso.routes.length 
    }] : []),
    ...(results.ga ? [{ 
      name: 'GA', 
      distance: backendData?.ga?.best_value ?? results.ga.totalDistance, 
      time: backendData?.ga?.time ? backendData.ga.time * 1000 : results.ga.executionTime, 
      routes: results.ga.routes.length 
    }] : []),
  ];

  // Find best algorithm - ILP gets priority if distances are equal
  const bestByDistance = [...comparisonData].sort((a, b) => {
    const diff = a.distance - b.distance;
    if (diff === 0) {
      // If equal, prioritize ILP
      if (a.name === 'ILP') return -1;
      if (b.name === 'ILP') return 1;
      return 0;
    }
    return diff;
  })[0];
  const bestByTime = [...comparisonData].sort((a, b) => {
    const diff = a.time - b.time;
    if (diff === 0) {
      // If equal, prioritize ILP
      if (a.name === 'ILP') return -1;
      if (b.name === 'ILP') return 1;
      return 0;
    }
    return diff;
  })[0];

  // Convergence data - combine all algorithms (order: ILP, PSO, GA)
  const maxLength = Math.max(
    results.ilp?.convergenceData.length || 0,
    results.pso?.convergenceData.length || 0,
    results.ga?.convergenceData.length || 0
  );

  const convergenceComparison = Array.from({ length: maxLength }, (_, i) => {
    const dataPoint: any = { iteration: i };
    if (results.ilp) {
      dataPoint.ILP = results.ilp.convergenceData[i]?.fitness || results.ilp.convergenceData[results.ilp.convergenceData.length - 1]?.fitness;
    }
    if (results.pso) {
      dataPoint.PSO = results.pso.convergenceData[i]?.fitness || results.pso.convergenceData[results.pso.convergenceData.length - 1]?.fitness;
    }
    if (results.ga) {
      dataPoint.GA = results.ga.convergenceData[i]?.fitness || results.ga.convergenceData[results.ga.convergenceData.length - 1]?.fitness;
    }
    return dataPoint;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Hasil Simulasi</h1>
          <p className="text-muted-foreground">
            Perbandingan performa algoritma PSO, GA, dan ILP
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Jarak Terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <div>{bestByDistance.distance.toFixed(2)}</div>
                  <p className="text-muted-foreground">{bestByDistance.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Waktu Tercepat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <div>{bestByTime.time.toFixed(2)} ms</div>
                  <p className="text-muted-foreground">{bestByTime.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Jumlah Rute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-green-500" />
                <div>
                  <div>{results.ilp?.routes.length || results.pso?.routes.length || results.ga?.routes.length || 0}</div>
                  <p className="text-muted-foreground">Rute total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Selisih Terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-500" />
                <div>
                  <div>
                    {(((Math.max(...comparisonData.map(d => d.distance)) - Math.min(...comparisonData.map(d => d.distance))) / 
                      Math.min(...comparisonData.map(d => d.distance))) * 100).toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">Deviasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table - Waktu Komputasi dan Total Jarak */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tabel Perbandingan Algoritma</CardTitle>
            <CardDescription>Perbandingan waktu komputasi dan total jarak rute</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Algoritma</TableHead>
                  <TableHead>Waktu Komputasi (ms)</TableHead>
                  <TableHead>Total Jarak Rute</TableHead>
                  <TableHead>Jumlah Rute</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((data) => (
                  <TableRow key={data.name}>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>
                      <span className={data.name === bestByTime.name ? "font-bold text-green-600" : ""}>
                        {data.time.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={data.name === bestByDistance.name ? "font-bold text-green-600" : ""}>
                        {data.distance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{data.routes}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {data.name === bestByDistance.name && (
                          <Badge variant="default">Jarak Terbaik</Badge>
                        )}
                        {data.name === bestByTime.name && (
                          <Badge variant="secondary">Tercepat</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Route Visualization Maps - Use Plotly if available, else fallback to SVG */}
        <div className="mb-8">
          <h2 className="mb-4">Plot Map Pembagian Rute</h2>
          <Tabs defaultValue={results.ilp ? "ilp" : results.pso ? "pso" : "ga"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {results.ilp && <TabsTrigger value="ilp">ILP</TabsTrigger>}
              {results.pso && <TabsTrigger value="pso">PSO</TabsTrigger>}
              {results.ga && <TabsTrigger value="ga">GA</TabsTrigger>}
            </TabsList>
            {results.ilp && (
              <TabsContent value="ilp">
                {(backendData?.ilp?.plot || results.ilp.plotlyMap) ? (
                  <PlotlyRouteMap 
                    plotData={backendData?.ilp?.plot || results.ilp.plotlyMap} 
                    algorithmName="ILP"
                    totalDistance={backendData?.ilp?.best_value || results.ilp.totalDistance}
                    executionTime={backendData?.ilp?.time ? backendData.ilp.time * 1000 : results.ilp.executionTime}
                  />
                ) : (
                  <RouteMap data={inputData} result={results.ilp} algorithmName="ILP" />
                )}
              </TabsContent>
            )}
            {results.pso && (
              <TabsContent value="pso">
                {(backendData?.pso?.plot || results.pso.plotlyMap) ? (
                  <PlotlyRouteMap 
                    plotData={backendData?.pso?.plot || results.pso.plotlyMap} 
                    algorithmName="PSO"
                    totalDistance={backendData?.pso?.best_value || results.pso.totalDistance}
                    executionTime={backendData?.pso?.time ? backendData.pso.time * 1000 : results.pso.executionTime}
                  />
                ) : (
                  <RouteMap data={inputData} result={results.pso} algorithmName="PSO" />
                )}
              </TabsContent>
            )}
            {results.ga && (
              <TabsContent value="ga">
                {(backendData?.ga?.plot || results.ga.plotlyMap) ? (
                  <PlotlyRouteMap 
                    plotData={backendData?.ga?.plot || results.ga.plotlyMap} 
                    algorithmName="GA"
                    totalDistance={backendData?.ga?.best_value || results.ga.totalDistance}
                    executionTime={backendData?.ga?.time ? backendData.ga.time * 1000 : results.ga.executionTime}
                  />
                ) : (
                  <RouteMap data={inputData} result={results.ga} algorithmName="GA" />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Charts - Comparison bar charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Perbandingan Jarak Total</CardTitle>
                <CardDescription>Jarak yang ditempuh oleh setiap algoritma</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="distance" fill="#030213" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Perbandingan Waktu Eksekusi</CardTitle>
                <CardDescription>Waktu komputasi setiap algoritma (ms)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="time" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        {/* Convergence Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kurva Konvergensi</CardTitle>
            <CardDescription>Perbandingan kecepatan konvergensi algoritma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={convergenceComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" label={{ value: 'Iterasi', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Fitness (Total Jarak)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {results.ilp && <Line type="monotone" dataKey="ILP" stroke="#22c55e" strokeWidth={2} />}
                {results.pso && <Line type="monotone" dataKey="PSO" stroke="#ef4444" strokeWidth={2} />}
                {results.ga && <Line type="monotone" dataKey="GA" stroke="#3b82f6" strokeWidth={2} />}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Rute</CardTitle>
            <CardDescription>Rute kendaraan dari setiap algoritma</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={results.ilp ? "ilp" : results.pso ? "pso" : "ga"}>
              <TabsList className="grid w-full grid-cols-3">
                {results.ilp && <TabsTrigger value="ilp">ILP</TabsTrigger>}
                {results.pso && <TabsTrigger value="pso">PSO</TabsTrigger>}
                {results.ga && <TabsTrigger value="ga">GA</TabsTrigger>}
              </TabsList>
              {results.ilp && (
                <TabsContent value="ilp">
                  <RouteTable routes={results.ilp.routes} />
                </TabsContent>
              )}
              {results.pso && (
                <TabsContent value="pso">
                  <RouteTable routes={results.pso.routes} />
                </TabsContent>
              )}
              {results.ga && (
                <TabsContent value="ga">
                  <RouteTable routes={results.ga.routes} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RouteTable({ routes }: { routes: Array<{ depot: number; vehicle: number; customers: number[]; distance: number }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kendaraan</TableHead>
          <TableHead>Depot</TableHead>
          <TableHead>Pelanggan</TableHead>
          <TableHead>Jarak</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes.map((route, idx) => (
          <TableRow key={idx}>
            <TableCell>Kendaraan {route.vehicle + 1}</TableCell>
            <TableCell>Depot {route.depot + 1}</TableCell>
            <TableCell>{route.customers.length} pelanggan</TableCell>
            <TableCell>{route.distance.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
