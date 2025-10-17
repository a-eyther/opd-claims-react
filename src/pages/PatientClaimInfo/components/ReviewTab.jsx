import { useEffect } from 'react'

/**
 * Review Tab Component
 * Displays final review with symptoms, diagnosis, adjudication details, and decision
 */
const ReviewTab = ({ reviewData = {}, onTotalsChange = null }) => {
  const { symptoms = [], diagnoses = [], invoices = [], financialSummary = {}, productRules = [], decision = {} } = reviewData

  // Notify parent when totals change - use financialSummary from API
  useEffect(() => {
    if (onTotalsChange && financialSummary) {
      onTotalsChange({
        totalApproved: financialSummary.totalApproved || 0,
        totalSavings: financialSummary.totalSavings || 0
      })
    }
  }, [financialSummary.totalApproved, financialSummary.totalSavings, onTotalsChange])

  return (
    <div className="space-y-6">
      {/* Symptoms & Diagnosis Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Symptoms & Diagnosis Summary</h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Symptoms */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Symptoms</h4>
            <ul className="space-y-1">
              {symptoms.map((symptom, index) => (
                <li key={index} className="text-xs text-gray-700 flex items-center gap-2">
                  <span>• {symptom.text}</span>
                  {symptom.tag && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">
                      {symptom.tag}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnoses */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Diagnoses</h4>
            <ul className="space-y-1">
              {diagnoses.map((diagnosis, index) => (
                <li key={index} className="text-xs text-gray-700 flex items-center gap-2">
                  <span>• {diagnosis.text}</span>
                  {diagnosis.code && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">
                      {diagnosis.code}
                    </span>
                  )}
                  {diagnosis.tag && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">
                      {diagnosis.tag}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Adjudication Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Adjudication Review</h3>

        {/* Invoice Tables */}
        <div className="space-y-6">
          {invoices.map((invoice, invoiceIndex) => (
            <div key={invoiceIndex}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{invoice.invoiceNumber} - Detailed Review</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Item Category</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Item Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Rate</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Preauth Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Invoiced Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Approved Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Savings</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Deduction Reasons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items?.map((item, itemIndex) => (
                      <tr key={itemIndex} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-gray-700">{item.category}</td>
                        <td className="px-3 py-3 text-gray-900">{item.name}</td>
                        <td className="px-3 py-3 text-gray-700">{item.qty}</td>
                        <td className="px-3 py-3 text-gray-700">KES {item.rate?.toLocaleString()}</td>
                        <td className="px-3 py-3 text-gray-700">KES {item.preauthAmount?.toLocaleString()}</td>
                        <td className="px-3 py-3 text-gray-700">KES {item.invoicedAmount?.toLocaleString()}</td>
                        <td className="px-3 py-3 text-orange-600 font-semibold">KES {item.approvedAmount?.toLocaleString()}</td>
                        <td className="px-3 py-3 text-green-600 font-semibold">KES {item.savings?.toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs ${
                            item.status === 'Approved' ? 'text-gray-700' :
                            item.status === 'Partially Approved' ? 'text-gray-700' :
                            'text-gray-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600 text-[11px]">{item.deductionReasons || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end gap-8 mt-3 text-xs">
                <div>
                  <span className="text-gray-600">Savings: </span>
                  <span className="font-semibold text-green-600">KES {invoice.totalSavings?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Invoiced: </span>
                  <span className="font-semibold text-gray-900">KES {invoice.totalInvoiced?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Financial Summary</h3>

        <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="text-[10px] text-gray-600 mb-1">Total Requested Amount</div>
            <div className="text-base font-bold text-gray-900">KES {financialSummary.totalRequested?.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="text-[10px] text-gray-600 mb-1">Total Invoiced Amount</div>
            <div className="text-base font-bold text-gray-900">KES {financialSummary.totalInvoiced?.toLocaleString()}</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="text-[10px] text-yellow-700 mb-1">Total Approved Amount</div>
            <div className="text-base font-bold text-yellow-700">KES {financialSummary.totalApproved?.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-[10px] text-green-700 mb-1">Total Savings Amount</div>
            <div className="text-base font-bold text-green-700">KES {financialSummary.totalSavings?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Product Rules Execution */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Product Rules Execution</h3>

        <div className="space-y-3">
          {productRules.map((rule, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                rule.status === 'success' ? 'bg-green-50 border-green-200' :
                rule.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                rule.status === 'success' ? 'bg-green-100' :
                rule.status === 'warning' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {rule.status === 'success' ? (
                  <span className="text-green-600 text-sm">✓</span>
                ) : rule.status === 'warning' ? (
                  <span className="text-yellow-600 text-sm">⚠</span>
                ) : (
                  <span className="text-gray-600 text-sm">i</span>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{rule.title}</div>
                <div className="text-xs text-gray-600 mt-1">{rule.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjudication Decision */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Adjudication Decision</h3>

        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          decision.status === 'partially-approved' ? 'bg-green-50 border-green-200' :
          decision.status === 'approved' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            decision.status === 'partially-approved' || decision.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className={`text-sm ${
              decision.status === 'partially-approved' || decision.status === 'approved' ? 'text-green-600' : 'text-red-600'
            }`}>
              ✓
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{decision.title}</div>
            <div className="text-xs text-gray-600 mt-1">{decision.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewTab
