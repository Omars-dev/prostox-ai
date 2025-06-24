
import { Play, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ImageData } from '@/pages/Index';

interface ProcessingStatusProps {
  images: ImageData[];
  isProcessing: boolean;
  onProcessAll: () => void;
  onClearAll: () => void;
}

export const ProcessingStatus = ({ 
  images, 
  isProcessing, 
  onProcessAll, 
  onClearAll 
}: ProcessingStatusProps) => {
  const totalImages = images.length;
  const pendingImages = images.filter(img => img.status === 'pending').length;
  const processingImages = images.filter(img => img.status === 'processing').length;
  const doneImages = images.filter(img => img.status === 'done').length;
  const errorImages = images.filter(img => img.status === 'error').length;
  
  const progress = totalImages > 0 ? (doneImages / totalImages) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Processing Status
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={onProcessAll}
            disabled={isProcessing || pendingImages === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : `Process ${pendingImages + errorImages} Images`}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClearAll}
            disabled={isProcessing}
            className="glass"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Overall Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-3" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {pendingImages}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {processingImages}
            </div>
            <div className="text-xs text-muted-foreground">Processing</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {doneImages}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {errorImages}
            </div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>
      </div>
    </div>
  );
};
