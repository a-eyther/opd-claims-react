import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  searchDiagnoses,
  selectDiagnosisResults,
  selectDiagnosisLoading,
  selectSelectedDiagnoses,
  addSelectedDiagnosis,
  removeSelectedDiagnosis,
  clearResults as clearDiagnosisResults
} from '../../../store/slices/diagnosisSlice'
import {
  searchSymptoms,
  selectSymptomsResults,
  selectSymptomsLoading,
  selectSelectedSymptoms,
  addSelectedSymptom,
  removeSelectedSymptom,
  clearResults as clearSymptomsResults
} from '../../../store/slices/symptomsSlice'

/**
 * Digitisation Tab Component
 * Displays symptoms, diagnosis selection and invoice item tables
 */
const DigitisationTab = ({ digitisationData = {} }) => {
  const dispatch = useDispatch()
  const { symptomsByLCT = [], diagnosisByLCT = [], invoices: initialInvoices = [] } = digitisationData

  // Redux state
  const diagnosisResults = useSelector(selectDiagnosisResults)
  const loadingDiagnoses = useSelector(selectDiagnosisLoading)
  const selectedDiagnoses = useSelector(selectSelectedDiagnoses)
  const symptomsResults = useSelector(selectSymptomsResults)
  const loadingSymptoms = useSelector(selectSymptomsLoading)
  const selectedSymptoms = useSelector(selectSelectedSymptoms)

  // Local state
  const [symptomSearch, setSymptomSearch] = useState('')
  const [diagnosisSearch, setDiagnosisSearch] = useState('')
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false)
  const [showSymptomsDropdown, setShowSymptomsDropdown] = useState(false)
  const [invoices, setInvoices] = useState(initialInvoices)
  const [invalidReasonBoxIndex, setInvalidReasonBoxIndex] = useState(null)
  const [invalidReasons, setInvalidReasons] = useState({})
  const [validatedInvoices, setValidatedInvoices] = useState({})

  const debounceTimerDiagnosis = useRef(null)
  const debounceTimerSymptoms = useRef(null)
  const diagnosisDropdownRef = useRef(null)
  const symptomsDropdownRef = useRef(null)

  const handleRemoveSymptom = (symptom) => {
    dispatch(removeSelectedSymptom(symptom))
  }

  const handleRemoveDiagnosis = (diagnosis) => {
    dispatch(removeSelectedDiagnosis(diagnosis))
  }

  // Debounced search handler for symptoms
  const handleSymptomsSearchChange = (value) => {
    setSymptomSearch(value)

    // Clear existing timer
    if (debounceTimerSymptoms.current) {
      clearTimeout(debounceTimerSymptoms.current)
    }

    // Set new timer for debouncing (500ms delay)
    debounceTimerSymptoms.current = setTimeout(() => {
      if (value && value.length >= 2) {
        dispatch(searchSymptoms({ query: value, page: 1, pageSize: 10 }))
        setShowSymptomsDropdown(true)
      } else {
        dispatch(clearSymptomsResults())
        setShowSymptomsDropdown(false)
      }
    }, 500)
  }

  // Debounced search handler for diagnosis
  const handleDiagnosisSearchChange = (value) => {
    setDiagnosisSearch(value)

    // Clear existing timer
    if (debounceTimerDiagnosis.current) {
      clearTimeout(debounceTimerDiagnosis.current)
    }

    // Set new timer for debouncing (500ms delay)
    debounceTimerDiagnosis.current = setTimeout(() => {
      if (value && value.length >= 2) {
        dispatch(searchDiagnoses({ query: value, page: 1, pageSize: 10 }))
        setShowDiagnosisDropdown(true)
      } else {
        dispatch(clearDiagnosisResults())
        setShowDiagnosisDropdown(false)
      }
    }, 500)
  }

  // Handle symptom selection from dropdown
  const handleSelectSymptom = (symptom) => {
    const symptomText = symptom.text || symptom.name || symptom.description
    dispatch(addSelectedSymptom(symptomText))
    setSymptomSearch('')
    setShowSymptomsDropdown(false)
  }

  // Handle diagnosis selection from dropdown
  const handleSelectDiagnosis = (diagnosis) => {
    // Normalize the diagnosis structure
    const normalizedDiagnosis = {
      text: diagnosis.text || diagnosis.name || diagnosis.description,
      code: diagnosis.code || diagnosis.icd_code
    }
    dispatch(addSelectedDiagnosis(normalizedDiagnosis))
    setDiagnosisSearch('')
    setShowDiagnosisDropdown(false)
  }

  // Initialize selected diagnoses from props
  useEffect(() => {
    if (diagnosisByLCT && diagnosisByLCT.length > 0) {
      diagnosisByLCT.forEach(diagnosis => {
        dispatch(addSelectedDiagnosis(diagnosis))
      })
    }
  }, [diagnosisByLCT, dispatch])

  // Initialize selected symptoms from props
  useEffect(() => {
    if (symptomsByLCT && symptomsByLCT.length > 0) {
      symptomsByLCT.forEach(symptom => {
        dispatch(addSelectedSymptom(symptom))
      })
    }
  }, [symptomsByLCT, dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (diagnosisDropdownRef.current && !diagnosisDropdownRef.current.contains(event.target)) {
        setShowDiagnosisDropdown(false)
      }
      if (symptomsDropdownRef.current && !symptomsDropdownRef.current.contains(event.target)) {
        setShowSymptomsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (debounceTimerDiagnosis.current) {
        clearTimeout(debounceTimerDiagnosis.current)
      }
      if (debounceTimerSymptoms.current) {
        clearTimeout(debounceTimerSymptoms.current)
      }
    }
  }, [])

  const handleItemChange = (invoiceIndex, itemIndex, field, value) => {
    const updatedInvoices = [...invoices]
    updatedInvoices[invoiceIndex].items[itemIndex][field] = value
    setInvoices(updatedInvoices)
  }

  const handleDeleteItem = (invoiceIndex, itemIndex) => {
    const updatedInvoices = [...invoices]
    updatedInvoices[invoiceIndex].items.splice(itemIndex, 1)
    setInvoices(updatedInvoices)
  }

  const handleAddItem = (invoiceIndex) => {
    const updatedInvoices = [...invoices]
    const newItem = {
      date: '',
      category: 'Consultation',
      item: '',
      qty: 1,
      unit: 0,
      amount: 0,
      preauth: 0
    }
    updatedInvoices[invoiceIndex].items.push(newItem)
    setInvoices(updatedInvoices)
  }

  const handleInvalidClick = (invoiceIndex) => {
    setInvalidReasonBoxIndex(invoiceIndex)
  }

  const handleCancelInvalid = () => {
    setInvalidReasonBoxIndex(null)
  }

  const handleConfirmInvalid = (invoiceIndex) => {
    // Save the invalid reason
    setInvalidReasonBoxIndex(null)
  }

  const handleInvalidReasonChange = (invoiceIndex, value) => {
    setInvalidReasons({
      ...invalidReasons,
      [invoiceIndex]: value
    })
  }

  const handleValidClick = (invoiceIndex) => {
    setValidatedInvoices({
      ...validatedInvoices,
      [invoiceIndex]: true
    })
  }

  const handleUndoValid = (invoiceIndex) => {
    const updated = { ...validatedInvoices }
    delete updated[invoiceIndex]
    setValidatedInvoices(updated)
  }

  return (
    <div className="space-y-6">
      {/* Symptoms Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Symptoms by LCT</h3>
        <div className="flex gap-2 mb-4">
          {symptomsByLCT.map((symptom, index) => (
            <button
              key={index}
              className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
            >
              {symptom}
            </button>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Select Symptoms</h4>
        <div className="relative mb-3" ref={symptomsDropdownRef}>
          <input
            type="text"
            value={symptomSearch}
            onChange={(e) => handleSymptomsSearchChange(e.target.value)}
            onFocus={() => symptomSearch.length >= 2 && setShowSymptomsDropdown(true)}
            placeholder="Search symptoms..."
            className="w-full px-3 py-2 border border-gray-300 text-black rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            {loadingSymptoms ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '🔍'}
          </span>

          {/* Dropdown with results */}
          {showSymptomsDropdown && symptomsResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {symptomsResults.map((symptom, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSymptom(symptom)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900">{symptom.text || symptom.name || symptom.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSymptomsDropdown && !loadingSymptoms && symptomsResults.length === 0 && symptomSearch.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm text-gray-500 text-center">
              No symptoms found
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedSymptoms.map((symptom, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-sm text-gray-900"
            >
              <span>{symptom}</span>
              <button
                onClick={() => handleRemoveSymptom(symptom)}
                className="text-red-500 hover:text-red-700 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Diagnosis by LCT</h3>
        <div className="flex gap-2 mb-4">
          {diagnosisByLCT.map((diagnosis, index) => (
            <button
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
            >
              <span>{diagnosis.text}</span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px]">
                {diagnosis.code}
              </span>
            </button>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Select Diagnosis</h4>
        <div className="relative mb-3" ref={diagnosisDropdownRef}>
          <input
            type="text"
            value={diagnosisSearch}
            onChange={(e) => handleDiagnosisSearchChange(e.target.value)}
            onFocus={() => diagnosisSearch.length >= 2 && setShowDiagnosisDropdown(true)}
            placeholder="Search Diagnosis..."
            className="w-full px-3 py-2 border border-gray-300 text-black rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            {loadingDiagnoses ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '🔍'}
          </span>

          {/* Dropdown with results */}
          {showDiagnosisDropdown && diagnosisResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {diagnosisResults.map((diagnosis, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectDiagnosis(diagnosis)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900">{diagnosis.text || diagnosis.name || diagnosis.description}</span>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] ml-2">
                    {diagnosis.code || diagnosis.icd_code}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDiagnosisDropdown && !loadingDiagnoses && diagnosisResults.length === 0 && diagnosisSearch.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm text-gray-500 text-center">
              No diagnoses found
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedDiagnoses.map((diagnosis, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-sm text-gray-900"
            >
              <span>{diagnosis.text}</span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px]">{diagnosis.code}</span>
              <button
                onClick={() => handleRemoveDiagnosis(diagnosis)}
                className="text-red-500 hover:text-red-700 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Total Invoices Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">(3) Total Invoices</h3>
        <div className="flex gap-4 text-xs">
          <span className="text-green-600">0 Valid</span>
          <span className="text-red-600">0 Invalid</span>
          <span className="text-yellow-600">3 Pending</span>
        </div>
      </div>

      {/* Invoice Tables */}
      <div className="space-y-6">
        {invoices.map((invoice, invoiceIndex) => (
          <div key={invoiceIndex} className="bg-white border border-gray-200 rounded-lg p-5">
            {/* Invoice Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 border border-gray-300 text-black rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>{invoice.invoiceNumber}</option>
                </select>
                {validatedInvoices[invoiceIndex] && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded text-xs font-medium">
                    Valid
                  </span>
                )}
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Show This Invoice
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">DATE</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">CATEGORY</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">ITEM</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">QTY</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">UNIT</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">AMOUNT</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">PREAUTH</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">DEL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-black">
                  {invoice.items?.map((item, itemIndex) => (
                    <tr key={itemIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'date', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'category', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option>Consultation</option>
                          <option>Treatment</option>
                          <option>Imaging</option>
                          <option>Laboratory</option>
                          <option>Pharmacy</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'item', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'qty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.unit}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'amount', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.preauth}
                          onChange={(e) => handleItemChange(invoiceIndex, itemIndex, 'preauth', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleDeleteItem(invoiceIndex, itemIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => handleAddItem(invoiceIndex)}
              className="mt-3 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Item
            </button>

            {/* Invoice Footer */}
            <div className="flex justify-end gap-8 mt-4 text-xs">
              <div>
                <span className="text-gray-600">Savings: </span>
                <span className="font-semibold text-gray-900">Kes. {invoice.savings}</span>
              </div>
              <div>
                <span className="text-gray-600">Invoiced: </span>
                <span className="font-semibold text-gray-900">Kes. {invoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Invalid Reason Box */}
            {invalidReasonBoxIndex === invoiceIndex && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">INVALID REASON</h4>
                <input
                  type="text"
                  value={invalidReasons[invoiceIndex] || ''}
                  onChange={(e) => handleInvalidReasonChange(invoiceIndex, e.target.value)}
                  placeholder="Enter reason for marking this invoice as invalid..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelInvalid}
                    className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmInvalid(invoiceIndex)}
                    className="px-4 py-2 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Confirm Invalid
                  </button>
                </div>
              </div>
            )}

            {/* Validation Badges */}
            <div className="flex justify-end gap-2 mt-3">
              {validatedInvoices[invoiceIndex] ? (
                <>
                  <span className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium">
                    Valid
                  </span>
                  <button
                    onClick={() => handleUndoValid(invoiceIndex)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600"
                  >
                    Undo
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleInvalidClick(invoiceIndex)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                  >
                    Invalid
                  </button>
                  <button
                    onClick={() => handleValidClick(invoiceIndex)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
                  >
                    Valid
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DigitisationTab
