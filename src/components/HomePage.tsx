import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, Target, Zap, GitCompare } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4">Simulasi MDVRP</h1>
          <p className="text-muted-foreground">
            Perbandingan Algoritma PSO, GA, dan ILP untuk Multi-Depot Vehicle Routing Problem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>PSO</CardTitle>
              <CardDescription>Particle Swarm Optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Algoritma berbasis swarm intelligence yang terinspirasi dari perilaku kawanan burung atau ikan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>GA</CardTitle>
              <CardDescription>Genetic Algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Algoritma evolusioner yang meniru proses seleksi alam untuk mencari solusi optimal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <GitCompare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>ILP</CardTitle>
              <CardDescription>Integer Linear Programming</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Metode matematis untuk mencari solusi optimal dengan variabel bilangan bulat.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-accent/50">
          <CardHeader>
            <CardTitle>Tentang MDVRP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Multi-Depot Vehicle Routing Problem (MDVRP) adalah pengembangan dari VRP klasik di mana 
              terdapat beberapa depot dan kendaraan harus melayani pelanggan dengan jarak dan biaya minimal.
            </p>
            <p className="mb-6">
              Aplikasi ini memungkinkan Anda untuk membandingkan performa tiga algoritma optimasi 
              dalam menyelesaikan masalah MDVRP.
            </p>
            <Button onClick={() => onNavigate('input')} className="w-full sm:w-auto">
              Mulai Simulasi <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
