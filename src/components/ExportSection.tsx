
import { Download, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImageData } from '@/pages/Index';

interface ExportSectionProps {
  images: ImageData[];
  onExport: () => void;
}

export const ExportSection = ({ images, onExport }: ExportSectionProps) => {
  const processedImages = images.filter(img => img.status === 'done' && img.metadata);
  const totalImages = images.length;

  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <Card className="glass border-none shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Ready to Export
          </CardTitle>
          <p className="text-muted-foreground">
            {processedImages.length} of {totalImages} images have been processed
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              CSV Export Details
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Adobe Stock compatible format</li>
              <li>• Columns: Filename, Title, Keywords, Category</li>
              <li>• Ready for bulk upload to stock platforms</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={onExport}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV ({processedImages.length} images)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
