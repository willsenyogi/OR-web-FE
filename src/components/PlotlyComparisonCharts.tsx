import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Plot from "react-plotly.js";

interface PlotlyComparisonChartsProps {
  distancePlot?: any; // Plotly JSON for distance comparison
  timePlot?: any;     // Plotly JSON for time comparison
}

export function PlotlyComparisonCharts({ distancePlot, timePlot }: PlotlyComparisonChartsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Distance Comparison */}
      {distancePlot && distancePlot.data && distancePlot.layout && (
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Total Jarak</CardTitle>
            <CardDescription>Jarak yang ditempuh oleh setiap algoritma</CardDescription>
          </CardHeader>
          <CardContent>
            <Plot
              data={distancePlot.data}
              layout={{
                ...distancePlot.layout,
                autosize: true,
                height: 350,
                margin: { t: 20, b: 40, l: 60, r: 20 },
              }}
              config={{
                responsive: true,
                displayModeBar: false,
                displaylogo: false,
              }}
              style={{ width: '100%', height: '350px' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Time Comparison */}
      {timePlot && timePlot.data && timePlot.layout && (
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Waktu Komputasi</CardTitle>
            <CardDescription>Waktu eksekusi setiap algoritma</CardDescription>
          </CardHeader>
          <CardContent>
            <Plot
              data={timePlot.data}
              layout={{
                ...timePlot.layout,
                autosize: true,
                height: 350,
                margin: { t: 20, b: 40, l: 60, r: 20 },
              }}
              config={{
                responsive: true,
                displayModeBar: false,
                displaylogo: false,
              }}
              style={{ width: '100%', height: '350px' }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
