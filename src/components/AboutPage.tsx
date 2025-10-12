import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { BookOpen, Code, Lightbulb, Users } from "lucide-react";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Tentang Aplikasi</h1>
          <p className="text-muted-foreground">
            Simulasi dan Perbandingan Algoritma untuk Multi-Depot Vehicle Routing Problem
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Apa itu MDVRP?</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Multi-Depot Vehicle Routing Problem (MDVRP) adalah permasalahan optimasi kombinatorial 
              yang merupakan ekstensi dari Vehicle Routing Problem (VRP) klasik. Dalam MDVRP, 
              terdapat beberapa depot (pusat distribusi) dan setiap depot memiliki sejumlah kendaraan 
              yang harus melayani sekelompok pelanggan.
            </p>
            <p>
              Tujuan dari MDVRP adalah menemukan rute optimal untuk semua kendaraan dari berbagai depot 
              sehingga semua pelanggan terlayani dengan total jarak atau biaya minimal, dengan mempertimbangkan 
              batasan kapasitas kendaraan.
            </p>
            <div className="bg-accent/50 p-4 rounded-lg">
              <h4 className="mb-2">Karakteristik MDVRP:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Terdapat m depot dan n pelanggan</li>
                <li>Setiap depot memiliki sejumlah kendaraan dengan kapasitas tertentu</li>
                <li>Setiap pelanggan memiliki permintaan yang harus dipenuhi</li>
                <li>Setiap kendaraan dimulai dan berakhir di depot yang sama</li>
                <li>Setiap pelanggan hanya dikunjungi tepat satu kali</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Algoritma yang Digunakan</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="mb-2">1. Particle Swarm Optimization (PSO)</h4>
              <p className="text-muted-foreground mb-2">
                PSO adalah algoritma metaheuristik berbasis populasi yang terinspirasi dari perilaku sosial 
                kawanan burung atau ikan. Setiap partikel dalam populasi merepresentasikan solusi potensial 
                dan bergerak dalam ruang pencarian berdasarkan pengalaman pribadi dan kolektif.
              </p>
              <div className="bg-accent/30 p-3 rounded">
                <p className="text-muted-foreground">
                  <strong>Keunggulan:</strong> Konvergensi cepat, implementasi sederhana, cocok untuk ruang pencarian kontinyu.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2">2. Genetic Algorithm (GA)</h4>
              <p className="text-muted-foreground mb-2">
                GA adalah algoritma evolusioner yang meniru proses seleksi alam. Algoritma ini menggunakan 
                operasi genetik seperti seleksi, crossover, dan mutasi untuk mengevolusi populasi solusi 
                menuju solusi yang lebih baik dari generasi ke generasi.
              </p>
              <div className="bg-accent/30 p-3 rounded">
                <p className="text-muted-foreground">
                  <strong>Keunggulan:</strong> Eksplorasi ruang pencarian yang baik, dapat menghindari local optima, 
                  fleksibel untuk berbagai tipe masalah.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2">3. Integer Linear Programming (ILP)</h4>
              <p className="text-muted-foreground mb-2">
                ILP adalah metode optimasi matematis yang mencari solusi optimal dengan memformulasikan 
                masalah sebagai program linear dengan variabel bilangan bulat. Metode ini menggunakan 
                teknik branch-and-bound atau cutting plane untuk menemukan solusi optimal.
              </p>
              <div className="bg-accent/30 p-3 rounded">
                <p className="text-muted-foreground">
                  <strong>Keunggulan:</strong> Dapat menemukan solusi optimal (jika waktu cukup), memberikan 
                  bound untuk kualitas solusi, basis matematis yang kuat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Cara Menggunakan Aplikasi</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Input Data:</strong> Masukkan parameter simulasi seperti jumlah depot, 
                kendaraan, kapasitas, dan pelanggan di halaman Input Data.
              </li>
              <li>
                <strong>Jalankan Simulasi:</strong> Klik tombol "Jalankan Simulasi" untuk memulai 
                proses optimasi dengan ketiga algoritma.
              </li>
              <li>
                <strong>Lihat Hasil:</strong> Setelah simulasi selesai, Anda akan diarahkan ke halaman 
                Hasil yang menampilkan perbandingan performa algoritma.
              </li>
              <li>
                <strong>Analisis:</strong> Bandingkan metrik seperti total jarak, waktu eksekusi, 
                dan kurva konvergensi untuk memahami kelebihan dan kekurangan masing-masing algoritma.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informasi Tambahan</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Aplikasi ini dibuat untuk tujuan edukatif dan penelitian dalam bidang optimasi 
              dan vehicle routing. Hasil simulasi menggunakan implementasi sederhana dari 
              algoritma-algoritma yang disebutkan.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Catatan:</strong> Implementasi algoritma dalam aplikasi ini adalah versi 
                simulasi yang disederhanakan. Untuk aplikasi riil, diperlukan implementasi yang 
                lebih kompleks dengan parameter tuning yang tepat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
