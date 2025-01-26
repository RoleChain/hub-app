"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthDialog } from "@/components/Dialogs";
import useAuth from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { CHARACTER_TEMPLATES } from "../new/constants";
import { PlusCircle } from "lucide-react";
import { TagInput } from "../new/tagInput";

// Rename Character interface to Role
interface Role {
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

// Add platform config interface
interface PlatformConfig {
  platform: 'discord' | 'telegram';
  token: string;
  botName: string;
  botImage: string;
  botBio: string;
}

const BASE_URL = 'https://api.rolechain.org';

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

export default function EditAgent() {
  const { agentId } = useParams();
  console.log(agentId);
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [role, setRole] = useState<Role>({
    _id: '',
    name: '',
    bio: '',
    avatar: '',
    topics: [],
    areas_of_interest: [],
    ai_model: 'ROLECHAIN',
    temperature: 0.7,
    personality: {
      traits: [],
      likes: [],
      dislikes: [],
      moral_alignment: '',
    },
    speech: {
      voice_tone: '',
      phrases: [],
      vocabulary_level: '',
      speaking_quirks: [],
    },
    emotions: {
      current_mood: '',
      triggers: [],
    },
    memory: {
      message_examples: [],
      relationship_memory: {
        trust_level: 0,
        past_interactions: [],
      },
    },
    background: {
      backstory: '',
      beliefs: [],
      values: [],
    },
    goals: {
      primary_goal: '',
      secondary_goals: [],
      motivations: [],
      current_objectives: [],
    },
  });
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [useRoleChainModel, setUseRoleChainModel] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'running' | 'stopped'>('stopped');

  // Add state for platform config
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    platform: 'discord',
    token: '',
    botName: '',
    botImage: '',
    botBio: ''
  });
  const [showBotCustomization, setShowBotCustomization] = useState(false);

  const [showPersonalRoles, setShowPersonalRoles] = useState(false);
  const [showCommunityTemplates, setShowCommunityTemplates] = useState(false);
  const [personalRoles, setPersonalRoles] = useState<Role[]>([]);

  // Add new state for role saving
  const [isSavingAsRole, setIsSavingAsRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const agentData = await fetchWithAuth(`/agents/${agentId}`);
        setAgent(agentData);
        setAgentStatus(agentData.active ? 'running' : 'stopped');
        
        // Fetch all characters and filter by ID
        const allCharacters = await fetchWithAuth(`/characters`);
        const characterData = allCharacters.find((char: Role) => char._id === agentData.character_id);
        
        if (!characterData) {
          throw new Error('Character not found');
        }

        setRole({
          _id: characterData._id,
          name: characterData.name,
          bio: characterData.bio,
          avatar: characterData.avatar,
          topics: characterData.topics || [],
          areas_of_interest: characterData.areas_of_interest || [],
          ai_model: characterData.ai_model,
          custom_api_key: characterData.custom_api_key,
          temperature: characterData.temperature,
          personality: characterData.personality,
          speech: characterData.speech,
          emotions: characterData.emotions,
          memory: characterData.memory,
          background: characterData.background,
          goals: characterData.goals,
        });
        
        setUseCustomApiKey(!!characterData.custom_api_key);
        setUseRoleChainModel(characterData.ai_model === 'ROLECHAIN');
        setIsLoading(false);

        // Update this line to use /characters instead of /characters/personal
        const personalCharactersData = await fetchWithAuth('/characters');
        setPersonalRoles(personalCharactersData);
      } catch (error) {
        console.error('Failed to fetch agent data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch agent data",
          variant: "destructive"
        });
      }
    };

    if (agentId) {
      fetchAgentData();
    }
  }, [agentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let characterId = agent.character_id;
      
      // If the selected role is from community templates (doesn't have an _id)
      // or if it's a different role than the agent's current one,
      // create a new character
      if (!role._id || role._id !== agent.character_id) {
        // Create new character
        const newCharacterResponse = await fetchWithAuth('/characters', {
          method: 'POST',
          body: JSON.stringify({
            name: role.name,
            bio: role.bio,
            avatar: role.avatar,
            topics: role.topics,
            areas_of_interest: role.areas_of_interest,
            ai_model: role.ai_model,
            custom_api_key: useCustomApiKey ? role.custom_api_key : undefined,
            temperature: role.temperature,
            personality: role.personality,
            speech: role.speech,
            emotions: role.emotions,
            memory: role.memory,
            background: role.background,
            goals: role.goals,
          })
        });
        
        characterId = newCharacterResponse._id;
      } else {
        // Update existing character
        await fetchWithAuth(`/characters/${agent.character_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: role.name,
            bio: role.bio,
            avatar: role.avatar,
            topics: role.topics,
            areas_of_interest: role.areas_of_interest,
            ai_model: role.ai_model,
            custom_api_key: useCustomApiKey ? role.custom_api_key : undefined,
            temperature: role.temperature,
            personality: role.personality,
            speech: role.speech,
            emotions: role.emotions,
            memory: role.memory,
            background: role.background,
            goals: role.goals,
          })
        });
      }

      // Update agent's character_id if it changed
      if (characterId !== agent.character_id) {
        await fetchWithAuth(`/agents/${agentId}`, {
          method: 'PUT',
          body: JSON.stringify({
            character_id: characterId
          })
        });
      }

      toast({
        title: "Success",
        description: "Agent updated successfully!"
      });
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartAgent = async () => {
    setIsStarting(true);
    try {
      await fetchWithAuth(`/agents/${agentId}/start`, {
        method: 'POST'
      });
      
      toast({
        title: "Success",
        description: "Agent started successfully!"
      });
      setAgentStatus('running');
    } catch (error) {
      console.error('Failed to start agent:', error);
      toast({
        title: "Error",
        description: "Failed to start agent",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAgent = async () => {
    setIsStopping(true);
    try {
      await fetchWithAuth(`/agents/${agentId}/stop`, {
        method: 'POST'
      });
      
      toast({
        title: "Success",
        description: "Agent stopped successfully!"
      });
      setAgentStatus('stopped');
    } catch (error) {
      console.error('Failed to stop agent:', error);
      toast({
        title: "Error",
        description: "Failed to stop agent",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
  };

  // Update save as role function to not include role name input
  const handleSaveAsRole = async () => {
    setIsSavingAsRole(true);
    try {
      const roleData = {
        ...role,
        _id: undefined // Remove ID if creating new character
      };

      if (role._id) {
        // Update existing character
        await fetchWithAuth(`/characters/${role._id}`, {
          method: 'PUT',
          body: JSON.stringify(roleData)
        });
        toast({
          title: "Success",
          description: "Character updated successfully!"
        });
      } else {
        // Create new character from template
        await fetchWithAuth('/characters', {
          method: 'POST',
          body: JSON.stringify(roleData)
        });
        toast({
          title: "Success",
          description: "Character created successfully!"
        });
      }

      // Refresh the personal roles list
      const personalRolesData = await fetchWithAuth('/characters');
      setPersonalRoles(personalRolesData);
    } catch (error) {
      console.error('Failed to save character:', error);
      toast({
        title: "Error",
        description: "Failed to save character",
        variant: "destructive"
      });
    } finally {
      setIsSavingAsRole(false);
    }
  };

  if (!user) {
    return (
      <AuthDialog
        isOpen={true}
        toggleIsOpen={() => {}}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit {agent.name}</h1>
        <div className="flex gap-4">
          {agentStatus === 'running' ? (
            <Button
              onClick={handleStopAgent}
              disabled={isStopping}
              className="bg-pink-500 text-white hover:bg-pink-600"
            >
              {isStopping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <span className="h-4 w-4 mr-2">⏹️</span>
                  Stop Agent
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStartAgent}
              disabled={isStarting}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <span className="h-4 w-4 mr-2">▶️</span>
                  Start Agent
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Role Selection Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Role Selection</h3>
            </div>
            
            {/* Personal Roles Section */}
            <div className="mb-4">
              <button
                onClick={() => setShowPersonalRoles(!showPersonalRoles)}
                className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
              >
                <span className="font-medium">Your Roles</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showPersonalRoles ? 'rotate-180' : ''}`} />
              </button>
              
              {showPersonalRoles && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {personalRoles.map((r) => (
                    <Card
                      key={r._id}
                      className={`cursor-pointer transition-all duration-300 ${
                        role._id === r._id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setRole(r)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${r.avatar || '/default-avatar.png'})` }}
                          />
                          <div>
                            <h4 className="font-medium">{r.name}</h4>
                            <p className="text-sm text-gray-500">Personal Role</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{r.bio}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Community Templates Section */}
            <div>
              <button
                onClick={() => setShowCommunityTemplates(!showCommunityTemplates)}
                className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
              >
                <span className="font-medium">Community Templates</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showCommunityTemplates ? 'rotate-180' : ''}`} />
              </button>
              
              {showCommunityTemplates && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {Object.entries(CHARACTER_TEMPLATES).map(([key, template]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all duration-300 ${
                        role.name === template.name ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => {
                        setRole({
                          ...role,
                          ...template,
                          _id: role._id // Preserve the original ID
                        });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${template.avatar || '/default-avatar.png'})` }}
                          />
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-500">Template</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.bio}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Core Identity Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Core Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={role.name}
                    onChange={(e) => setRole(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={role.avatar}
                    onChange={(e) => setRole(prev => ({...prev, avatar: e.target.value}))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={role.bio}
                  onChange={(e) => setRole(prev => ({...prev, bio: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="topics">Topics</Label>
                  <TagInput
                    value={role.topics}
                    onChange={(tags) => setRole(prev => ({...prev, topics: tags}))}
                    placeholder="Type topic and press Enter..."
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Areas of Interest</Label>
                  <TagInput
                    value={role.areas_of_interest}
                    onChange={(tags) => setRole(prev => ({...prev, areas_of_interest: tags}))}
                    placeholder="Type interest and press Enter..."
                  />
                </div>
              </div>
            </div>

            {/* Personality Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Personality</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="traits">Personality Traits</Label>
                  <TagInput
                    value={role.personality.traits}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      personality: { ...prev.personality, traits: tags }
                    }))}
                    placeholder="Type trait and press Enter..."
                  />
                </div>
                <div>
                  <Label htmlFor="moral">Moral Alignment</Label>
                  <Input
                    id="moral"
                    value={role.personality.moral_alignment}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      personality: { ...prev.personality, moral_alignment: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="likes">Likes</Label>
                  <TagInput
                    value={role.personality.likes}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      personality: { ...prev.personality, likes: tags }
                    }))}
                    placeholder="Type like and press Enter..."
                  />
                </div>
                <div>
                  <Label htmlFor="dislikes">Dislikes</Label>
                  <TagInput
                    value={role.personality.dislikes}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      personality: { ...prev.personality, dislikes: tags }
                    }))}
                    placeholder="Type dislike and press Enter..."
                  />
                </div>
              </div>
            </div>

            {/* Speech Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Speech Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Voice Tone</Label>
                  <Input
                    value={role.speech.voice_tone}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      speech: { ...prev.speech, voice_tone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Vocabulary Level</Label>
                  <Input
                    value={role.speech.vocabulary_level}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      speech: { ...prev.speech, vocabulary_level: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Common Phrases</Label>
                  <TagInput
                    value={role.speech.phrases}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      speech: { ...prev.speech, phrases: tags }
                    }))}
                    placeholder="Type phrase and press Enter..."
                  />
                </div>
                <div>
                  <Label>Speaking Quirks</Label>
                  <TagInput
                    value={role.speech.speaking_quirks}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      speech: { ...prev.speech, speaking_quirks: tags }
                    }))}
                    placeholder="Type quirk and press Enter..."
                  />
                </div>
              </div>
            </div>

            {/* Emotions Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Emotions</h3>
              <div className="space-y-4">
                <div>
                  <Label>Current Mood</Label>
                  <Input
                    value={role.emotions.current_mood}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      emotions: { ...prev.emotions, current_mood: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Emotional Triggers</Label>
                  <div className="space-y-2">
                    {role.emotions.triggers.map((trigger, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={trigger.stimulus}
                          onChange={(e) => {
                            const newTriggers = [...role.emotions.triggers];
                            newTriggers[index] = { ...trigger, stimulus: e.target.value };
                            setRole(prev => ({
                              ...prev,
                              emotions: { ...prev.emotions, triggers: newTriggers }
                            }));
                          }}
                          placeholder="Stimulus"
                          className="flex-1"
                        />
                        <Input
                          value={trigger.reaction}
                          onChange={(e) => {
                            const newTriggers = [...role.emotions.triggers];
                            newTriggers[index] = { ...trigger, reaction: e.target.value };
                            setRole(prev => ({
                              ...prev,
                              emotions: { ...prev.emotions, triggers: newTriggers }
                            }));
                          }}
                          placeholder="Reaction"
                          className="flex-1"
                        />
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const newTriggers = role.emotions.triggers.filter((_, i) => i !== index);
                            setRole(prev => ({
                              ...prev,
                              emotions: { ...prev.emotions, triggers: newTriggers }
                            }));
                          }}
                          className="px-2"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRole(prev => ({
                          ...prev,
                          emotions: {
                            ...prev.emotions,
                            triggers: [...prev.emotions.triggers, { stimulus: '', reaction: '' }]
                          }
                        }));
                      }}
                      className="w-full"
                    >
                      Add Trigger
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory & Behavior Settings */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Memory & Behavior Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="temperature">
                    Temperature ({role.temperature})
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
                    value={role.temperature}
                    onChange={(e) => setRole(prev => ({
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
                    value={role.memory.message_examples.join('\n')}
                    onChange={(e) => setRole(prev => ({
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
                    Trust Level ({role.memory.relationship_memory.trust_level})
                  </Label>
                  <Input
                    id="trust_level"
                    type="range"
                    min="0"
                    max="100"
                    value={role.memory.relationship_memory.trust_level}
                    onChange={(e) => setRole(prev => ({
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
                    value={role.memory.relationship_memory.past_interactions.join('\n')}
                    onChange={(e) => setRole(prev => ({
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

            {/* Background Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Background</h3>
              <div className="space-y-4">
                <div>
                  <Label>Backstory</Label>
                  <Textarea
                    value={role.background.backstory}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      background: { ...prev.background, backstory: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Beliefs</Label>
                  <TagInput
                    value={role.background.beliefs}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      background: { ...prev.background, beliefs: tags }
                    }))}
                    placeholder="Type belief and press Enter..."
                  />
                </div>
                <div>
                  <Label>Values</Label>
                  <TagInput
                    value={role.background.values}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      background: { ...prev.background, values: tags }
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
                  <Label>Primary Goal</Label>
                  <Input
                    value={role.goals.primary_goal}
                    onChange={(e) => setRole(prev => ({
                      ...prev,
                      goals: { ...prev.goals, primary_goal: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Secondary Goals</Label>
                  <TagInput
                    value={role.goals.secondary_goals}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      goals: { ...prev.goals, secondary_goals: tags }
                    }))}
                    placeholder="Type secondary goal and press Enter..."
                  />
                </div>
                <div>
                  <Label>Motivations</Label>
                  <TagInput
                    value={role.goals.motivations}
                    onChange={(tags) => setRole(prev => ({
                      ...prev,
                      goals: { ...prev.goals, motivations: tags }
                    }))}
                    placeholder="Type motivation and press Enter..."
                  />
                </div>
                <div>
                  <Label>Current Objectives</Label>
                  <div className="space-y-2">
                    {role.goals.current_objectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={objective.description}
                          onChange={(e) => {
                            const newObjectives = [...role.goals.current_objectives];
                            newObjectives[index] = { ...objective, description: e.target.value };
                            setRole(prev => ({
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
                            const newObjectives = [...role.goals.current_objectives];
                            newObjectives[index] = { 
                              ...objective, 
                              priority: e.target.value as 'high' | 'medium' | 'low' 
                            };
                            setRole(prev => ({
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
                            const newObjectives = [...role.goals.current_objectives];
                            newObjectives[index] = { 
                              ...objective, 
                              status: e.target.value as 'active' | 'completed' | 'abandoned' 
                            };
                            setRole(prev => ({
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
                            const newObjectives = role.goals.current_objectives.filter((_, i) => i !== index);
                            setRole(prev => ({
                              ...prev,
                              goals: { ...prev.goals, current_objectives: newObjectives }
                            }));
                          }}
                          className="px-2"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRole(prev => ({
                          ...prev,
                          goals: {
                            ...prev.goals,
                            current_objectives: [
                              ...prev.goals.current_objectives,
                              { description: '', priority: 'medium', status: 'active' }
                            ]
                          }
                        }));
                      }}
                      className="w-full"
                    >
                      Add Objective
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Model Configuration */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">AI Model Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label>Model</Label>
                  <select
                    value={role.ai_model}
                    onChange={(e) => setRole(prev => ({ ...prev, ai_model: e.target.value }))}
                    className="w-full rounded-md border p-2"
                  >
                    <option value="ROLECHAIN">RoleChain</option>
                    <option value="OPENAI">OpenAI</option>
                    <option value="ANTHROPIC">Anthropic</option>
                    <option value="DEEPINFRA_LLAMA">DeepInfra (Llama)</option>
                  </select>
                </div>
                {role.ai_model !== 'ROLECHAIN' && (
                  <div>
                    <Label>Custom API Key</Label>
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={role.custom_api_key}
                      onChange={(e) => setRole(prev => ({ ...prev, custom_api_key: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="mt-2"
                    >
                      {showApiKey ? "Hide" : "Show"} API Key
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Character Button */}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              onClick={handleSaveAsRole}
              disabled={isSavingAsRole}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
            >
              {isSavingAsRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {role._id ? 'Updating Character...' : 'Creating Character...'}
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {role._id ? 'Update Character' : 'Create Character'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 