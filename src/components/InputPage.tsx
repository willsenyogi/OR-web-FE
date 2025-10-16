import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileUpload } from "./FileUpload";
import { TemplateDownload } from "./TemplateDownload";
import { Play, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

export interface MDVRPData {
  numDepots: number;
  numVehicles: number;
  vehicleCapacity: number;
  customers: Array<{ x: number; y: number; demand: number }>;
  depots: Array<{ x: number; y: number }>;
  vehicles?: Array<{ id: number; capacity: number; depotId?: number }>;
}

interface InputPageProps {
  onRunSimulation: (data: MDVRPData, parameters: { maxIterations: number; populationSize: number }) => void | Promise<void>;
}

export function InputPage({ onRunSimulation }: InputPageProps) {
  const [depotData, setDepotData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  
  const [maxIterations, setMaxIterations] = useState(100);
  const [populationSize, setPopulationSize] = useState(50);

  const handleDepotFileLoaded = (data: any[]) => {
    setDepotData(data);
  };

  const handleCustomerFileLoaded = (data: any[]) => {
    setCustomerData(data);
  };

  const handleVehicleFileLoaded = (data: any[]) => {
    setVehicleData(data);
  };

  const validateInputs = (): boolean => {
    if (depotData.length === 0) {
      toast.error('Harap upload file koordinat depot');
      return false;
    }
    if (customerData.length === 0) {
      toast.error('Harap upload file koordinat pelanggan');
      return false;
    }
    if (vehicleData.length === 0) {
      toast.error('Harap upload file data kendaraan');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    // Parse depot data
    const depots = depotData.map(row => ({
      x: parseFloat(row.Longitude),
      y: parseFloat(row.Latitude),
    }));

    // Parse customer data
    const customers = customerData.map(row => ({
      x: parseFloat(row.Longitude),
      y: parseFloat(row.Latitude),
      demand: parseFloat(row.Demand),
    }));

    // Parse vehicle data - hanya capacity, backend yang handle assignment
    const vehicles = vehicleData.map((row, idx) => ({
      id: idx,
      capacity: parseFloat(row.Capacity),
    }));

    // Calculate aggregated values
    const numDepots = depots.length;
    const numVehicles = Math.ceil(vehicles.length / numDepots);
    const vehicleCapacity = vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + v.capacity, 0) / vehicles.length)
      : 100;

    const mdvrpData: MDVRPData = {
      numDepots,
      numVehicles,
      vehicleCapacity,
      customers,
      depots,
      vehicles,
    };

    const parameters = {
      maxIterations,
      populationSize,
    };

    onRunSimulation(mdvrpData, parameters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Input Data Simulasi</h1>
          <p className="text-muted-foreground">
            Upload file CSV atau XLSX untuk data depot, pelanggan, dan kendaraan
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <TemplateDownload />

          <Card className="mb-6 mt-6">
            <CardHeader>
              <CardTitle>Upload Data</CardTitle>
              <CardDescription>
                Upload file dalam format CSV atau XLSX dengan kolom yang sesuai
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload
                fileType="depot"
                label="Data Koordinat Depot"
                description="Format: kolom Longitude, Latitude"
                onFileLoaded={handleDepotFileLoaded}
              />

              <FileUpload
                fileType="customer"
                label="Data Koordinat Pelanggan & Demand"
                description="Format: kolom Longitude, Latitude, Demand"
                onFileLoaded={handleCustomerFileLoaded}
              />

              <FileUpload
                fileType="vehicle"
                label="Data Kendaraan & Kapasitas"
                description="Format: kolom Capacity"
                onFileLoaded={handleVehicleFileLoaded}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pastikan file yang diupload memiliki header kolom yang sesuai. 
                  File CSV menggunakan koma (,) sebagai delimiter.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {(depotData.length > 0 || customerData.length > 0 || vehicleData.length > 0) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Preview Data</CardTitle>
                <CardDescription>
                  Data yang telah diupload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="depot">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="depot">
                      Depot ({depotData.length})
                    </TabsTrigger>
                    <TabsTrigger value="customer">
                      Pelanggan ({customerData.length})
                    </TabsTrigger>
                    <TabsTrigger value="vehicle">
                      Kendaraan ({vehicleData.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="depot">
                    {depotData.length > 0 ? (
                      <ScrollArea className="h-[300px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No</TableHead>
                              <TableHead>Longitude</TableHead>
                              <TableHead>Latitude</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {depotData.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row.Longitude}</TableCell>
                                <TableCell>{row.Latitude}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada data depot
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="customer">
                    {customerData.length > 0 ? (
                      <ScrollArea className="h-[300px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No</TableHead>
                              <TableHead>Longitude</TableHead>
                              <TableHead>Latitude</TableHead>
                              <TableHead>Demand</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerData.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row.Longitude}</TableCell>
                                <TableCell>{row.Latitude}</TableCell>
                                <TableCell>{row.Demand}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada data pelanggan
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="vehicle">
                    {vehicleData.length > 0 ? (
                      <ScrollArea className="h-[300px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No</TableHead>
                              <TableHead>Capacity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vehicleData.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row.Capacity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada data kendaraan
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parameter Algoritma</CardTitle>
              <CardDescription>
                Konfigurasi untuk algoritma optimasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxIterations">Iterasi Maksimal</Label>
                  <Input
                    id="maxIterations"
                    type="number"
                    min="10"
                    max="1000"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="populationSize">Population Size (GA/PSO)</Label>
                  <Input
                    id="populationSize"
                    type="number"
                    min="10"
                    max="200"
                    value={populationSize}
                    onChange={(e) => setPopulationSize(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="submit" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Jalankan Simulasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
