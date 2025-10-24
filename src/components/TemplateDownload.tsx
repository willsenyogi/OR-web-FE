import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function TemplateDownload() {
  const downloadXLSX = async (filename: string, headers: string[], rows: any[][]) => {
    const XLSX = await import('xlsx');
    
    // Create worksheet data with headers
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate XLSX file and download
    XLSX.writeFile(wb, filename);
  };

  const downloadDepotTemplate = () => {
    // Sample coordinates from Shanghai area (longitude, latitude)
    downloadXLSX(
      'template_depot.xlsx',
      ['Longitude', 'Latitude'],
      [
        [121.27434, 31.02221],
        [121.42334, 31.2915],
        [121.52965, 31.02331],
        [121.28732, 31.00092],
        [121.36536, 31.08081],
      ]
    );
  };

  const downloadCustomerTemplate = () => {
    // Sample customer coordinates with realistic demands
    downloadXLSX(
      'template_customer.xlsx',
      ['Longitude', 'Latitude', 'Demand'],
      [
        [121.49627, 31.11846, 16],
        [121.53555, 31.0311, 19],
        [121.58687, 31.29782, 16],
        [121.6178, 31.32966, 11],
        [121.53394, 31.03913, 16],
        [121.27458, 31.13997, 17],
        [121.40455, 31.24223, 12],
        [121.49016, 31.04024, 19],
        [121.53213, 31.18523, 7],
        [121.40213, 31.22976, 18],
      ]
    );
  };

  const downloadVehicleTemplate = () => {
    downloadXLSX(
      'template_vehicle.xlsx',
      ['Capacity'],
      [
        [138],
        [128],
        [114],
        [142],
        [107],
        [120],
        [138],
        [118],
        [122],
        [110],
      ]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Template</CardTitle>
        <CardDescription>
          Download template file XLSX untuk memudahkan input data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadDepotTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Template Depot
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadCustomerTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Template Pelanggan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadVehicleTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Template Kendaraan
          </Button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Template file dalam format XLSX dengan contoh data koordinat geografis.</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Depot:</strong> Kolom Longitude, Latitude</li>
            <li><strong>Pelanggan:</strong> Kolom Longitude, Latitude, Demand (integer)</li>
            <li><strong>Kendaraan:</strong> Kolom Capacity (integer)</li>
          </ul>
          <p className="text-xs italic mt-2">Note: Depot assignment untuk kendaraan diproses oleh backend.</p>
        </div>
      </CardContent>
    </Card>
  );
}
