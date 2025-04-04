"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Rocket, ChevronDown, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AuthDialog } from "@/components/Dialogs";
import useAuth from "@/hooks/useAuth";
import { toast, useToast } from "@/hooks/use-toast";
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useRouter } from "next/navigation";
import { AI_MODELS } from './constants';
import { CHARACTER_TEMPLATES } from './constants';
import { TagInput } from './tagInput';

interface Character {
  _id: string;
  name: string;
  bio: string;
  avatar: string;
  topics: string[];
  areas_of_interest: string[];
  ai_model: string;
  custom_api_key?: string;
  temperature: number;
  personality: {
    traits: string[];
    likes: string[];
    dislikes: string[];
    moral_alignment: string;
  };
  speech: {
    voice_tone: string;
    phrases: string[];
    vocabulary_level: string;
    speaking_quirks: string[];
  };
  emotions: {
    current_mood: string;
    triggers: Array<{ stimulus: string; reaction: string; }>;
  };
  memory: {
    message_examples: string[];
    relationship_memory: {
      trust_level: number;
      past_interactions: string[];
    };
  };
  background: {
    backstory: string;
    beliefs: string[];
    values: string[];
  };
  goals: {
    primary_goal: string;
    secondary_goals: string[];
    motivations: string[];
    current_objectives: Array<{
      description: string;
      priority: 'high' | 'medium' | 'low';
      status: 'active' | 'completed' | 'abandoned';
    }>;
  };
}

interface PlatformConfig {
    platform: 'discord' | 'telegram';
    token: string;
    botName?: string;
    botImage?: string;
    botBio?: string;
}

interface CharacterState {
  name: string;
  bio: string;
  avatar: string;
  topics: string[];
  areas_of_interest: string[];
  ai_model: string;
  custom_api_key?: string;
  personality: {
    traits: string[];
    likes: string[];
    dislikes: string[];
    moral_alignment: string;
  };
  speech: {
    voice_tone: string;
    phrases: string[];
    vocabulary_level: string;
    speaking_quirks: string[];
  };
  emotions: {
    current_mood: string;
    triggers: Array<{
      stimulus: string;
      reaction: string;
    }>;
  };
  memory: {
    message_examples: string[];
    relationship_memory: {
      trust_level: number;
      past_interactions: string[];
    };
  };
  background: {
    backstory: string;
    beliefs: string[];
    values: string[];
  };
  temperature: number;
  goals: {
    primary_goal: string;
    secondary_goals: string[];
    motivations: string[];
    current_objectives: Array<{
      description: string;
      priority: 'high' | 'medium' | 'low';
      status: 'active' | 'completed' | 'abandoned';
    }>;
  };
}


// Add BASE_URL constant at the top level
const BASE_URL = 'https://api.rolechain.org';

// Update fetchWithAuth utility function
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

