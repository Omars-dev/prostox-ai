
import { useCallback, useState } from 'react';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileDropzone = ({ onFilesAdded }: FileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      toast({
        title: "No valid images",
        description: "Please upload image files only.",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 1000) {
      toast({
        title: "Too many files",
        description: "Maximum 1000 images allowed at once.",
        variant: "destructive",
      });
      return;
    }

    onFilesAdded(files);
    toast({
      title: "Images uploaded",
      description: `${files.length} images added successfully.`,
    });
  }, [onFilesAdded, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleDrop({ preventDefault: () => {}, dataTransfer: { files } } as any);
    }
  };

  return (
    <div className="compact-upload cta-animated">
      <div className="upload-header text-center">
        <h2 className="font-bold text-enhanced">
          Upload Your Images
        </h2>
        <p className="text-muted-foreground">
          Drag and drop up to 1000 images or click to browse
        </p>
      </div>

      <div
        className={`upload-zone relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="text-center space-y-3">
          <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isDragOver 
              ? 'bg-blue-500 text-white scale-110' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}>
            {isDragOver ? <Upload className="w-5 h-5" /> : <Image className="w-5 h-5" />}
          </div>
          
          <div>
            <p className="font-semibold text-enhanced">
              {isDragOver ? 'Drop images here' : 'Drag images here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse your files
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="liquid-button px-6 py-2 font-semibold border-2 border-blue-300 hover:border-blue-400 relative z-10"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="relative z-10 text-enhanced">Choose Files</span>
          </Button>
        </div>

        <div className="upload-info flex items-center justify-center space-x-4 text-xs text-muted-foreground mt-4">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Max 1000 images</span>
          </div>
          <div className="flex items-center space-x-1">
            <Image className="w-3 h-3" />
            <span>JPG, PNG, WebP</span>
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    </div>
  );
};
