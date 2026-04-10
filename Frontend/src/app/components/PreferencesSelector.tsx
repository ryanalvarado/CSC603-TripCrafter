import { Heart, Mountain, Waves, Camera, Coffee, Palmtree, Utensils, Building2 } from 'lucide-react';

interface PreferencesSelectorProps {
  selected: string[];
  onSelect: (selected: string[]) => void;
  travelStyle: string;
  onStyleChange: (style: string) => void;
}

const tripTypes = [
  { id: 'beach', name: 'Beach & Relaxation', icon: Waves, color: 'text-blue-500' },
  { id: 'adventure', name: 'Adventure', icon: Mountain, color: 'text-green-500' },
  { id: 'cultural', name: 'Cultural', icon: Camera, color: 'text-purple-500' },
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'text-pink-500' },
  { id: 'foodie', name: 'Food & Cuisine', icon: Utensils, color: 'text-orange-500' },
  { id: 'urban', name: 'City & Urban', icon: Building2, color: 'text-gray-500' },
  { id: 'nature', name: 'Nature', icon: Palmtree, color: 'text-emerald-500' },
  { id: 'leisure', name: 'Leisure', icon: Coffee, color: 'text-amber-500' },
];

const travelStyles = [
  { id: 'relaxed', name: 'Relaxed', emoji: '🧘', description: 'Take it slow and easy' },
  { id: 'balanced', name: 'Balanced', emoji: '⚖️', description: 'Mix of activities and rest' },
  { id: 'packed', name: 'Action-Packed', emoji: '⚡', description: 'See and do everything' },
];

export function PreferencesSelector({ selected, onSelect, travelStyle, onStyleChange }: PreferencesSelectorProps) {
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((item) => item !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What type of trip interests you?</h2>
        <p className="text-gray-600">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {tripTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selected.includes(type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => toggleSelection(type.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-purple-600' : type.color}`} />
              <div className="text-sm font-semibold text-gray-800 text-center">{type.name}</div>
            </button>
          );
        })}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Travel Pace</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {travelStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                travelStyle === style.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{style.emoji}</div>
              <div className="font-bold text-gray-800">{style.name}</div>
              <div className="text-sm text-gray-600 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
