import { useState } from "react";
import { WbsNodeWithChildren } from "@shared/schema";
import { 
  ProjectorIcon, 
  ClipboardList, 
  Code, 
  Bug, 
  Rocket, 
  Plus,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WbsTreeProps {
  nodes: WbsNodeWithChildren[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onNodeUpdate: () => void;
}

// Icon mapping for different node types
const getNodeIcon = (nodeName: string, level: number) => {
  const name = nodeName.toLowerCase();
  
  if (level === 0) return ProjectorIcon;
  if (name.includes('plan')) return ClipboardList;
  if (name.includes('develop') || name.includes('frontend') || name.includes('backend')) return Code;
  if (name.includes('test')) return Bug;
  if (name.includes('deploy')) return Rocket;
  
  return ClipboardList;
};

// Color mapping for different levels
const getNodeColors = (level: number, isSelected: boolean) => {
  if (level === 0) {
    return {
      bg: "bg-primary",
      text: "text-primary-foreground",
      border: "border-primary",
      hover: "hover:bg-primary/90"
    };
  }
  
  const colors = [
    { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200", hover: "hover:border-blue-300" },
    { bg: "bg-green-50", text: "text-green-900", border: "border-green-200", hover: "hover:border-green-300" },
    { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200", hover: "hover:border-orange-300" },
    { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-200", hover: "hover:border-purple-300" },
  ];
  
  const colorSet = colors[(level - 1) % colors.length];
  
  if (isSelected) {
    return {
      ...colorSet,
      border: colorSet.border.replace('200', '400'),
      bg: "bg-white"
    };
  }
  
  return {
    ...colorSet,
    bg: level === 1 ? "bg-white" : colorSet.bg
  };
};

interface WbsNodeProps {
  node: WbsNodeWithChildren;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  level: number;
}

function WbsNode({ node, isSelected, onSelect, onContextMenu, level }: WbsNodeProps) {
  const [isExpanded, setIsExpanded] = useState(node.expanded === 1);
  const Icon = getNodeIcon(node.name, level);
  const colors = getNodeColors(level, isSelected);
  
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          wbs-node cursor-pointer relative group transition-all duration-200
          ${colors.bg} ${colors.text} rounded-lg border-2 ${colors.border} ${colors.hover}
          hover:shadow-lg
          ${level === 0 ? 'px-6 py-4 shadow-lg' : level === 1 ? 'px-4 py-3 shadow-md' : 'px-3 py-2 text-sm'}
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        `}
        onClick={onSelect}
        onContextMenu={onContextMenu}
      >
        <div className="flex items-center space-x-2">
          <Icon size={level === 0 ? 20 : level === 1 ? 18 : 16} />
          <div>
            <div className={`font-${level === 0 ? 'semibold' : 'medium'}`}>
              {node.name}
            </div>
            {node.duration && (
              <div className={`text-xs opacity-90 ${level === 0 ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                {node.duration}
              </div>
            )}
          </div>
        </div>
        
        {/* Context Menu Button */}
        <button 
          className={`
            absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 rounded-full shadow-md 
            transition-opacity text-xs hover:bg-gray-50
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
        >
          <MoreVertical size={12} />
        </button>
      </div>
      
      {/* Connection Line and Children */}
      {hasChildren && (
        <>
          {/* Connection Line */}
          <div className="w-px h-6 bg-gray-300"></div>
          
          {/* Expand/Collapse Button or Children */}
          {!isExpanded ? (
            <Button
              variant="outline"
              size="icon"
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 border-gray-300"
              onClick={() => setIsExpanded(true)}
            >
              <Plus size={12} />
            </Button>
          ) : (
            <div className="flex space-x-6">
              {node.children.map((child) => (
                <WbsNode
                  key={child.id}
                  node={child}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onContextMenu={onContextMenu}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WbsTree({ 
  nodes, 
  selectedNodeId, 
  onSelectNode, 
  onContextMenu, 
  onNodeUpdate 
}: WbsTreeProps) {
  const [zoom, setZoom] = useState(100);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleFitToScreen = () => setZoom(100);

  // Recursive function to render nodes
  const renderNode = (node: WbsNodeWithChildren, level = 0): React.ReactNode => {
    return (
      <WbsNode
        key={node.id}
        node={node}
        isSelected={selectedNodeId === node.id}
        onSelect={() => onSelectNode(node.id)}
        onContextMenu={(e) => onContextMenu(e, node.id)}
        level={level}
      />
    );
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ProjectorIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS Created</h3>
          <p className="text-gray-500 mb-4">Start by creating your first WBS node.</p>
          <Button onClick={() => onNodeUpdate()}>
            <Plus size={16} className="mr-2" />
            Create Root Node
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-auto">
        {/* Canvas Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Alpha - WBS</h2>
            <span className="text-sm text-gray-500">{nodes.length} root nodes</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <span className="text-lg">−</span>
            </Button>
            <span className="text-sm text-gray-500 min-w-[3rem] text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <span className="text-lg">+</span>
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitToScreen}
            >
              Fit
            </Button>
          </div>
        </div>
        
        {/* WBS Tree Visualization */}
        <div 
          className="p-8 export-canvas"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
        >
          <div className="flex flex-col items-center space-y-8">
            {nodes.map(node => renderNode(node))}
          </div>
        </div>
      </div>
    </div>
  );
}
