
import { useState } from 'react';
import { Copy, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { ImageData } from '@/pages/Index';

interface ImageCardProps {
  image: ImageData;
  onRetry: () => void;
}

export const ImageCard = ({ image, onRetry }: ImageCardProps) => {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (image.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "text-xs font-medium";
    switch (image.status) {
      case 'pending':
        return <Badge variant="secondary" className={baseClasses}>Pending</Badge>;
      case 'processing':
        return <Badge className={`${baseClasses} bg-blue-500`}>Processing</Badge>;
      case 'done':
        return <Badge className={`${baseClasses} bg-green-500`}>Done</Badge>;
      case 'error':
        return <Badge variant="destructive" className={baseClasses}>Error</Badge>;
    }
  };

  return (
    <Card className="glass overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
        {!imageError ? (
          <img
            src={image.preview}
            alt={image.file.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          {getStatusBadge()}
          {getStatusIcon()}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <p className="font-medium text-sm truncate" title={image.file.name}>
            {image.file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {(image.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {image.status === 'error' && image.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{image.error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
              onClick={onRetry}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {image.metadata && (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`title-${image.id}`} className="text-xs">
                SEO Title ({image.metadata.title.length}/70)
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id={`title-${image.id}`}
                  value={image.metadata.title}
                  readOnly
                  className="text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(image.metadata!.title, 'Title')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor={`keywords-${image.id}`} className="text-xs">
                Keywords ({image.metadata.keywords.length} items)
              </Label>
              <div className="flex items-start space-x-2 mt-1">
                <Textarea
                  id={`keywords-${image.id}`}
                  value={image.metadata.keywords.join(', ')}
                  readOnly
                  rows={3}
                  className="text-sm resize-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 mt-1"
                  onClick={() => copyToClipboard(image.metadata!.keywords.join(', '), 'Keywords')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor={`category-${image.id}`} className="text-xs">
                Adobe Stock Category
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id={`category-${image.id}`}
                  value={image.metadata.category}
                  readOnly
                  className="text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(image.metadata!.category, 'Category')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
