import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FileDropzone } from '@/components/FileDropzone';
import { ImageCard } from '@/components/ImageCard';
import { AISettings } from '@/components/AISettings';
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

  const getActiveApiKeyForModel = (model: string) => {
    const stored = localStorage.getItem('prostoxai_api_keys_v2');
    if (!stored) return null;
    
    const apiKeys = JSON.parse(stored);
    const activeKey = apiKeys.find((key: any) => key.model === model && key.isActive);
    return activeKey?.key || null;
  };

  const updateApiKeyUsage = (model: string) => {
    const stored = localStorage.getItem('prostoxai_api_keys_v2');
    if (!stored) return;
    
    const apiKeys = JSON.parse(stored);
    const updatedKeys = apiKeys.map((key: any) => {
      if (key.model === model && key.isActive) {
        return {
          ...key,
          lastUsed: new Date().toISOString(),
          requestsMade: key.requestsMade + 1
        };
      }
      return key;
    });
    
    localStorage.setItem('prostoxai_api_keys_v2', JSON.stringify(updatedKeys));
  };

  const processAllImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to process",
        description: "Please upload images first.",
        variant: "destructive",
      });
      return;
    }

    const currentKey = getActiveApiKeyForModel(selectedModel);

    if (!currentKey) {
      toast({
        title: "API Key Required",
        description: `Please add an active API key for ${selectedModel} in settings.`,
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
          updateApiKeyUsage(selectedModel);
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

    const currentKey = getActiveApiKeyForModel(selectedModel);

    if (!currentKey) {
      toast({
        title: "API Key Required",
        description: `Please add an active API key for ${selectedModel} in settings.`,
        variant: "destructive",
      });
      return;
    }

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'processing', error: undefined } : img
    ));

    try {
      const metadata = await processImageWithAI(image.file, selectedModel, currentKey);
      updateApiKeyUsage(selectedModel);
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

  const retryFailedImages = async () => {
    const failedImages = images.filter(img => img.status === 'error');
    
    if (failedImages.length === 0) {
      toast({
        title: "No failed images",
        description: "There are no failed images to retry.",
        variant: "destructive",
      });
      return;
    }

    const currentKey = getActiveApiKeyForModel(selectedModel);

    if (!currentKey) {
      toast({
        title: "API Key Required",
        description: `Please add an active API key for ${selectedModel} in settings.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Process failed images in batches of 5
    const batchSize = 5;
    for (let i = 0; i < failedImages.length; i += batchSize) {
      const batch = failedImages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'processing', error: undefined } : img
        ));

        try {
          const metadata = await processImageWithAI(image.file, selectedModel, currentKey);
          updateApiKeyUsage(selectedModel);
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'done', metadata } 
              : img
          ));
        } catch (error) {
          console.error('Retry processing error:', error);
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
      if (i + batchSize < failedImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
    toast({
      title: "Retry Complete",
      description: `Retried ${failedImages.length} failed images.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-[72px] py-8 space-y-6 max-w-7xl">
        {/* AI Settings */}
        <div className="liquid-glass rounded-2xl p-6 shadow-xl">
          <AISettings 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Upload Section */}
        <div className="liquid-glass rounded-2xl shadow-xl">
          <FileDropzone onFilesAdded={addImages} />
        </div>

        {/* Processing Status */}
        {images.length > 0 && (
          <ProcessingStatus 
            images={images}
            isProcessing={isProcessing}
            onProcessAll={processAllImages}
            onClearAll={clearAll}
            onRetryFailed={retryFailedImages}
            onExport={exportCSV}
          />
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="liquid-glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-enhanced">
              Uploaded Images ({images.length})
            </h2>
            <div className="responsive-grid">
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
      </main>

      {/* Footer */}
      <footer className="liquid-glass mt-8 py-6">
        <div className="container mx-auto px-[72px] text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-enhanced opacity-80">
              © 2025 Omar's Creative Studio. All rights reserved.
            </div>
            <div className="text-sm text-enhanced">
              Contact Developer:{' '}
              <a 
                href="https://linkedin.com/in/omaruxpro"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 hover:underline"
              >
                OMAR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