// Add this new component for tag input
export default function NewAgentPage() {
  // State declarations
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showNewCharacterForm, setShowNewCharacterForm] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    platform: 'telegram',
    token: '',
    botName: '',
    botImage: '',
    botBio: ''
  });
  const [newCharacter, setNewCharacter] = useState<CharacterState>({
    name: '',
    bio: '',
    avatar: '',
    topics: [],
    areas_of_interest: [],
    ai_model: 'DEEPINFRA_LLAMA',
    personality: {
      traits: [],
      likes: [],
      dislikes: [],
      moral_alignment: ''
    },
    speech: {
      voice_tone: '',
      phrases: [],
      vocabulary_level: '',
      speaking_quirks: []
    },
    emotions: {
      current_mood: '',
      triggers: []
    },
    memory: {
      message_examples: [],
      relationship_memory: {
        trust_level: 0,
        past_interactions: []
      }
    },
    background: {
      backstory: '',
      beliefs: [],
      values: []
    },
    temperature: 0.7,
    goals: {
      primary_goal: '',
      secondary_goals: [],
      motivations: [],
      current_objectives: []
    },
  });
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [showBotCustomization, setShowBotCustomization] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [deployedAgents, setDeployedAgents] = useState<{[key: string]: string}>({});
  const [useRoleChainModel, setUseRoleChainModel] = useState(false);
  const [showTour, setShowTour] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await fetchWithAuth('/characters');
        setCharacters(data);
      } catch (error) {
        console.error('Failed to fetch characters:', error);
        // Add proper error handling UI feedback here
      }
    };
    fetchCharacters();
  }, []);

  // Add this effect to handle RoleChain model selection
  useEffect(() => {
    if (newCharacter.ai_model === 'ROLECHAIN') {
      setUseRoleChainModel(true);
    }
  }, [newCharacter.ai_model]);

  const handleDeploy = async () => {
    const selectedChar = characters.find(c => c._id === selectedCharacter);
   
    // Add API key validation
    if (!useRoleChainModel && !selectedChar?.custom_api_key) {
      const modelConfig = AI_MODELS[selectedChar?.ai_model as keyof typeof AI_MODELS];
      toast({
        title: "Error",
        description: `Please provide an API key for ${modelConfig.platform} or switch to RoleChain model`,
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    try {
      const response = await fetchWithAuth('/agents', {
        method: 'POST',
        body: JSON.stringify({
          character_id: selectedCharacter,
          platform: platformConfig.platform,
          token: platformConfig.token,
          medium: platformConfig.platform,
          avatar: platformConfig.botImage || newCharacter.avatar,
          name: platformConfig.botName || newCharacter.name,
          bio: platformConfig.botBio || newCharacter.bio,
          bot_name: platformConfig.botName,
          bot_id: platformConfig.platform === 'telegram' ? platformConfig.token : null
        })
      });

      setDeployedAgents(prev => ({
        ...prev,
        [selectedCharacter]: response.agent._id
      }));

      router.push(`/agents/${response.agent._id}`);
      
      toast({
        title: "Success",
        description: "Agent deployed successfully!",
      });

    } catch (error) {
      console.error('Deploy failed:', error);
      toast({
        title: "Error",
        description: "Failed to deploy agent",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleStopAgent = async (characterId: string) => {
    const agentId = deployedAgents[characterId];
    if (!agentId) {
      console.error('No agent ID found for character');
      return;
    }

    try {
      await fetchWithAuth(`/agents/${agentId}/stop`, {
        method: 'POST'
      });
      
      setDeployedAgents(prev => {
        const newState = { ...prev };
        delete newState[characterId];
        return newState;
      });
      
      toast({
        title: "Success",
        description: "Agent stopped successfully!"
      });
    } catch (error) {
      console.error('Failed to stop agent:', error);
      toast({
        title: "Error",
        description: "Failed to stop agent",
        variant: "destructive"
      });
    }
  };

  const handleCreateCharacter = async () => {
    try {
      await fetchWithAuth('/characters', {
        method: 'POST',
        body: JSON.stringify(newCharacter)
      });
      
      // Refresh character list
      const updatedChars = await fetchWithAuth('/characters');
      setCharacters(updatedChars);
      setShowNewCharacterForm(false);
      toast({
        title: "Success",
        description: "Character created successfully!"
      });
    } catch (error) {
      console.error('Failed to create character:', error);
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive"
      });
    }
  };

  const handleSaveBotCustomization = async () => {
    try {
      if (platformConfig.platform === 'telegram') {
        const response = await fetchWithAuth('/agents/telegram/update-profile', {
          method: 'POST',
          body: JSON.stringify({
            token: platformConfig.token,
            name: platformConfig.botName,
            avatar: platformConfig.botImage,
            bio: platformConfig.botBio
          })
        });
      } else {
        const response = await fetchWithAuth('/agents/customize', {
          method: 'POST',
          body: JSON.stringify({
            platform: platformConfig.platform,
            token: platformConfig.token,
            botName: platformConfig.botName,
            botImage: platformConfig.botImage,
            botBio: platformConfig.botBio
          })
        });
      }
      
      toast({
        title: "Success",
        description: "Bot customization saved successfully!"
      });
    } catch (error) {
      console.error('Failed to save bot customization:', error);
      toast({
        title: "Error",
        description: "Failed to save bot customization",
        variant: "destructive"
      });
    }
  };

  // Add function to update character
  const handleUpdateCharacter = async (characterId: string) => {
    try {
      await fetchWithAuth(`/characters/${characterId}`, {
        method: 'PUT',
        body: JSON.stringify(newCharacter)
      });
      
      // Refresh character list
      const updatedChars = await fetchWithAuth('/characters');
      setCharacters(updatedChars);
      setIsEditing(false);
      setShowNewCharacterForm(false);
      toast({
        title: "Success",
        description: "Character updated successfully!"
      });
    } catch (error) {
      console.error('Failed to update character:', error);
      toast({
        title: "Error",
        description: "Failed to update character",
        variant: "destructive"
      });
    }
  };

  // Update the save button click handler in the form
  const handleSaveCharacter = async () => {
    // Add API key validation
    if (!useRoleChainModel && !newCharacter.custom_api_key) {
      const modelConfig = AI_MODELS[newCharacter.ai_model as keyof typeof AI_MODELS];
      toast({
        title: "Error",
        description: `Please provide an API key for ${modelConfig.platform} or switch to RoleChain model`,
        variant: "destructive"
      });
      return;
    }

    if (isEditing) {
      await handleUpdateCharacter(selectedCharacter);
    } else {
      await handleCreateCharacter();
    }
  };

  // Optional: Add delete character functionality
  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    
    try {
      await fetchWithAuth(`/characters/${characterId}`, {
        method: 'DELETE'
      });
      
      // Refresh character list
      const updatedChars = await fetchWithAuth('/characters');
      setCharacters(updatedChars);
      setSelectedCharacter('');
      toast({
        title: "Success",
        description: "Character deleted successfully!"
      });
    } catch (error) {
      console.error('Failed to delete character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive"
      });
    }
  };

  const handleCharacterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCharacter(e.target.value);
    const selected = characters.find(c => c._id === e.target.value);
    if (selected) {
      setNewCharacter({
        name: selected.name,
        bio: selected.bio,
        avatar: selected.avatar,
        topics: selected.topics || [],
        areas_of_interest: selected.areas_of_interest || [],
        ai_model: selected.ai_model,
        personality: {
          traits: selected.personality.traits || [],
          likes: selected.personality.likes || [],
          dislikes: selected.personality.dislikes || [],
          moral_alignment: selected.personality.moral_alignment || ''
        },
        speech: {
          voice_tone: selected.speech.voice_tone || '',
          phrases: selected.speech.phrases || [],
          vocabulary_level: selected.speech.vocabulary_level || '',
          speaking_quirks: selected.speech.speaking_quirks || []
        },
        emotions: {
          current_mood: selected.emotions.current_mood || '',
          triggers: selected.emotions.triggers || []
        },
        memory: {
          message_examples: selected.memory.message_examples || [],
          relationship_memory: {
            trust_level: selected.memory.relationship_memory.trust_level || 0,
            past_interactions: selected.memory.relationship_memory.past_interactions || []
          }
        },
        background: {
          backstory: selected.background.backstory || '',
          beliefs: selected.background.beliefs || [],
          values: selected.background.values || []
        },
        custom_api_key: selected.custom_api_key || '',
        temperature: selected.temperature || 0.7,
        goals: {
          primary_goal: selected.goals?.primary_goal || '',
          secondary_goals: selected.goals?.secondary_goals || [],
          motivations: selected.goals?.motivations || [],
          current_objectives: selected.goals?.current_objectives || []
        },
      });
      setUseCustomApiKey(!!selected.custom_api_key);
      setIsEditing(true);
      setShowNewCharacterForm(true);
    }
  };

  // Add function to fetch Telegram bot details
  const fetchTelegramBotDetails = async (token: string) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to fetch bot details');
      }

      // Update platform config with fetched details
      setPlatformConfig(prev => ({
        ...prev,
        botName: data.result.first_name || '',
        botBio: data.result.description || '',
        // username is also available as data.result.username if needed
      }));
      
      // Show bot customization section automatically
      setShowBotCustomization(true);
    } catch (error) {
      console.error('Failed to fetch bot details:', error);
      toast({
        title: "Error",
        description: "Invalid bot token or failed to fetch bot details",
        variant: "destructive"
      });
    }
  };

  // If not logged in, show only the auth dialog
  if (!user) {
    return (
      <AuthDialog
        isOpen={true}
        toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
      />
    );
  }

  // If logged in, show the regular page content
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Deploy AI Agent</h1>
        {deployedAgents[selectedCharacter] ? (
          <Button
            onClick={() => handleStopAgent(selectedCharacter)}
            className="flex items-center gap-2 rounded-[8px] border border-pink-500 bg-pink-500 px-4 py-2.5 font-semibold text-white hover:bg-pink-600"
            variant="default"
          >
            <span className="h-4 w-4">⏹️</span>
            Stop Agent
          </Button>
        ) : (
          <Button
            onClick={handleDeploy}
            className="flex items-center gap-2 rounded-[8px] border bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2.5 font-semibold text-white hover:opacity-90"
            variant="default"
            disabled={isDeploying || !selectedCharacter}
            style={{
              opacity: isDeploying || !selectedCharacter ? 0.5 : 1,
              cursor: isDeploying || !selectedCharacter ? 'not-allowed' : 'pointer'
            }}
          >
            {isDeploying ? (
              <>
                <span className="animate-spin">⚡</span>
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Agent
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Role</h2>
            <div className="space-y-4">
              <select
                className="w-full rounded-md border p-2"
                value={selectedCharacter}
                onChange={handleCharacterSelect}
              >
                <option value="">Select a role</option>
                {characters.map((character) => (
                  <option key={character._id} value={character._id}>
                    {character.name}
                  </option>
                ))}
              </select>

              <Button 
                className="w-full flex items-center justify-center gap-2 border-pink-500 text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300"
                variant="outline"
                onClick={() => {
                  setSelectedCharacter("");
                  setNewCharacter({
                    name: '',
                    bio: '',
                    avatar: '',
                    topics: [],
                    areas_of_interest: [],
                    ai_model: 'DEEPINFRA_LLAMA',
                    personality: {
                      traits: [],
                      likes: [],
                      dislikes: [],
                      moral_alignment: ''
                    },
                    speech: {
                      voice_tone: '',
                      phrases: [],
                      vocabulary_level: '',
                      speaking_quirks: []
                    },
                    emotions: {
                      current_mood: '',
                      triggers: []
                    },
                    memory: {
                      message_examples: [],
                      relationship_memory: {
                        trust_level: 0,
                        past_interactions: []
                      }
                    },
                    background: {
                      backstory: '',
                      beliefs: [],
                      values: []
                    },
                    temperature: 0.7,
                    goals: {
                      primary_goal: '',
                      secondary_goals: [],
                      motivations: [],
                      current_objectives: []
                    },
                  });
                  setIsEditing(false);
                  setShowNewCharacterForm(true);
                }}
              >
                <PlusCircle className="h-4 w-4" />
                Create New Role
              </Button>

              <div className="mt-4">
                <Label className="block mb-2">Community Templates</Label>
                <select
                  id="community-templates"
                  className="w-full rounded-md border p-2 mb-2"
                  onChange={(e) => {
                    if (e.target.value) {
                      const template = CHARACTER_TEMPLATES[e.target.value as keyof typeof CHARACTER_TEMPLATES];
                      setNewCharacter(template);
                      setShowNewCharacterForm(true);
                      setIsEditing(false);
                      setSelectedCharacter("");
                    }
                  }}
                  value=""
                >
                  <option value="">Select a template</option>
                  {Object.entries(CHARACTER_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Select Platform</Label>
                <select
                  id="platform"
                  className="w-full rounded-md border p-2"
                  value={platformConfig.platform}
                  onChange={(e) => setPlatformConfig(prev => ({
                    ...prev,
                    platform: e.target.value as 'discord' | 'telegram'
                  }))}
                >
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                </select>
              </div>
              <div>
                <Label htmlFor="token">
                  {platformConfig.platform === 'discord' ? 'Discord Bot Token' : 'Telegram Bot Token'}
                </Label>
                <Input
                  id="token"
                  type="password"
                  value={platformConfig.token}
                  onChange={(e) => {
                    const newToken = e.target.value;
                    setPlatformConfig(prev => ({
                      ...prev,
                      token: newToken
                    }));
                    
                    // If token is not empty and platform is telegram, fetch bot details
                    if (newToken && platformConfig.platform === 'telegram') {
                      fetchTelegramBotDetails(newToken);
                    }
                  }}
                  placeholder={`Enter ${platformConfig.platform} bot token`}
                />
              </div>
              {platformConfig.token && platformConfig.platform !== 'discord' && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">Bot Customization</h3>
                    <Button
                      variant="ghost"
                      onClick={() => setShowBotCustomization(!showBotCustomization)}
                      className="p-2 h-auto"
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          showBotCustomization ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </div>

                  {showBotCustomization && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="botName">Bot Name</Label>
                        <Input
                          id="botName"
                          value={platformConfig.botName}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            botName: e.target.value
                          }))}
                          placeholder="Enter bot name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="botImage">Bot Image URL</Label>
                        <Input
                          id="botImage"
                          value={platformConfig.botImage}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            botImage: e.target.value
                          }))}
                          placeholder="Enter bot image URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="botBio">Bot Bio</Label>
                        <Textarea
                          id="botBio"
                          value={platformConfig.botBio}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            botBio: e.target.value
                          }))}
                          placeholder="Enter bot bio"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={handleSaveBotCustomization}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white"
                        >
                          Save Customization
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {(showNewCharacterForm || isEditing) && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h2>
            <div className="space-y-6">
              {/* Core Identity Section */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Core Identity</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="block mb-2">Name</Label>
                      <Input
                        id="name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="block mb-2">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={newCharacter.avatar}
                        onChange={(e) => setNewCharacter(prev => ({...prev, avatar: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio" className="block mb-2">Bio</Label>
                    <Textarea
                      id="bio"
                      value={newCharacter.bio}
                      onChange={(e) => setNewCharacter(prev => ({...prev, bio: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="topics" className="block mb-2">Topics</Label>
                      <TagInput
                        value={newCharacter.topics}
                        onChange={(tags) => setNewCharacter(prev => ({...prev, topics: tags}))}
                        placeholder="Type topic and press Enter..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="interests" className="block mb-2">Areas of Interest</Label>
                      <TagInput
                        value={newCharacter.areas_of_interest}
                        onChange={(tags) => setNewCharacter(prev => ({
                          ...prev,
                          areas_of_interest: tags
                        }))}
                        placeholder="Type interest and press Enter..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personality Section */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Personality</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="traits" className="block mb-2">Personality Traits</Label>
                      <TagInput
                        value={newCharacter.personality.traits}
                        onChange={(tags) => setNewCharacter(prev => ({
                          ...prev,
                          personality: {
                            ...prev.personality,
                            traits: tags
                          }
                        }))}
                        placeholder="Type trait and press Enter..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="moral" className="block mb-2">Moral Alignment</Label>
                      <Input
                        id="moral"
                        value={newCharacter.personality.moral_alignment}
                        onChange={(e) => setNewCharacter(prev => ({
                          ...prev,
                          personality: {
                            ...prev.personality,
                            moral_alignment: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="likes" className="block mb-2">Likes</Label>
                      <TagInput
                        value={newCharacter.personality.likes}
                        onChange={(tags) => setNewCharacter(prev => ({
                          ...prev,
                          personality: {
                            ...prev.personality,
                            likes: tags
                          }
                        }))}
                        placeholder="Type like and press Enter..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="dislikes" className="block mb-2">Dislikes</Label>
                      <TagInput
                        value={newCharacter.personality.dislikes}
                        onChange={(tags) => setNewCharacter(prev => ({
                          ...prev,
                          personality: {
                            ...prev.personality,
                            dislikes: tags
                          }
                        }))}
                        placeholder="Type dislike and press Enter..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Section */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Speech Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice_tone">Voice Tone</Label>
                    <Input
                      id="voice_tone"
                      value={newCharacter.speech.voice_tone}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        speech: {
                          ...prev.speech,
                          voice_tone: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vocabulary">Vocabulary Level</Label>
                    <Input
                      id="vocabulary"
                      value={newCharacter.speech.vocabulary_level}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        speech: {
                          ...prev.speech,
                          vocabulary_level: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phrases">Common Phrases</Label>
                    <TagInput
                      value={newCharacter.speech.phrases}
                      onChange={(tags) => setNewCharacter(prev => ({
                        ...prev,
                        speech: {
                          ...prev.speech,
                          phrases: tags
                        }
                      }))}
                      placeholder="Type phrase and press Enter..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="quirks">Speaking Quirks</Label>
                    <TagInput
                      value={newCharacter.speech.speaking_quirks}
                      onChange={(tags) => setNewCharacter(prev => ({
                        ...prev,
                        speech: {
                          ...prev.speech,
                          speaking_quirks: tags
                        }
                      }))}
                      placeholder="Type quirk and press Enter..."
                    />
                  </div>
                </div>
              </div>

              {/* Background Section */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg relative">
                <h3 className="text-lg font-medium mb-4">Background</h3>
                
                {newCharacter.background.backstory && (
                  <div className="absolute inset-0 overflow-hidden opacity-10 p-4">
                    <div className="blur-sm text-sm">
                      {newCharacter.background.backstory}
                      {newCharacter.background.beliefs.length > 0 && (
                        <div className="mt-2">
                          Beliefs: {newCharacter.background.beliefs.join(', ')}
                        </div>
                      )}
                      {newCharacter.background.values.length > 0 && (
                        <div className="mt-2">
                          Values: {newCharacter.background.values.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 relative z-10">
                  <div>
                    <Label htmlFor="backstory">Backstory</Label>
                    <Textarea
                      id="backstory"
                      value={newCharacter.background.backstory}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          backstory: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beliefs">Beliefs</Label>
                    <TagInput
                      value={newCharacter.background.beliefs}
                      onChange={(tags) => setNewCharacter(prev => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          beliefs: tags
                        }
                      }))}
                      placeholder="Type belief and press Enter..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="values">Values</Label>
                    <TagInput
                      value={newCharacter.background.values}
                      onChange={(tags) => setNewCharacter(prev => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          values: tags
                        }
                      }))}
                      placeholder="Type value and press Enter..."
                    />
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Goals & Objectives</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primary_goal">Primary Goal</Label>
                    <Input
                      id="primary_goal"
                      value={newCharacter.goals.primary_goal}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        goals: {
                          ...prev.goals,
                          primary_goal: e.target.value
                        }
                      }))}
                      placeholder="Enter the character's main goal..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondary_goals">Secondary Goals (one per line)</Label>
                    <Textarea
                      id="secondary_goals"
                      value={newCharacter.goals.secondary_goals.join('\n')}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        goals: {
                          ...prev.goals,
                          secondary_goals: e.target.value.split('\n').filter(line => line.trim())
                        }
                      }))}
                      placeholder="Enter secondary goals..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivations">Motivations (one per line)</Label>
                    <Textarea
                      id="motivations"
                      value={newCharacter.goals.motivations.join('\n')}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        goals: {
                          ...prev.goals,
                          motivations: e.target.value.split('\n').filter(line => line.trim())
                        }
                      }))}
                      placeholder="Enter character motivations..."
                    />
                  </div>

                  <div>
                    <Label>Current Objectives</Label>
                    <div className="space-y-2">
                      {newCharacter.goals.current_objectives.map((objective, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <Input
                            value={objective.description}
                            onChange={(e) => {
                              const newObjectives = [...newCharacter.goals.current_objectives];
                              newObjectives[index] = { ...objective, description: e.target.value };
                              setNewCharacter(prev => ({
                                ...prev,
                                goals: { ...prev.goals, current_objectives: newObjectives }
                              }));
                            }}
                            placeholder="Objective description"
                            className="flex-1"
                          />
                          <select
                            value={objective.priority}
                            onChange={(e) => {
                              const newObjectives = [...newCharacter.goals.current_objectives];
                              newObjectives[index] = { 
                                ...objective, 
                                priority: e.target.value as 'high' | 'medium' | 'low' 
                              };
                              setNewCharacter(prev => ({
                                ...prev,
                                goals: { ...prev.goals, current_objectives: newObjectives }
                              }));
                            }}
                            className="rounded-md border p-2"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <select
                            value={objective.status}
                            onChange={(e) => {
                              const newObjectives = [...newCharacter.goals.current_objectives];
                              newObjectives[index] = { 
                                ...objective, 
                                status: e.target.value as 'active' | 'completed' | 'abandoned' 
                              };
                              setNewCharacter(prev => ({
                                ...prev,
                                goals: { ...prev.goals, current_objectives: newObjectives }
                              }));
                            }}
                            className="rounded-md border p-2"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="abandoned">Abandoned</option>
                          </select>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const newObjectives = newCharacter.goals.current_objectives.filter((_, i) => i !== index);
                              setNewCharacter(prev => ({
                                ...prev,
                                goals: { ...prev.goals, current_objectives: newObjectives }
                              }));
                            }}
                            className="px-2 h-10"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => {
                          setNewCharacter(prev => ({
                            ...prev,
                            goals: {
                              ...prev.goals,
                              current_objectives: [
                                ...prev.goals.current_objectives,
                                {
                                  description: '',
                                  priority: 'medium' as const,
                                  status: 'active' as const
                                }
                              ]
                            }
                          }));
                        }}
                        variant="outline"
                        className="w-full mt-2"
                      >
                        Add Objective
                      </Button>                    </div>
                  </div>
                </div>
              </div>

              {/* AI Model Configuration */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">AI Model Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="use-rolechain"
                      checked={useRoleChainModel}
                      onCheckedChange={(checked) => {
                        setUseRoleChainModel(checked);
                        if (checked) {
                          setNewCharacter(prev => ({
                            ...prev,
                            ai_model: 'ROLECHAIN'
                          }));
                          setUseCustomApiKey(false);
                        }
                      }}
                      className="data-[state=checked]:bg-purple-500"
                    />
                    <Label htmlFor="use-rolechain">Use RoleChain Custom Model</Label>
                    <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      No API Key Required
                    </div>
                  </div>

                  {!useRoleChainModel ? (
                    <>
                      <div>
                        <Label htmlFor="ai_model">AI Model</Label>
                        <select
                          id="ai_model"
                          className="w-full rounded-md border p-2"
                          value={newCharacter.ai_model}
                          onChange={(e) => setNewCharacter(prev => ({...prev, ai_model: e.target.value}))}
                        >
                          {Object.entries(AI_MODELS)
                            .filter(([key]) => key !== 'ROLECHAIN')
                            .map(([key, value]) => (
                              <option key={key} value={key}>
                                {value.model} ({value.platform})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="use-custom-key"
                          checked={useCustomApiKey}
                          onCheckedChange={setUseCustomApiKey}
                          className="data-[state=checked]:bg-purple-500"
                        />
                        <Label htmlFor="use-custom-key">Use Custom API Key</Label>
                      </div>

                      {useCustomApiKey && (
                        <div className="space-y-2">
                          <Label htmlFor="custom_api_key">
                            API Key for {AI_MODELS[newCharacter.ai_model as keyof typeof AI_MODELS].platform}
                            <span className="text-sm text-gray-500 ml-2">
                              (Environment Variable: {AI_MODELS[newCharacter.ai_model as keyof typeof AI_MODELS].apiKeyEnv})
                            </span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="custom_api_key"
                              type={showApiKey ? "text" : "password"}
                              value={newCharacter.custom_api_key}
                              onChange={(e) => setNewCharacter(prev => ({
                                ...prev,
                                custom_api_key: e.target.value
                              }))}
                              placeholder={`Enter ${AI_MODELS[newCharacter.ai_model as keyof typeof AI_MODELS].platform} API key`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? "Hide" : "Show"}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500">
                            This key will only be used for this character. If not provided, the system default will be used.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-2">RoleChain Custom Model</h4>
                        <p className="text-sm text-purple-600">
                          Using RoleChain's custom model optimized for role-based interactions. This model:
                        </p>
                        <ul className="list-disc list-inside text-sm text-purple-600 mt-2 space-y-1">
                          <li>Maintains consistent character behavior</li>
                          <li>Handles complex memory and context</li>
                          <li>Optimized for natural conversations</li>
                          <li>No API key required</li>
                        </ul>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-yellow-600 text-sm">
                          <span className="font-medium">Note:</span> Temperature and other model-specific settings will be automatically optimized when using RoleChain.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Memory & Behavior Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="temperature">
                      Temperature ({newCharacter.temperature})
                      <span className="text-sm text-gray-500 ml-2">
                        (Higher values = more creative, Lower values = more focused)
                      </span>
                    </Label>
                    <Input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newCharacter.temperature}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value)
                      }))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message_examples">Message Examples (one per line)</Label>
                    <Textarea
                      id="message_examples"
                      value={newCharacter.memory.message_examples.join('\n')}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        memory: {
                          ...prev.memory,
                          message_examples: e.target.value.split('\n').filter(line => line.trim())
                        }
                      }))}
                      placeholder="Enter example messages/conversations..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trust_level">
                      Trust Level ({newCharacter.memory.relationship_memory.trust_level})
                    </Label>
                    <Input
                      id="trust_level"
                      type="range"
                      min="0"
                      max="100"
                      value={newCharacter.memory.relationship_memory.trust_level}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        memory: {
                          ...prev.memory,
                          relationship_memory: {
                            ...prev.memory.relationship_memory,
                            trust_level: parseInt(e.target.value)
                          }
                        }
                      }))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="past_interactions">Past Interactions (one per line)</Label>
                    <Textarea
                      id="past_interactions"
                      value={newCharacter.memory.relationship_memory.past_interactions.join('\n')}
                      onChange={(e) => setNewCharacter(prev => ({
                        ...prev,
                        memory: {
                          ...prev.memory,
                          relationship_memory: {
                            ...prev.memory.relationship_memory,
                            past_interactions: e.target.value.split('\n').filter(line => line.trim())
                          }
                        }
                      }))}
                      placeholder="Enter past interactions or relationship history..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewCharacterForm(false);
                    setIsEditing(false);
                    setSelectedCharacter("");
                  }}
                  className="hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCharacter}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white"
                >
                  {isEditing ? 'Save Changes' : 'Create Character'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Steps
        enabled={showTour}
        initialStep={0}  // Add this line
        steps={[
          {
            element: "#community-templates",
            intro: "Browse and use pre-made character templates to quickly get started with popular roles! 🚀",
            title: "Community Templates",
            position: "bottom"
          }
        ]}
        onExit={() => setShowTour(false)}
      />
    </div>
  );
}
