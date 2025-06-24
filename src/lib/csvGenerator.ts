
import Papa from 'papaparse';
import type { ImageData } from '@/pages/Index';

export function generateCSV(images: ImageData[]): string {
  const csvData = images
    .filter(img => img.status === 'done' && img.metadata)
    .map(img => ({
      Filename: img.file.name,
      Title: img.metadata!.title,
      Keywords: img.metadata!.keywords.join(', '),
      Category: img.metadata!.category
    }));

  return Papa.unparse(csvData, {
    header: true,
    quotes: true,
    delimiter: ','
  });
}
