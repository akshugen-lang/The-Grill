import { AgentProfile, AgentId } from "@/types/grill";

export const AGENTS_DATA: Record<AgentId, AgentProfile> = {
  architecture: {
    id: "architecture",
    name: "Architecture Agent",
    icon: "🏗️",
    title: "Systems & Modularity Specialist",
    accentColor: "#7C9B7E",
    dimColor: "#4A5C4C",
  },
  security: {
    id: "security",
    name: "Security Agent",
    icon: "🛡️",
    title: "Auth & Threat Surface Specialist",
    accentColor: "#C68A46",
    dimColor: "#8A6234",
  },
  innovation: {
    id: "innovation",
    name: "Innovation Agent",
    icon: "💡",
    title: "DX & Modern Tooling Specialist",
    accentColor: "#5C8EA6",
    dimColor: "#3B5F70",
  },
};

export const SCAN_MESSAGES = [
  "Scanning repository structure...",
  "Parsing AST & entrypoint modules...",
  "Evaluating dependency graph...",
  "Extracting architecture patterns...",
  "Detecting security vulnerabilities & key exposure...",
  "Identifying innovation opportunities...",
  "Assembling specialist agent panel...",
];

export const REVIEW_MESSAGES = [
  "Agent digesting your response...",
  "Cross-referencing codebase AST...",
  "Evaluating answer depth & technical rigor...",
  "Synthesizing specialist verdict...",
];
