import {
  Utensils,
  Camera,
  ShoppingBag,
  Waves,
  Mountain,
  TreePine,
  Music,
  Palette,
  Dumbbell,
  Wine,
  Landmark,
  PartyPopper,
} from 'lucide-react';

interface ActivitySelectorProps {
  selected: string[];
  onSelect: (selected: string[]) => void;
}

const activities = [
  { id: 'dining', name: 'Fine Dining', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'sightseeing', name: 'Sightseeing', icon: Camera, color: 'bg-blue-100 text-blue-600' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'water', name: 'Water Sports', icon: Waves, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'hiking', name: 'Hiking', icon: Mountain, color: 'bg-green-100 text-green-600' },
  { id: 'nature', name: 'Nature Tours', icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'music', name: 'Live Music', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { id: 'art', name: 'Art & Museums', icon: Palette, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'wellness', name: 'Wellness & Spa', icon: Dumbbell, color: 'bg-teal-100 text-teal-600' },
  { id: 'wine', name: 'Wine Tasting', icon: Wine, color: 'bg-red-100 text-red-600' },
  { id: 'historical', name: 'Historical Sites', icon: Landmark, color: 'bg-amber-100 text-amber-600' },
  { id: 'nightlife', name: 'Nightlife', icon: PartyPopper, color: 'bg-fuchsia-100 text-fuchsia-600' },
];

export function ActivitySelector({ selected, onSelect }: ActivitySelectorProps) {
  const toggleActivity = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((item) => item !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What activities interest you?</h2>
        <p className="text-gray-600">Select all the experiences you'd like to have</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selected.includes(activity.id);
          
          return (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`p-4 rounded-xl border-2 transition-all relative ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${activity.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-gray-800 text-center">{activity.name}</div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-800">
          <span className="font-semibold">{selected.length} activities selected</span>
          {selected.length > 0 && ' - Great choices! More selections help us create a better itinerary.'}
        </p>
      </div>
    </div>
  );
}
