import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { WbsNodeWithChildren, updateWbsNodeSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Equal, ExpandIcon, Minimize, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface WbsSidebarProps {
  selectedNode: WbsNodeWithChildren | null;
  onNodeUpdate: () => void;
}

export default function WbsSidebar({ selectedNode, onNodeUpdate }: WbsSidebarProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    effort: "",
    responsible: ""
  });
  const { toast } = useToast();

  // Update form when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData({
        name: selectedNode.name || "",
        description: selectedNode.description || "",
        duration: selectedNode.duration || "",
        effort: selectedNode.effort || "",
        responsible: selectedNode.responsible || ""
      });
    }
  }, [selectedNode]);

  const updateNodeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!selectedNode) throw new Error("No node selected");
      
      const validatedData = updateWbsNodeSchema.parse(data);
      return apiRequest("PATCH", `/api/wbs/nodes/${selectedNode.id}`, validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wbs/tree"] });
      onNodeUpdate();
      toast({
        title: "Node Updated",
        description: "The WBS node has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNode) throw new Error("No node selected");
      return apiRequest("DELETE", `/api/wbs/nodes/${selectedNode.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wbs/tree"] });
      onNodeUpdate();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNodeMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickAction = (action: string) => {
    if (!selectedNode) return;
    
    toast({
      title: "Quick Action",
      description: `${action} functionality will be implemented with the context menu actions.`,
    });
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Node Properties Panel */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Properties</h2>
        
        {selectedNode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nodeNameInput" className="text-sm font-medium text-gray-700 mb-2">
                Node Name
              </Label>
              <Input
                id="nodeNameInput"
                type="text"
                placeholder="Enter node name..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="nodeDescription" className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Label>
              <Textarea
                id="nodeDescription"
                placeholder="Add description..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nodeDuration" className="text-sm font-medium text-gray-700 mb-2">
                  Duration
                </Label>
                <Input
                  id="nodeDuration"
                  type="text"
                  placeholder="e.g., 2 weeks"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nodeEffort" className="text-sm font-medium text-gray-700 mb-2">
                  Effort
                </Label>
                <Input
                  id="nodeEffort"
                  type="text"
                  placeholder="e.g., 40 hours"
                  value={formData.effort}
                  onChange={(e) => handleInputChange("effort", e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="nodeResponsible" className="text-sm font-medium text-gray-700 mb-2">
                Responsible
              </Label>
              <Input
                id="nodeResponsible"
                type="text"
                placeholder="Team or person responsible"
                value={formData.responsible}
                onChange={(e) => handleInputChange("responsible", e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                type="submit"
                className="flex-1"
                disabled={updateNodeMutation.isPending}
              >
                Update Node
              </Button>
              <Button 
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => deleteNodeMutation.mutate()}
                disabled={deleteNodeMutation.isPending}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500 text-sm">Select a node to view and edit its properties.</p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => handleQuickAction("Add Child Node")}
            className="w-full flex items-center space-x-2 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
            disabled={!selectedNode}
          >
            <PlusCircle size={16} className="text-green-500" />
            <span>Add Child Node</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction("Add Sibling Node")}
            className="w-full flex items-center space-x-2 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
            disabled={!selectedNode}
          >
            <Equal size={16} className="text-blue-500" />
            <span>Add Sibling Node</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction("Expand All")}
            className="w-full flex items-center space-x-2 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
          >
            <ExpandIcon size={16} className="text-purple-500" />
            <span>Expand All</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction("Collapse All")}
            className="w-full flex items-center space-x-2 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
          >
            <Minimize size={16} className="text-orange-500" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>
      
      {/* Keyboard Shortcuts */}
      <div className="p-6 border-t border-gray-200 mt-auto">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Shortcuts</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Add Child</span>
            <kbd className="bg-gray-100 px-2 py-1 rounded">Tab</kbd>
          </div>
          <div className="flex justify-between">
            <span>Add Sibling</span>
            <kbd className="bg-gray-100 px-2 py-1 rounded">Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Delete Node</span>
            <kbd className="bg-gray-100 px-2 py-1 rounded">Del</kbd>
          </div>
          <div className="flex justify-between">
            <span>Export</span>
            <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+E</kbd>
          </div>
        </div>
      </div>
    </aside>
  );
}
