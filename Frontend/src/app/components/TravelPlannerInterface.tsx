import { useState } from 'react';
import { DestinationSelector } from './DestinationSelector';
import { PreferencesSelector } from './PreferencesSelector';
import { BudgetSelector } from './BudgetSelector';
import { TravelDetailsSelector } from './TravelDetailsSelector';
import { ActivitySelector } from './ActivitySelector';
import { LLMResponse } from './LLMResponse';
import { Plane, Sparkles } from 'lucide-react';

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

export function TravelPlannerInterface() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [query, setQuery] = useState<TravelQuery>({
    destination: '',
    tripType: [],
    budget: 2000,
    duration: 7,
    travelers: 2,
    accommodation: 'hotel',
    activities: [],
    travelStyle: 'balanced',
  });

  const updateQuery = (updates: Partial<TravelQuery>) => {
    setQuery(prev => ({ ...prev, ...updates }));
  };

  const handleGenerateRecommendations = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowResults(false);
    setQuery({
      destination: '',
      tripType: [],
      budget: 2000,
      duration: 7,
      travelers: 2,
      accommodation: 'hotel',
      activities: [],
      travelStyle: 'balanced',
    });
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return query.destination !== '';
      case 2:
        return query.tripType.length > 0;
      case 3:
        return true; // Budget always has a default
      case 4:
        return true; // Travel details always have defaults
      case 5:
        return query.activities.length > 0;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  if (showResults) {
    return <LLMResponse query={query} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Plane className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Visual Travel Planner
            </h1>
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>
          <p className="text-gray-600">
            Build your perfect trip using visual selections - no typing required!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step
                        ? 'bg-purple-600 text-white scale-110'
                        : isStepComplete(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </button>
                  <span className="text-xs mt-1 text-gray-600 text-center">
                    {step === 1 && 'Destination'}
                    {step === 2 && 'Type'}
                    {step === 3 && 'Budget'}
                    {step === 4 && 'Details'}
                    {step === 5 && 'Activities'}
                  </span>
                </div>
                {step < 5 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      isStepComplete(step) ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {currentStep === 1 && (
            <DestinationSelector
              selected={query.destination}
              onSelect={(destination) => updateQuery({ destination })}
            />
          )}
          {currentStep === 2 && (
            <PreferencesSelector
              selected={query.tripType}
              onSelect={(tripType) => updateQuery({ tripType })}
              travelStyle={query.travelStyle}
              onStyleChange={(travelStyle) => updateQuery({ travelStyle })}
            />
          )}
          {currentStep === 3 && (
            <BudgetSelector
              budget={query.budget}
              onBudgetChange={(budget) => updateQuery({ budget })}
            />
          )}
          {currentStep === 4 && (
            <TravelDetailsSelector
              duration={query.duration}
              travelers={query.travelers}
              accommodation={query.accommodation}
              onDurationChange={(duration) => updateQuery({ duration })}
              onTravelersChange={(travelers) => updateQuery({ travelers })}
              onAccommodationChange={(accommodation) => updateQuery({ accommodation })}
            />
          )}
          {currentStep === 5 && (
            <ActivitySelector
              selected={query.activities}
              onSelect={(activities) => updateQuery({ activities })}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerateRecommendations}
              disabled={!canProceed}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
