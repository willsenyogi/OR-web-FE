import { FlaskConical, Home, FileInput, BarChart3, Info } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'input', label: 'Input Data', icon: FileInput },
    { id: 'results', label: 'Hasil', icon: BarChart3 },
    { id: 'about', label: 'Tentang', icon: Info },
  ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6" />
            <span>Simulasi MDVRP</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    currentPage === item.id
                      ? 'bg-primary-foreground text-primary'
                      : 'hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
