import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { WbsNodeWithChildren } from "@shared/schema";
import WbsHeader from "@/components/wbs-header";
import WbsSidebar from "@/components/wbs-sidebar";
import WbsTree from "@/components/wbs-tree";
import ExportModal from "@/components/export-modal";
import ContextMenu from "@/components/context-menu";
import { useToast } from "@/hooks/use-toast";

export default function WbsBuilder() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("development");
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string | null;
  }>({ visible: false, x: 0, y: 0, nodeId: null });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: wbsTree, isLoading, refetch } = useQuery<WbsNodeWithChildren[]>({
    queryKey: ["/api/wbs/tree"],
  });

  // Find selected node from tree
  const findNodeById = useCallback((nodes: WbsNodeWithChildren[] | undefined, id: string): WbsNodeWithChildren | null => {
    if (!nodes) return null;
    
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  const selectedNode = selectedNodeId ? findNodeById(wbsTree, selectedNodeId) : null;

  // Calculate total node count
  const countNodes = useCallback((nodes: WbsNodeWithChildren[]): number => {
    return nodes.reduce((count, node) => count + 1 + countNodes(node.children), 0);
  }, []);

  const totalNodes = wbsTree ? countNodes(wbsTree) : 0;

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      }
      
      if (selectedNodeId) {
        if (e.key === 'Delete') {
          // Handle delete
          console.log("Delete node:", selectedNodeId);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          // Handle add child
          console.log("Add child to:", selectedNodeId);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          // Handle add sibling
          console.log("Add sibling to:", selectedNodeId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  // Hide context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => hideContextMenu();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [hideContextMenu]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WBS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WbsHeader 
        onExport={() => setExportModalOpen(true)}
        onAddRootNode={() => {
          // Handle add root node
          toast({
            title: "Add Root Node",
            description: "This feature will be implemented in the context menu actions",
          });
        }}
        totalNodes={totalNodes}
      />
      
      <div className="flex flex-1 pt-16">
        <WbsSidebar 
          selectedNode={selectedNode}
          onNodeUpdate={() => refetch()}
        />
        
        <main className="flex-1 overflow-hidden">
          <WbsTree 
            nodes={wbsTree || []}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onContextMenu={handleContextMenu}
            onNodeUpdate={() => refetch()}
          />
        </main>
      </div>

      <ContextMenu 
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        nodeId={contextMenu.nodeId}
        onClose={hideContextMenu}
        onAction={() => {
          hideContextMenu();
          refetch();
        }}
      />

      <ExportModal 
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
