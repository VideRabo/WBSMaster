import { Save, Download, Plus, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WbsHeaderProps {
  onExport: () => void;
  onAddRootNode: () => void;
  totalNodes: number;
}

export default function WbsHeader({ onExport, onAddRootNode, totalNodes }: WbsHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Table className="text-primary-foreground text-sm" size={16} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">WBS Builder</h1>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
          <span>/</span>
          <span>Project Alpha</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
          <Save size={16} />
          <span>Auto-saved</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button 
            size="sm"
            onClick={onAddRootNode}
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Node</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
