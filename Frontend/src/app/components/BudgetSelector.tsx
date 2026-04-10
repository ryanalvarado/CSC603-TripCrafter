import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetSelectorProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
}

const budgetRanges = [
  { label: 'Budget', min: 500, max: 1500, icon: TrendingDown, color: 'text-green-600' },
  { label: 'Moderate', min: 1500, max: 3500, icon: DollarSign, color: 'text-blue-600' },
  { label: 'Luxury', min: 3500, max: 10000, icon: TrendingUp, color: 'text-purple-600' },
];

export function BudgetSelector({ budget, onBudgetChange }: BudgetSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<number>(1);

  const handleRangeClick = (index: number, midpoint: number) => {
    setSelectedRange(index);
    onBudgetChange(midpoint);
  };

  const getCurrentRange = () => {
    if (budget < 1500) return budgetRanges[0];
    if (budget < 3500) return budgetRanges[1];
    return budgetRanges[2];
  };

  const currentRange = getCurrentRange();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-purple-600" />
          What's your budget per person?
        </h2>
        <p className="text-gray-600">Select a range or use the slider for precision</p>
      </div>

      {/* Quick Range Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {budgetRanges.map((range, index) => {
          const Icon = range.icon;
          const midpoint = (range.min + range.max) / 2;
          const isActive = budget >= range.min && budget <= range.max;
          
          return (
            <button
              key={range.label}
              onClick={() => handleRangeClick(index, midpoint)}
              className={`p-6 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-purple-600' : range.color}`} />
              <div className="font-bold text-gray-800 mb-1">{range.label}</div>
              <div className="text-sm text-gray-600">
                ${range.min.toLocaleString()} - ${range.max.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Fine-tune your budget:</span>
            <span className={`text-2xl font-bold ${currentRange.color}`}>
              ${budget.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>$500</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Budget Breakdown Preview */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Flights</div>
            <div className="font-bold text-gray-800">${Math.round(budget * 0.3).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Accommodation</div>
            <div className="font-bold text-gray-800">${Math.round(budget * 0.4).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Activities</div>
            <div className="font-bold text-gray-800">${Math.round(budget * 0.3).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
