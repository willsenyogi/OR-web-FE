import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function TemplateDownload() {
  const generateCSV = (headers: string[], rows: string[][]): string => {
    const csv = [headers.join(',')];
    rows.forEach(row => csv.push(row.join(',')));
    return csv.join('\n');
  };

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDepotTemplate = () => {
    const content = generateCSV(
      ['X', 'Y'],
      [
        ['10', '20'],
        ['50', '60'],
        ['80', '30'],
      ]
    );
    downloadCSV('template_depot.csv', content);
  };

  const downloadCustomerTemplate = () => {
    const content = generateCSV(
      ['X', 'Y', 'Demand'],
      [
        ['15', '25', '10'],
        ['35', '45', '15'],
        ['55', '35', '20'],
        ['65', '55', '12'],
        ['75', '15', '18'],
      ]
    );
    downloadCSV('template_customer.csv', content);
  };

  const downloadVehicleTemplate = () => {
    const content = generateCSV(
      ['Capacity', 'DepotID'],
      [
        ['100', '0'],
        ['120', '0'],
        ['100', '1'],
        ['150', '1'],
        ['100', '2'],
      ]
    );
    downloadCSV('template_vehicle.csv', content);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Template</CardTitle>
        <CardDescription>
          Download template file CSV untuk memudahkan input data
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
        <p className="text-sm text-muted-foreground">
          Template file dalam format CSV. Anda dapat mengedit menggunakan Excel atau aplikasi spreadsheet lainnya.
        </p>
      </CardContent>
    </Card>
  );
}
