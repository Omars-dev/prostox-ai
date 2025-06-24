
import { Play, Trash2, BarChart3, RefreshCw, Download, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImageData } from '@/pages/Index';

interface ProcessingStatusProps {
  images: ImageData[];
  isProcessing: boolean;
  onProcessAll: () => void;
  onClearAll: () => void;
  onRetryFailed: () => void;
  onExport: () => void;
}

export const ProcessingStatus = ({ 
  images, 
  isProcessing, 
  onProcessAll, 
  onClearAll,
  onRetryFailed,
  onExport
}: ProcessingStatusProps) => {
  const totalImages = images.length;
  const pendingImages = images.filter(img => img.status === 'pending').length;
  const processingImages = images.filter(img => img.status === 'processing').length;
  const doneImages = images.filter(img => img.status === 'done').length;
  const errorImages = images.filter(img => img.status === 'error').length;
  const processedImages = images.filter(img => img.status === 'done' && img.metadata);
  
  const progress = totalImages > 0 ? (doneImages / totalImages) * 100 : 0;

  return (
    <div className="liquid-glass rounded-2xl p-6 shadow-xl">
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
            disabled={isProcessing || (pendingImages === 0 && errorImages === 0)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : `Process ${pendingImages + errorImages} Images`}
          </Button>
          
          {errorImages > 0 && (
            <Button
              variant="outline"
              onClick={onRetryFailed}
              disabled={isProcessing}
              className="liquid-glass border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Failed ({errorImages})
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onClearAll}
            disabled={isProcessing}
            className="liquid-glass"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Overall Progress</span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-3" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {pendingImages}
            </div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {processingImages}
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Processing</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {doneImages}
            </div>
            <div className="text-xs font-medium text-green-600 dark:text-green-400">Completed</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {errorImages}
            </div>
            <div className="text-xs font-medium text-red-600 dark:text-red-400">Errors</div>
          </div>
        </div>

        {/* Export Section */}
        {processedImages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Card className="liquid-glass border-none shadow-none">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Ready to Export
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {processedImages.length} of {totalImages} images have been processed
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3">
                  <h3 className="font-semibold mb-2 flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    CSV Export Details
                  </h3>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Adobe Stock compatible format</li>
                    <li>• Columns: Filename, Title, Keywords, Category</li>
                    <li>• Ready for bulk upload to stock platforms</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button
                    onClick={onExport}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV ({processedImages.length} images)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
