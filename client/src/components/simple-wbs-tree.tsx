import { useState } from "react";
import { WbsNodeWithChildren } from "@shared/schema";
import { 
  ProjectorIcon, 
  ClipboardList, 
  Code, 
  Bug, 
  Rocket, 
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleWbsTreeProps {
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

interface SimpleWbsNodeProps {
  node: WbsNodeWithChildren;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  level: number;
}

function SimpleWbsNode({ node, selectedNodeId, onSelectNode, onContextMenu, level }: SimpleWbsNodeProps) {
  const [isExpanded, setIsExpanded] = useState(node.expanded === 1);
  const Icon = getNodeIcon(node.name, level);
  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  
  const handleClick = () => {
    onSelectNode(node.id);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, node.id);
  };
  
  return (
    <div className="w-full">
      <div 
        className={`
          flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border-2 border-gray-200 hover:bg-gray-50'}
          ${level === 0 ? 'font-bold text-lg' : level === 1 ? 'font-semibold' : ''}
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        
        <Icon size={level === 0 ? 20 : 16} className="flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="truncate">{node.name}</div>
          {node.duration && (
            <div className="text-xs text-gray-500 truncate">{node.duration}</div>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children.map((child) => (
            <SimpleWbsNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onContextMenu={onContextMenu}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SimpleWbsTree({ 
  nodes, 
  selectedNodeId, 
  onSelectNode, 
  onContextMenu, 
  onNodeUpdate 
}: SimpleWbsTreeProps) {
  
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
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">Project Alpha - WBS</h2>
          <span className="text-sm text-gray-500">{nodes.length} root nodes</span>
        </div>
        
        <div className="p-4 space-y-2">
          {nodes.map(node => (
            <SimpleWbsNode
              key={node.id}
              node={node}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onContextMenu={onContextMenu}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}