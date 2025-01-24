import { useState } from "react";
import { X } from "lucide-react";

export const TagInput = ({ 
    value, 
    onChange, 
    placeholder 
  }: { 
    value: string[], 
    onChange: (tags: string[]) => void,
    placeholder?: string 
  }) => {
    const [input, setInput] = useState('');
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = input.trim();
        if (newTag && !value.includes(newTag)) {
          onChange([...value, newTag]);
        }
        setInput('');
      } else if (e.key === 'Backspace' && !input && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    };
  
    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove));
    };
  
    return (
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white">
        {value.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-pink-600 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none min-w-[120px]"
          placeholder={value.length === 0 ? placeholder : "Type and press Enter..."}
        />
      </div>
    );
  };
  