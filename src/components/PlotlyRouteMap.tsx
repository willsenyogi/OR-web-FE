import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Plot from "react-plotly.js";

interface PlotlyRouteMapProps {
  plotData: any; // Plotly JSON from backend
  algorithmName: string;
  totalDistance: number;
  executionTime: number;
}

export function PlotlyRouteMap({ plotData, algorithmName, totalDistance, executionTime }: PlotlyRouteMapProps) {
  if (!plotData || !plotData.data || !plotData.layout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualisasi Rute - {algorithmName}</CardTitle>
          <CardDescription>Data plot tidak tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data visualisasi untuk ditampilkan
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisasi Rute Interaktif - {algorithmName}</CardTitle>
        <CardDescription>
          Peta distribusi rute dengan dropdown untuk melihat detail per kendaraan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plotly Interactive Map */}
          <div className="w-full">
            <Plot
              data={plotData.data}
              layout={{
                ...plotData.layout,
                autosize: true,
                height: 600,
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              }}
              style={{ width: '100%', height: '600px' }}
            />
          </div>

          {/* Summary Info */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Jarak:</span>
                  <span className="font-medium">{totalDistance.toFixed(2)} km</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu Komputasi:</span>
                  <span className="font-medium">{executionTime.toFixed(2)} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
