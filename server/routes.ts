import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWbsNodeSchema, updateWbsNodeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all WBS nodes as tree structure
  app.get("/api/wbs/tree", async (_req, res) => {
    try {
      const tree = await storage.getWbsNodeTree();
      res.json(tree);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WBS tree" });
    }
  });

  // Get all WBS nodes (flat)
  app.get("/api/wbs/nodes", async (_req, res) => {
    try {
      const nodes = await storage.getWbsNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WBS nodes" });
    }
  });

  // Get specific WBS node
  app.get("/api/wbs/nodes/:id", async (req, res) => {
    try {
      const node = await storage.getWbsNode(req.params.id);
      if (!node) {
        return res.status(404).json({ message: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WBS node" });
    }
  });

  // Create new WBS node
  app.post("/api/wbs/nodes", async (req, res) => {
    try {
      const validatedData = insertWbsNodeSchema.parse(req.body);
      const node = await storage.createWbsNode(validatedData);
      res.status(201).json(node);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create WBS node" });
    }
  });

  // Update WBS node
  app.patch("/api/wbs/nodes/:id", async (req, res) => {
    try {
      const validatedData = updateWbsNodeSchema.parse(req.body);
      const node = await storage.updateWbsNode(req.params.id, validatedData);
      if (!node) {
        return res.status(404).json({ message: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update WBS node" });
    }
  });

  // Delete WBS node
  app.delete("/api/wbs/nodes/:id", async (req, res) => {
    try {
      const success = await storage.deleteWbsNode(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Node not found" });
      }
      res.json({ message: "Node deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete WBS node" });
    }
  });

  // Move WBS node (for drag and drop)
  app.patch("/api/wbs/nodes/:id/move", async (req, res) => {
    try {
      const { newParentId, newPosition } = req.body;
      const success = await storage.moveWbsNode(
        req.params.id, 
        newParentId || null, 
        parseInt(newPosition) || 0
      );
      
      if (!success) {
        return res.status(404).json({ message: "Node not found" });
      }
      
      res.json({ message: "Node moved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to move WBS node" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
