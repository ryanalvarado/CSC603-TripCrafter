import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, DollarSign, Users, ArrowLeft, Clock, Star, AlertCircle, Globe, MessageCircle } from 'lucide-react';
import { generateItinerary, type TravelQuery, type ItineraryResponse } from '../../api';

interface LLMResponseProps {
  query: TravelQuery;
  onReset: () => void;
}

export function LLMResponse({ query, onReset }: LLMResponseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ItineraryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    generateItinerary(query)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [query]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Perfect Trip</h2>
            <p className="text-gray-600 mb-6">Our AI is crafting a personalized itinerary&hellip;</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={() => { setError(null); setIsLoading(true); generateItinerary(query).then(setData).catch((e) => setError(e.message)).finally(() => setIsLoading(false)); }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

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
                  Your Personalized {data.destination_name} Adventure
                </h1>
                <p className="text-gray-600">{data.summary}</p>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Destination</div>
                  <div className="font-semibold text-gray-800">{data.destination_name}</div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI-Generated Insights
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Perfect For You Because&hellip;
              </h3>
              <p className="text-blue-800">{data.insights.why_perfect}</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Smart Recommendations
              </h3>
              <ul className="text-green-800 space-y-1">
                {data.insights.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Cultural Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            Cultural Tips
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                Essential Phrases
              </h3>
              <div className="space-y-3">
                {data.cultural_tips.phrases.map((p, i) => (
                  <div key={i} className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-800">{p.phrase}</div>
                    <div className="text-sm text-gray-700">{p.meaning}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.context}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                Etiquette Tips
              </h3>
              <ul className="space-y-2">
                {data.cultural_tips.etiquette.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span className="text-gray-800">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Your Day-by-Day Itinerary
          </h2>

          <div className="space-y-6">
            {data.itinerary.map((day) => (
              <div key={day.day} className="border-l-4 border-purple-500 pl-6 pb-6 last:pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Day {day.day}: {day.title}</h3>
                </div>

                <div className="space-y-3">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-purple-700 text-sm mb-1">{activity.time}</div>
                        <div className="font-medium text-gray-800">{activity.activity}</div>
                        <div className="text-gray-600 text-sm mt-1">{activity.description}</div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            Estimated Budget Breakdown
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <span className="font-semibold text-gray-800">Flights (Round Trip)</span>
              <span className="text-lg font-bold text-blue-700">${data.budget_breakdown.flights.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <span className="font-semibold text-gray-800">Accommodation ({query.duration} nights)</span>
              <span className="text-lg font-bold text-purple-700">${data.budget_breakdown.accommodation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
              <span className="font-semibold text-gray-800">Activities & Experiences</span>
              <span className="text-lg font-bold text-pink-700">${data.budget_breakdown.activities.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <span className="font-semibold text-gray-800">Food & Dining</span>
              <span className="text-lg font-bold text-green-700">${data.budget_breakdown.food.toLocaleString()}</span>
            </div>

            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">Total Per Person</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${data.budget_breakdown.total.toLocaleString()}
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
