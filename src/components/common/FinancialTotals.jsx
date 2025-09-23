import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const FinancialTotals = ({ 
  totalExtractedAmount = 0,
  totalRequestedAmount = 0, 
  totalAllowedAmount = 0,
  totalApprovedAmount = 0,
  finalExtractedAmount = 0,
  showDetailed = true,
  className = ""
}) => {
  // Ensure all amounts are numbers and handle null/undefined cases
  const safeExtracted = Number(totalExtractedAmount) || 0;
  const safeRequested = Number(totalRequestedAmount) || 0;
  const safeAllowed = Number(totalAllowedAmount) || 0;
  const safeApproved = Number(totalApprovedAmount) || 0;
  const safeFinalExtracted = Number(finalExtractedAmount) || 0;
  // Calculate key metrics using safe values
  const totalSavings = safeRequested - safeApproved;
  const savingsPercentage = safeRequested > 0 ? 
    ((totalSavings / safeRequested) * 100).toFixed(1) : '0.0';
  
  const extractionAccuracy = safeExtracted > 0 ? 
    ((Math.min(safeExtracted, safeRequested) / safeExtracted) * 100).toFixed(1) : '100.0';

  const aiVsManualDiff = Math.abs(safeExtracted - safeFinalExtracted);
  const hasManualChanges = aiVsManualDiff > 0.01; // More than 1 cent difference

  const financialCards = [
    {
      title: "AI Extracted",
      amount: safeExtracted,
      icon: <DollarSign size={16} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Amount extracted by AI from documents"
    },
    {
      title: "Requested",
      amount: safeRequested,
      icon: <TrendingUp size={16} />,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Total amount claimed by provider"
    },
    {
      title: "Pre-Approved", 
      amount: safeAllowed,
      icon: <CheckCircle size={16} />,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      borderColor: "border-green-200",
      description: "Amount allowed by policy rules"
    },
    {
      title: "Final Approved",
      amount: safeApproved,
      icon: <CheckCircle size={16} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200", 
      description: "Final approved amount after review"
    }
  ];

  if (showDetailed) {
    financialCards.push({
      title: "Editor Final",
      amount: safeFinalExtracted,
      icon: hasManualChanges ? <AlertTriangle size={16} /> : <CheckCircle size={16} />,
      color: hasManualChanges ? "text-orange-600" : "text-teal-600",
      bgColor: hasManualChanges ? "bg-orange-50" : "bg-teal-50",
      borderColor: hasManualChanges ? "border-orange-200" : "border-teal-200",
      description: "Amount after manual editor changes"
    });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Financial Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {financialCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} ${card.borderColor} border rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <div className={`${card.color}`}>
                {card.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">
                {card.title}
              </span>
            </div>
            <div className="space-y-1">
              <p className={`text-lg font-bold ${card.color}`}>
                {formatCurrency(card.amount)}
              </p>
              {showDetailed && (
                <p className="text-xs text-gray-500 leading-tight">
                  {card.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Savings */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-green-600" size={18} />
            <span className="text-xs font-medium text-green-800">Total Savings</span>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(totalSavings)}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-sm text-green-600">{savingsPercentage}%</span>
              <span className="text-xs text-green-600">saved from request</span>
            </div>
          </div>
        </div>

        {/* AI Extraction Accuracy */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-blue-600" size={18} />
            <span className="text-xs font-medium text-blue-800">AI Accuracy</span>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-blue-700">
              {extractionAccuracy}%
            </p>
            <span className="text-xs text-blue-600">extraction accuracy</span>
          </div>
        </div>

        {/* Manual Changes Indicator */}
        <div className={`bg-gradient-to-r ${hasManualChanges ? 'from-orange-50 to-yellow-50 border-orange-200' : 'from-teal-50 to-green-50 border-teal-200'} border rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            {hasManualChanges ? (
              <AlertTriangle className="text-orange-600" size={18} />
            ) : (
              <CheckCircle className="text-teal-600" size={18} />
            )}
            <span className={`text-xs font-medium ${hasManualChanges ? 'text-orange-800' : 'text-teal-800'}`}>
              Manual Changes
            </span>
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-bold ${hasManualChanges ? 'text-orange-700' : 'text-teal-700'}`}>
              {hasManualChanges ? formatCurrency(aiVsManualDiff) : 'None'}
            </p>
            <span className={`text-xs ${hasManualChanges ? 'text-orange-600' : 'text-teal-600'}`}>
              {hasManualChanges ? 'from AI extraction' : 'AI extraction accurate'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown (if requested) */}
      {showDetailed && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Financial Flow Summary</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Initial AI Extraction:</span>
              <span className="font-medium">{formatCurrency(safeExtracted)}</span>
            </div>
            <div className="flex justify-between">
              <span>Provider Request:</span>
              <span className="font-medium">{formatCurrency(safeRequested)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Pre-Policy Allowance:</span>
              <span className="font-medium">{formatCurrency(safeAllowed)}</span>
            </div>
            <div className="flex justify-between">
              <span>Final Manual Review:</span>
              <span className="font-medium">{formatCurrency(safeFinalExtracted)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>System Approved:</span>
              <span className="text-yellow-700">{formatCurrency(safeApproved)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTotals;