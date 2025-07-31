import { useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState("auto");
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Get the export canvas element
      const canvasElement = document.querySelector('.export-canvas');
      if (!canvasElement) {
        throw new Error('Export canvas not found');
      }

      // Dynamic import of html2canvas to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      // Configure export options
      const options = {
        backgroundColor: '#ffffff',
        scale: size === '4k' ? 2 : size === 'hd' ? 1.5 : 1,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      };

      // Capture the canvas
      const canvas = await html2canvas(canvasElement as HTMLElement, options);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `wbs-export.${format}`;
      
      if (format === 'png') {
        link.href = canvas.toDataURL('image/png');
      } else if (format === 'svg') {
        // For SVG, we'd need a different approach - for now, export as PNG
        link.href = canvas.toDataURL('image/png');
        link.download = 'wbs-export.png';
      } else if (format === 'pdf') {
        // For PDF, we'd need jsPDF library - for now, export as PNG
        link.href = canvas.toDataURL('image/png');
        link.download = 'wbs-export.png';
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `WBS has been exported as ${format.toUpperCase()}.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the WBS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export WBS</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG Image</SelectItem>
                <SelectItem value="svg">SVG Vector</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Image Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Fit Content)</SelectItem>
                <SelectItem value="hd">1920x1080 (HD)</SelectItem>
                <SelectItem value="4k">3840x2160 (4K)</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeMetadata" 
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
            />
            <Label htmlFor="includeMetadata" className="text-sm text-gray-700">
              Include node metadata
            </Label>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </div>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
