
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { ImageData } from '@/pages/Index';

interface ImageCardProps {
  image: ImageData;
  onRetry: () => void;
}

export const ImageCard = ({ image, onRetry }: ImageCardProps) => {
  const getStatusBadge = () => {
    switch (image.status) {
      case 'pending':
        return <Badge className="status-badge status-pending">Pending</Badge>;
      case 'processing':
        return <Badge className="status-badge status-processing">Processing</Badge>;
      case 'done':
        return <Badge className="status-badge status-done">Done</Badge>;
      case 'error':
        return <Badge className="status-badge status-error">Error</Badge>;
      default:
        return null;
    }
  };

  const downloadMetadata = () => {
    if (!image.metadata) return;
    
    const metadata = {
      filename: image.file.name,
      title: image.metadata.title,
      keywords: image.metadata.keywords,
      category: image.metadata.category
    };
    
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${image.file.name.split('.')[0]}_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="image-card group">
      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
        <img 
          src={image.preview} 
          alt={image.file.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-enhanced truncate flex-1">
            {image.file.name}
          </p>
          {getStatusBadge()}
        </div>
        
        {image.metadata && (
          <div className="space-y-1">
            <p className="text-xs text-enhanced font-medium">
              {image.metadata.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {image.metadata.category}
            </p>
            <div className="flex flex-wrap gap-1">
              {image.metadata.keywords.slice(0, 3).map((keyword, idx) => (
                <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  {keyword}
                </span>
              ))}
              {image.metadata.keywords.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{image.metadata.keywords.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {image.error && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {image.error}
          </p>
        )}
        
        <div className="flex gap-2 pt-2">
          {image.status === 'error' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="liquid-button flex-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span className="text-enhanced">Retry</span>
            </Button>
          )}
          
          {image.metadata && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={downloadMetadata}
              className="liquid-button flex-1"
            >
              <Download className="w-3 h-3 mr-1" />
              <span className="text-enhanced">Export</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
