import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, DollarSign, Users, ArrowLeft, Clock, Star, AlertCircle, Globe, MessageCircle, Plane, Building2, CloudSun, Gift } from 'lucide-react';
import { generateItinerary, type TravelQuery, type ItineraryResponse } from '../../api';

interface LLMResponseProps {
  query: TravelQuery;
  onReset: () => void;
}

export function LLMResponse({ query, onReset }: LLMResponseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ItineraryResponse | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setProgress(0);

    generateItinerary(query)
      .then((res) => {
        if (!cancelled) {
          setProgress(100);
          setData(res);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) return current;
        const increment = current < 40 ? 8 : current < 75 ? 5 : 2;
        return Math.min(current + increment, 95);
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Perfect Trip</h2>
            <p className="text-gray-600 mb-6">Our AI is crafting a personalized itinerary&hellip;</p>
            <div className="text-sm font-semibold text-purple-700 mb-2">{progress}% complete</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
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
                onClick={() => { setError(null); setData(null); setProgress(0); setIsLoading(true); generateItinerary(query).then((res) => { setProgress(100); setData(res); }).catch((e) => setError(e.message)).finally(() => setIsLoading(false)); }}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
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
                  <div className="text-xs text-gray-600">Starts</div>
                  <div className="font-semibold text-gray-800">{query.startDate}</div>
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
                  <div className="text-xs text-gray-600">Total Budget</div>
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

        {/* Flight Recommendation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plane className="w-6 h-6 text-purple-600" />
            Flight Recommendation
          </h2>

          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{data.flight.airline}</h3>
                <p className="text-sm font-semibold text-blue-700 mt-1">{data.flight.trip_type}</p>
                <p className="text-gray-700 mt-1">{data.flight.route}</p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-2xl font-bold text-blue-700">${data.flight.estimated_cost.toLocaleString()}</div>
                <div className="text-sm text-gray-600">estimated round trip per traveler</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">From</div>
                <div className="font-semibold text-gray-800">{data.flight.origin_airport}</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">To</div>
                <div className="font-semibold text-gray-800">{data.flight.destination_airport}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">Outbound</div>
                <div className="font-semibold text-gray-800">{data.flight.flight_number}</div>
                <div className="text-sm text-gray-700">{data.flight.outbound_date}</div>
                <div className="text-sm text-gray-700">{data.flight.departure_time} - {data.flight.arrival_time}</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">Return</div>
                <div className="font-semibold text-gray-800">{data.flight.return_flight_number}</div>
                <div className="text-sm text-gray-700">{data.flight.return_date}</div>
                <div className="text-sm text-gray-700">{data.flight.return_departure_time} - {data.flight.return_arrival_time}</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">Duration</div>
                <div className="font-semibold text-gray-800">{data.flight.duration}</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xs text-gray-500">Stops</div>
                <div className="font-semibold text-gray-800">{data.flight.stops}</div>
              </div>
            </div>

            <p className="text-blue-900">{data.flight.why_recommended}</p>
            {data.flight.price_note && <p className="text-xs text-blue-800 mt-3">{data.flight.price_note}</p>}
          </div>
        </div>

        {/* Accommodation Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Accommodation Recommendations
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {data.accommodations.map((option, index) => (
              <div key={`${option.name}-${index}`} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{option.name}</h3>
                    <p className="text-sm text-purple-700 font-semibold">{option.type}</p>
                  </div>
                  {index === 0 && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      Best Fit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {option.neighborhood}
                </div>

                <div className="space-y-2 mb-4">
                  {option.highlights.map((highlight, i) => (
                    <div key={i} className="text-sm text-gray-700 flex gap-2">
                      <Star className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Nightly</span>
                    <span className="font-bold text-gray-800">${option.estimated_nightly_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600">Trip Total</span>
                    <span className="font-bold text-purple-700">${option.estimated_total_cost.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{option.why_recommended}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Souvenir Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Souvenir Recommendations
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {data.souvenirs.map((souvenir, index) => (
              <div key={`${souvenir.item}-${index}`} className="border border-gray-200 rounded-xl p-5 bg-orange-50">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-gray-800">{souvenir.item}</h3>
                  <span className="text-sm font-bold text-orange-700">
                    ${souvenir.estimated_cost_per_person.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700 mb-4">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>{souvenir.where_to_buy}</span>
                </div>
                <p className="text-sm text-gray-700">{souvenir.why_recommended}</p>
              </div>
            ))}
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Day {day.day}: {day.title}</h3>
                    {day.date && <div className="text-sm text-gray-500">{day.date}</div>}
                    {(day.weather || day.weather_note) && (
                      <div className="flex items-start gap-2 mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                        <CloudSun className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-blue-900">{day.weather}</div>
                          {day.weather_note && <div className="text-sm text-blue-800">{day.weather_note}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <div className="font-semibold text-purple-700 text-sm">{activity.time}</div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="text-xs font-bold uppercase text-purple-700">Activity</div>
                              <div className="text-sm font-semibold text-gray-700">
                                {activity.cost_per_person > 0 ? `$${activity.cost_per_person.toLocaleString()}` : 'Free'}
                              </div>
                            </div>
                            <div className="font-medium text-gray-800">{activity.activity}</div>
                            <div className="text-gray-600 text-sm mt-1">{activity.description}</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="text-xs font-bold uppercase text-green-700">Meal</div>
                              <div className="text-sm font-semibold text-gray-700">
                                {activity.meal_cost_per_person > 0 ? `$${activity.meal_cost_per_person.toLocaleString()}` : 'Included'}
                              </div>
                            </div>
                            <div className="font-medium text-gray-800">{activity.meal}</div>
                            <div className="text-gray-600 text-sm mt-1">{activity.meal_description}</div>
                          </div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            Estimated Budget Breakdown
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <span className="font-semibold text-gray-800">Flights (Round Trip Allocation)</span>
              <span className="text-lg font-bold text-blue-700">${data.budget_breakdown.flights.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <span className="font-semibold text-gray-800">Accommodation ({Math.max(query.duration - 1, 1)} nights)</span>
              <span className="text-lg font-bold text-purple-700">${data.budget_breakdown.accommodation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
              <span className="font-semibold text-gray-800">Activities & Experiences</span>
              <span className="text-lg font-bold text-pink-700">${data.budget_breakdown.activities.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
              <span className="font-semibold text-gray-800">Souvenirs & Gifts</span>
              <span className="text-lg font-bold text-orange-700">${data.budget_breakdown.souvenirs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <span className="font-semibold text-gray-800">Food & Dining</span>
              <span className="text-lg font-bold text-green-700">${data.budget_breakdown.food.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
              <span className="font-semibold text-gray-800">Local Transportation</span>
              <span className="text-lg font-bold text-amber-700">${data.budget_breakdown.local_transport.toLocaleString()}</span>
            </div>

            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xl font-bold text-gray-800">Total Per Person</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${data.budget_breakdown.total.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-lg font-semibold text-gray-700">Total Trip Cost</span>
                <span className="text-xl font-bold text-gray-900">
                  ${data.budget_breakdown.total_all_travelers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-lg font-semibold text-gray-700">Remaining Amount</span>
                <span className="text-xl font-bold text-green-700">
                  ${data.budget_breakdown.remaining_amount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-4">{data.budget_breakdown.cost_basis}</p>
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
