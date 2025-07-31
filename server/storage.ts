import { type WbsNode, type InsertWbsNode, type UpdateWbsNode, type WbsNodeWithChildren } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // WBS Node operations
  getWbsNodes(): Promise<WbsNode[]>;
  getWbsNode(id: string): Promise<WbsNode | undefined>;
  createWbsNode(node: InsertWbsNode): Promise<WbsNode>;
  updateWbsNode(id: string, updates: UpdateWbsNode): Promise<WbsNode | undefined>;
  deleteWbsNode(id: string): Promise<boolean>;
  getWbsNodeTree(): Promise<WbsNodeWithChildren[]>;
  moveWbsNode(nodeId: string, newParentId: string | null, newPosition: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private wbsNodes: Map<string, WbsNode>;

  constructor() {
    this.wbsNodes = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a sample WBS structure
    const rootNode: WbsNode = {
      id: "root",
      name: "Software Development Project",
      description: "Complete software development lifecycle including planning, development, testing, and deployment phases.",
      duration: "12 weeks",
      effort: "480 hours",
      responsible: "Project Manager",
      parentId: null,
      position: 0,
      expanded: 1,
      level: 0,
      metadata: {}
    };

    const planningNode: WbsNode = {
      id: "planning",
      name: "Planning Phase",
      description: "Project planning and requirements gathering",
      duration: "2 weeks",
      effort: "80 hours",
      responsible: "Planning Team",
      parentId: "root",
      position: 0,
      expanded: 1,
      level: 1,
      metadata: {}
    };

    const developmentNode: WbsNode = {
      id: "development",
      name: "Development",
      description: "Software development implementation",
      duration: "6 weeks",
      effort: "240 hours",
      responsible: "Development Team",
      parentId: "root",
      position: 1,
      expanded: 1,
      level: 1,
      metadata: {}
    };

    const testingNode: WbsNode = {
      id: "testing",
      name: "Testing",
      description: "Quality assurance and testing",
      duration: "3 weeks",
      effort: "120 hours",
      responsible: "QA Team",
      parentId: "root",
      position: 2,
      expanded: 0,
      level: 1,
      metadata: {}
    };

    const deploymentNode: WbsNode = {
      id: "deployment",
      name: "Deployment",
      description: "Production deployment and go-live",
      duration: "1 week",
      effort: "40 hours",
      responsible: "DevOps Team",
      parentId: "root",
      position: 3,
      expanded: 1,
      level: 1,
      metadata: {}
    };

    // Level 2 nodes
    const requirementsNode: WbsNode = {
      id: "requirements",
      name: "Requirements",
      description: "Gather and document requirements",
      duration: "5 days",
      effort: "40 hours",
      responsible: "Business Analyst",
      parentId: "planning",
      position: 0,
      expanded: 1,
      level: 2,
      metadata: {}
    };

    const designNode: WbsNode = {
      id: "design",
      name: "System Design",
      description: "Design system architecture",
      duration: "4 days",
      effort: "32 hours",
      responsible: "System Architect",
      parentId: "planning",
      position: 1,
      expanded: 1,
      level: 2,
      metadata: {}
    };

    const frontendNode: WbsNode = {
      id: "frontend",
      name: "Frontend Dev",
      description: "Frontend development tasks",
      duration: "3 weeks",
      effort: "120 hours",
      responsible: "Frontend Team",
      parentId: "development",
      position: 0,
      expanded: 1,
      level: 2,
      metadata: {}
    };

    const backendNode: WbsNode = {
      id: "backend",
      name: "Backend Dev",
      description: "Backend development tasks",
      duration: "4 weeks",
      effort: "160 hours",
      responsible: "Backend Team",
      parentId: "development",
      position: 1,
      expanded: 1,
      level: 2,
      metadata: {}
    };

    const integrationNode: WbsNode = {
      id: "integration",
      name: "Integration",
      description: "System integration tasks",
      duration: "1 week",
      effort: "40 hours",
      responsible: "Integration Team",
      parentId: "development",
      position: 2,
      expanded: 1,
      level: 2,
      metadata: {}
    };

    // Add all nodes to storage
    [rootNode, planningNode, developmentNode, testingNode, deploymentNode, 
     requirementsNode, designNode, frontendNode, backendNode, integrationNode].forEach(node => {
      this.wbsNodes.set(node.id, node);
    });
  }

  async getWbsNodes(): Promise<WbsNode[]> {
    return Array.from(this.wbsNodes.values());
  }

  async getWbsNode(id: string): Promise<WbsNode | undefined> {
    return this.wbsNodes.get(id);
  }

  async createWbsNode(insertNode: InsertWbsNode): Promise<WbsNode> {
    const id = randomUUID();
    const node: WbsNode = {
      ...insertNode,
      id,
      expanded: insertNode.expanded ?? 1,
      level: insertNode.level ?? 0,
      metadata: insertNode.metadata ?? {},
      duration: insertNode.duration ?? null,
      description: insertNode.description ?? null,
      effort: insertNode.effort ?? null,
      responsible: insertNode.responsible ?? null,
      parentId: insertNode.parentId ?? null
    };
    this.wbsNodes.set(id, node);
    return node;
  }

  async updateWbsNode(id: string, updates: UpdateWbsNode): Promise<WbsNode | undefined> {
    const existingNode = this.wbsNodes.get(id);
    if (!existingNode) return undefined;

    const updatedNode: WbsNode = { ...existingNode, ...updates };
    this.wbsNodes.set(id, updatedNode);
    return updatedNode;
  }

  async deleteWbsNode(id: string): Promise<boolean> {
    // Also delete all children
    const allNodes = Array.from(this.wbsNodes.values());
    const nodesToDelete = this.findNodeAndChildren(id, allNodes);
    
    for (const nodeId of nodesToDelete) {
      this.wbsNodes.delete(nodeId);
    }
    
    return nodesToDelete.length > 0;
  }

  private findNodeAndChildren(nodeId: string, allNodes: WbsNode[]): string[] {
    const result = [nodeId];
    const children = allNodes.filter(node => node.parentId === nodeId);
    
    for (const child of children) {
      result.push(...this.findNodeAndChildren(child.id, allNodes));
    }
    
    return result;
  }

  async getWbsNodeTree(): Promise<WbsNodeWithChildren[]> {
    const allNodes = Array.from(this.wbsNodes.values());
    const rootNodes = allNodes.filter(node => !node.parentId);
    
    return rootNodes
      .sort((a, b) => a.position - b.position)
      .map(node => this.buildNodeWithChildren(node, allNodes));
  }

  private buildNodeWithChildren(node: WbsNode, allNodes: WbsNode[]): WbsNodeWithChildren {
    const children = allNodes
      .filter(n => n.parentId === node.id)
      .sort((a, b) => a.position - b.position)
      .map(child => this.buildNodeWithChildren(child, allNodes));

    return { ...node, children };
  }

  async moveWbsNode(nodeId: string, newParentId: string | null, newPosition: number): Promise<boolean> {
    const node = this.wbsNodes.get(nodeId);
    if (!node) return false;

    // Update the node
    const updatedNode: WbsNode = {
      ...node,
      parentId: newParentId,
      position: newPosition,
      level: newParentId ? (this.wbsNodes.get(newParentId)?.level ?? 0) + 1 : 0
    };

    this.wbsNodes.set(nodeId, updatedNode);

    // Update positions of other nodes with the same parent
    const siblings = Array.from(this.wbsNodes.values())
      .filter(n => n.parentId === newParentId && n.id !== nodeId);

    siblings.forEach(sibling => {
      if (sibling.position >= newPosition) {
        this.wbsNodes.set(sibling.id, { ...sibling, position: sibling.position + 1 });
      }
    });

    return true;
  }
}

export const storage = new MemStorage();
