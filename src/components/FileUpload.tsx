import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Upload, X, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoaded: (data: any[]) => void;
  fileType: 'depot' | 'customer' | 'vehicle';
  label: string;
  description: string;
}

export function FileUpload({ onFileLoaded, fileType, label, description }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    return data;
  };

  const parseXLSX = async (file: File): Promise<any[]> => {
    const XLSX = await import('xlsx');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const validateData = (data: any[]): boolean => {
    if (!data || data.length === 0) {
      toast.error('File kosong atau format tidak valid');
      return false;
    }

    const firstRow = data[0];
    
    switch (fileType) {
      case 'depot':
        if (!('Longitude' in firstRow && 'Latitude' in firstRow)) {
          toast.error('File depot harus memiliki kolom Longitude dan Latitude');
          return false;
        }
        break;
      case 'customer':
        if (!('Longitude' in firstRow && 'Latitude' in firstRow && 'Demand' in firstRow)) {
          toast.error('File pelanggan harus memiliki kolom Longitude, Latitude, dan Demand');
          return false;
        }
        break;
      case 'vehicle':
        if (!('Capacity' in firstRow)) {
          toast.error('File kendaraan harus memiliki kolom Capacity');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      let data: any[];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        data = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseXLSX(file);
      } else {
        toast.error('Format file tidak didukung. Gunakan CSV atau XLSX');
        setFileName(null);
        return;
      }

      if (validateData(data)) {
        onFileLoaded(data);
        toast.success(`File ${file.name} berhasil dimuat (${data.length} baris)`);
      } else {
        setFileName(null);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Gagal membaca file. Pastikan format file benar.');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    onFileLoaded([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block">{label}</label>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${fileType}`}
        />
        
        {!fileName ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Memuat...' : 'Pilih File (CSV/XLSX)'}
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full p-3 border rounded-md bg-secondary">
            {fileName.endsWith('.csv') ? (
              <FileText className="w-4 h-4 text-muted-foreground" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="flex-1 text-sm truncate">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
