
import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FileDropzone } from '@/components/FileDropzone';
import { ImageCard } from '@/components/ImageCard';
import { AISettings } from '@/components/AISettings';
import { ExportSection } from '@/components/ExportSection';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/lib/aiService';
import { generateCSV } from '@/lib/csvGenerator';

export interface ImageData {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  metadata?: {
    title: string;
    keywords: string[];
    category: string;
  };
  error?: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const { toast } = useToast();

  const addImages = useCallback((files: File[]) => {
    const newImages: ImageData[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const processAllImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to process",
        description: "Please upload images first.",
        variant: "destructive",
      });
      return;
    }

    const apiKeys = JSON.parse(localStorage.getItem('prostoxai_api_keys') || '{}');
    const currentKey = apiKeys[selectedModel];

    if (!currentKey) {
      toast({
        title: "API Key Required",
        description: `Please add an API key for ${selectedModel} in settings.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');
    
    // Process in batches of 5
    const batchSize = 5;
    for (let i = 0; i < pendingImages.length; i += batchSize) {
      const batch = pendingImages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'processing' } : img
        ));

        try {
          const metadata = await processImageWithAI(image.file, selectedModel, currentKey);
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'done', metadata } 
              : img
          ));
        } catch (error) {
          console.error('Processing error:', error);
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Unknown error'
                } 
              : img
          ));
        }
      }));

      // Small delay between batches
      if (i + batchSize < pendingImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
    toast({
      title: "Processing Complete",
      description: "All images have been processed!",
    });
  };

  const exportCSV = () => {
    const processedImages = images.filter(img => img.status === 'done' && img.metadata);
    if (processedImages.length === 0) {
      toast({
        title: "No data to export",
        description: "Please process some images first.",
        variant: "destructive",
      });
      return;
    }

    const csvData = generateCSV(processedImages);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prostoxai_metadata.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported metadata for ${processedImages.length} images.`,
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    toast({
      title: "Cleared",
      description: "All images have been removed.",
    });
  };

  const retryImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const apiKeys = JSON.parse(localStorage.getItem('prostoxai_api_keys') || '{}');
    const currentKey = apiKeys[selectedModel];

    if (!currentKey) {
      toast({
        title: "API Key Required",
        description: `Please add an API key for ${selectedModel} in settings.`,
        variant: "destructive",
      });
      return;
    }

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'processing', error: undefined } : img
    ));

    try {
      const metadata = await processImageWithAI(image.file, selectedModel, currentKey);
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'done', metadata } 
          : img
      ));
      toast({
        title: "Retry Successful",
        description: "Image processed successfully!",
      });
    } catch (error) {
      console.error('Retry error:', error);
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error'
            } 
          : img
      ));
      toast({
        title: "Retry Failed",
        description: "Failed to process image. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* AI Settings */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          <AISettings 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Upload Section */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          <FileDropzone onFilesAdded={addImages} />
        </div>

        {/* Processing Status */}
        {images.length > 0 && (
          <ProcessingStatus 
            images={images}
            isProcessing={isProcessing}
            onProcessAll={processAllImages}
            onClearAll={clearAll}
          />
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Uploaded Images ({images.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map(image => (
                <ImageCard 
                  key={image.id} 
                  image={image} 
                  onRetry={() => retryImage(image.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Export Section */}
        {images.some(img => img.status === 'done') && (
          <ExportSection 
            images={images}
            onExport={exportCSV}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
