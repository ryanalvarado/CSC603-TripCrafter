import { Calendar, Users, Hotel, Home, Castle, Tent } from 'lucide-react';

interface TravelDetailsSelectorProps {
  duration: number;
  travelers: number;
  accommodation: string;
  onDurationChange: (duration: number) => void;
  onTravelersChange: (travelers: number) => void;
  onAccommodationChange: (accommodation: string) => void;
}

const accommodationTypes = [
  { id: 'hotel', name: 'Hotel', icon: Hotel, description: 'Full service & amenities' },
  { id: 'resort', name: 'Resort', icon: Castle, description: 'All-inclusive luxury' },
  { id: 'apartment', name: 'Apartment', icon: Home, description: 'Home away from home' },
  { id: 'hostel', name: 'Hostel/Budget', icon: Tent, description: 'Budget-friendly' },
];

const durationOptions = [3, 5, 7, 10, 14, 21];
const travelerOptions = [1, 2, 3, 4, 5, 6];

export function TravelDetailsSelector({
  duration,
  travelers,
  accommodation,
  onDurationChange,
  onTravelersChange,
  onAccommodationChange,
}: TravelDetailsSelectorProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Details</h2>
        <p className="text-gray-600">Customize the specifics of your journey</p>
      </div>

      {/* Duration */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">How long is your trip?</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          {durationOptions.map((days) => (
            <button
              key={days}
              onClick={() => onDurationChange(days)}
              className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all ${
                duration === days
                  ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105 shadow-md'
                  : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              {days} {days === 1 ? 'day' : 'days'}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Travelers */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">Number of travelers</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          {travelerOptions.map((count) => (
            <button
              key={count}
              onClick={() => onTravelersChange(count)}
              className={`w-16 h-16 rounded-xl border-2 font-bold text-lg transition-all ${
                travelers === count
                  ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105 shadow-md'
                  : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodation Type */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Hotel className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">Preferred accommodation</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {accommodationTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = accommodation === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => onAccommodationChange(type.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                <div className="font-semibold text-gray-800 text-sm mb-1">{type.name}</div>
                <div className="text-xs text-gray-600">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
