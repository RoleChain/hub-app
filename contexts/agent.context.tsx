"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
export type TPromptBy = "user" | "agent";
export interface TPrompt {
  id: string;
  title: string;
  content?: string;
  streaming?: boolean;
  abortPrompt?: boolean;
  fullContentLoaded?: boolean;
  agentID: string;
  promptBy: TPromptBy;
}
export type TAgent = {
  id: string;
  name: string;
  prompts: TPrompt[];
  latestPrompt: TPrompt | null;
};
interface AgentContextType {
  agent: TAgent;
  loadAgent: (campaignID: string) => void;
  updateCurrentAgent: (updater: (agent: TAgent) => void) => void;
  onNewPrompt: (prompt: TPrompt) => void;
  updateCurrentPrompt: (prompt: TPrompt) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [agent, setAgent] = useState<TAgent>(initializeAgentSession());

  const updateCurrentAgent = useCallback(
    (updater: (campaign: TAgent) => void) => {
      setAgent((prevAgentData) => {
        const agent_to_update = {
          ...prevAgentData,
        };
        if (agent_to_update) {
          updater(agent_to_update);
        }
        return agent_to_update;
      });
    },
    [setAgent]
  );
  const loadAgent = useCallback((agentID: number | string) => {
    const agent = AGENTS.find((agent) => agent.id === agentID);
    if (agent) {
      setAgent(agent);
    } else setAgent(initializeAgentSession());
  }, []);

  const onNewPrompt = useCallback(
    (prompt: TPrompt) => {
      console.log("prmot", prompt);
      updateCurrentAgent((agent: TAgent) => {
        const prompt_to_add = { ...prompt, fullContentLoaded: false };
        // Create a new copy of the prompts array to avoid mutating the state directly
        const updatedPrompts = [...agent.prompts, prompt_to_add];
        agent.prompts = updatedPrompts;
        agent.latestPrompt = prompt_to_add;
        return agent;
      });
    },
    [updateCurrentAgent]
  );
  const updateCurrentPrompt = useCallback(
    (prompt: TPrompt) => {
      updateCurrentAgent((agent) => {
        const promptIndex = agent.prompts.findIndex((p) => p.id === prompt.id);
        if (promptIndex !== -1) {
          //update prompt instance
          agent.prompts[promptIndex] = { ...prompt };
        }
      });
    },
    [updateCurrentAgent]
  );

  const value = useMemo(
    () => ({
      agent,
      loadAgent,
      updateCurrentAgent,
      onNewPrompt,
      updateCurrentPrompt,
    }),
    [agent, loadAgent, updateCurrentAgent, onNewPrompt, updateCurrentPrompt]
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};

export const useAgentCtx = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgentCtx must be used within a AgentContextProvider");
  }
  return context;
};

// Utility functions
function initializeAgentSession(agentID?: number | string): TAgent {
  const initializedAgentSession =
    AGENTS.find((agent) => agent.id === agentID) ?? AGENTS[0];

  return initializedAgentSession;
}

const AGENTS: TAgent[] = [
  {
    id: "agent_01",
    name: "AGENT01",
    prompts: [],
    latestPrompt: null,
  },
  {
    id: "agent_02",
    name: "AGENT02",
    prompts: [],
    latestPrompt: null,
  },
];
