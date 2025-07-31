import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Equal, Edit, Copy, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  onClose: () => void;
  onAction: () => void;
}

export default function ContextMenu({ 
  visible, 
  x, 
  y, 
  nodeId, 
  onClose, 
  onAction 
}: ContextMenuProps) {
  const { toast } = useToast();

  const deleteNodeMutation = useMutation({
    mutationFn: async () => {
      if (!nodeId) throw new Error("No node selected");
      return apiRequest("DELETE", `/api/wbs/nodes/${nodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wbs/tree"] });
      onAction();
      toast({
        title: "Node Deleted",
        description: "The WBS node and its children have been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAction = (action: string) => {
    if (!nodeId) return;

    switch (action) {
      case 'addChild':
        toast({
          title: "Add Child Node",
          description: "This feature will be implemented to add a child node.",
        });
        break;
      case 'addSibling':
        toast({
          title: "Add Sibling Node", 
          description: "This feature will be implemented to add a sibling node.",
        });
        break;
      case 'edit':
        toast({
          title: "Edit Node",
          description: "Use the sidebar to edit the selected node properties.",
        });
        break;
      case 'duplicate':
        toast({
          title: "Duplicate Node",
          description: "This feature will be implemented to duplicate the node.",
        });
        break;
      case 'delete':
        deleteNodeMutation.mutate();
        break;
      default:
        break;
    }
    
    onClose();
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 context-menu"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        minWidth: '180px'
      }}
    >
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
        onClick={() => handleAction('addChild')}
      >
        <PlusCircle size={16} className="text-green-500" />
        <span>Add Child</span>
      </button>
      
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
        onClick={() => handleAction('addSibling')}
      >
        <Equal size={16} className="text-blue-500" />
        <span>Add Sibling</span>
      </button>
      
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
        onClick={() => handleAction('edit')}
      >
        <Edit size={16} className="text-yellow-500" />
        <span>Edit Node</span>
      </button>
      
      <div className="border-t border-gray-200 my-1"></div>
      
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
        onClick={() => handleAction('duplicate')}
      >
        <Copy size={16} className="text-gray-500" />
        <span>Duplicate</span>
      </button>
      
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2 transition-colors"
        onClick={() => handleAction('delete')}
        disabled={deleteNodeMutation.isPending}
      >
        <Trash2 size={16} className="text-red-500" />
        <span>Delete</span>
      </button>
    </div>
  );
}
