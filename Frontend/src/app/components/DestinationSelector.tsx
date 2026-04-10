import { MapPin } from 'lucide-react';

interface DestinationSelectorProps {
  selected: string;
  onSelect: (destination: string) => void;
}

const destinations = [
  { id: 'paris', name: 'Paris', country: 'France', emoji: '🗼', color: 'from-pink-400 to-rose-400' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', emoji: '🗾', color: 'from-red-400 to-orange-400' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', emoji: '🏝️', color: 'from-green-400 to-teal-400' },
  { id: 'nyc', name: 'New York', country: 'USA', emoji: '🗽', color: 'from-blue-400 to-indigo-400' },
  { id: 'rome', name: 'Rome', country: 'Italy', emoji: '🏛️', color: 'from-amber-400 to-yellow-400' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', emoji: '🏙️', color: 'from-purple-400 to-pink-400' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', emoji: '🏖️', color: 'from-orange-400 to-red-400' },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', emoji: '🏖️', color: 'from-cyan-400 to-blue-400' },
  { id: 'london', name: 'London', country: 'UK', emoji: '🎡', color: 'from-slate-400 to-gray-400' },
  { id: 'santorini', name: 'Santorini', country: 'Greece', emoji: '🌅', color: 'from-blue-500 to-indigo-500' },
  { id: 'iceland', name: 'Iceland', country: 'Iceland', emoji: '🌋', color: 'from-teal-400 to-cyan-400' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', emoji: '🦘', color: 'from-yellow-400 to-orange-400' },
];

export function DestinationSelector({ selected, onSelect }: DestinationSelectorProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-purple-600" />
          Where do you want to go?
        </h2>
        <p className="text-gray-600">Select your dream destination</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.map((destination) => (
          <button
            key={destination.id}
            onClick={() => onSelect(destination.id)}
            className={`group relative p-6 rounded-xl transition-all ${
              selected === destination.id
                ? 'ring-4 ring-purple-500 scale-105 shadow-lg'
                : 'hover:scale-105 hover:shadow-md'
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${destination.color} opacity-10 group-hover:opacity-20 rounded-xl transition-opacity`}
            />
            <div className="relative">
              <div className="text-4xl mb-2">{destination.emoji}</div>
              <div className="font-bold text-gray-800">{destination.name}</div>
              <div className="text-sm text-gray-600">{destination.country}</div>
            </div>
            {selected === destination.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
