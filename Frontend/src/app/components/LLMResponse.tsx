import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, DollarSign, Users, ArrowLeft, Clock, Star } from 'lucide-react';

interface TravelQuery {
  destination: string;
  tripType: string[];
  budget: number;
  duration: number;
  travelers: number;
  accommodation: string;
  activities: string[];
  travelStyle: string;
}

interface LLMResponseProps {
  query: TravelQuery;
  onReset: () => void;
}

export function LLMResponse({ query, onReset }: LLMResponseProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate AI generation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsGenerating(false), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Mock LLM response based on query
  const destinationNames: Record<string, string> = {
    paris: 'Paris',
    tokyo: 'Tokyo',
    bali: 'Bali',
    nyc: 'New York',
    rome: 'Rome',
    dubai: 'Dubai',
    barcelona: 'Barcelona',
    maldives: 'Maldives',
    london: 'London',
    santorini: 'Santorini',
    iceland: 'Iceland',
    sydney: 'Sydney',
  };

  const destinationName = destinationNames[query.destination] || 'Your Destination';

  const generateItinerary = () => {
    const days = [];
    for (let i = 1; i <= Math.min(query.duration, 7); i++) {
      days.push({
        day: i,
        activities: query.activities.slice(0, 3).map((act, idx) => ({
          time: idx === 0 ? 'Morning' : idx === 1 ? 'Afternoon' : 'Evening',
          activity: act.charAt(0).toUpperCase() + act.slice(1),
        })),
      });
    }
    return days;
  };

  const itinerary = generateItinerary();

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Perfect Trip</h2>
            <p className="text-gray-600 mb-6">Our AI is analyzing your preferences...</p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-500">{progress}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Start New Trip
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Your Personalized {destinationName} Adventure
                </h1>
                <p className="text-gray-600">
                  Based on your preferences, I've crafted the perfect itinerary for your {query.duration}-day journey.
                </p>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Destination</div>
                  <div className="font-semibold text-gray-800">{destinationName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-800">{query.duration} days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Travelers</div>
                  <div className="font-semibold text-gray-800">{query.travelers} {query.travelers === 1 ? 'person' : 'people'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Budget</div>
                  <div className="font-semibold text-gray-800">${query.budget.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ AI-Generated Insights</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">🎯 Perfect For You Because...</h3>
              <p className="text-blue-800">
                {destinationName} is ideal for {query.tripType.includes('beach') ? 'beach lovers' : query.tripType.includes('cultural') ? 'culture enthusiasts' : 'adventurers'} with a {query.travelStyle} pace. 
                With {query.travelers} {query.travelers === 1 ? 'traveler' : 'travelers'} and a budget of ${query.budget.toLocaleString()}, you'll experience the perfect balance of 
                {query.activities.includes('dining') ? ' exquisite dining,' : ''}
                {query.activities.includes('sightseeing') ? ' iconic landmarks,' : ''}
                {query.activities.includes('nature') ? ' breathtaking nature,' : ''} and relaxation.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">💡 Smart Recommendations</h3>
              <ul className="text-green-800 space-y-1">
                <li>• Book your {query.accommodation} at least 3 months in advance for best rates</li>
                <li>• {query.duration >= 7 ? 'Consider getting a local transportation pass to save money' : 'Focus on one or two neighborhoods to maximize your time'}</li>
                <li>• {query.budget > 3000 ? 'Splurge on at least one Michelin-starred restaurant experience' : 'Mix upscale experiences with local street food for authentic flavors'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 Your Day-by-Day Itinerary</h2>
          
          <div className="space-y-6">
            {itinerary.map((day) => (
              <div key={day.day} className="border-l-4 border-purple-500 pl-6 pb-6 last:pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Day {day.day}</h3>
                </div>
                
                <div className="space-y-3">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-purple-700 text-sm mb-1">{activity.time}</div>
                        <div className="text-gray-800">
                          {activity.time === 'Morning' && `Start your day with ${activity.activity.toLowerCase()} at local hotspots`}
                          {activity.time === 'Afternoon' && `Enjoy ${activity.activity.toLowerCase()} experiences in the city center`}
                          {activity.time === 'Evening' && `Wind down with ${activity.activity.toLowerCase()} and sunset views`}
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {query.duration > 7 && (
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600">
                  Days 8-{query.duration}: Continue exploring with flexible activities based on your energy and interests!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Estimated Budget Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <span className="font-semibold text-gray-800">Flights (Round Trip)</span>
              <span className="text-lg font-bold text-blue-700">${Math.round(query.budget * 0.3).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <span className="font-semibold text-gray-800">Accommodation ({query.duration} nights)</span>
              <span className="text-lg font-bold text-purple-700">${Math.round(query.budget * 0.4).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
              <span className="font-semibold text-gray-800">Activities & Experiences</span>
              <span className="text-lg font-bold text-pink-700">${Math.round(query.budget * 0.2).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <span className="font-semibold text-gray-800">Food & Dining</span>
              <span className="text-lg font-bold text-green-700">${Math.round(query.budget * 0.1).toLocaleString()}</span>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">Total Per Person</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${query.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={onReset}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Plan Another Trip
          </button>
        </div>
      </div>
    </div>
  );
}
