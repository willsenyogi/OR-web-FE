import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Upload, X, FileSpreadsheet, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelected: (file: File | null) => void;
  fileType: 'depot' | 'customer' | 'vehicle';
  label: string;
  description: string;
}

export function FileUpload({ onFileSelected, fileType, label, description }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Format file tidak didukung. Gunakan CSV atau XLSX');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar. Maksimal 10MB');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    onFileSelected(file);
    toast.success(`File ${file.name} berhasil dipilih`);
  };

  const handleRemove = () => {
    setFileName(null);
    setFileSize(0);
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Pilih File (CSV/XLSX)
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full p-3 border rounded-md bg-secondary">
            <CheckCircle className="w-4 h-4 text-green-600" />
            {fileName.endsWith('.csv') ? (
              <FileText className="w-4 h-4 text-muted-foreground" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm truncate block">{fileName}</span>
              <span className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</span>
            </div>
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
