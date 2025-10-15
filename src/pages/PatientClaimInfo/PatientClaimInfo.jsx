import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ClaimHeader from './components/ClaimHeader'
import TabNavigation from './components/TabNavigation'
import DocumentViewer from '../../components/common/DocumentViewer'
import PatientDetails from './components/PatientDetails'
import ClaimDetails from './components/ClaimDetails'
import PolicyDetails from './components/PolicyDetails'
import DigitisationTab from './components/DigitisationTab'
import ChecklistTab from './components/ChecklistTab'
import ClinicalValidationTab from './components/ClinicalValidationTab'
import ReviewTab from './components/ReviewTab'
import ActionBar from './components/ActionBar'
import QueryManagementModal from '../../components/modals/QueryManagementModal'
import { getClaimDetailsById } from '../../constants/mockData'
import claimsService from '../../services/claimsService'
import { transformClaimExtractionData, transformAdjudicationData } from '../../utils/transformClaimData'
import { buildExtractionPatchPayload } from '../../utils/buildExtractionPatchPayload'

/**
 * Patient Claim Info Page
 * Full-page view without sidebar for detailed claim information
 */
const PatientClaimInfo = () => {
  const { claimId } = useParams()
  const navigate = useNavigate()

  // Get selected symptoms and diagnoses from Redux store
  const selectedSymptoms = useSelector(state => state.symptoms?.selectedSymptoms || [])
  const selectedDiagnoses = useSelector(state => state.diagnosis?.selectedDiagnoses || [])

  const [activeTab, setActiveTab] = useState('patient-info')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [timerStarted, setTimerStarted] = useState(() => {
    // Check if timer was already started for this claim
    const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
    return savedTimers[claimId] !== undefined
  })
  const [timeRemaining, setTimeRemaining] = useState(() => {
    // Try to get saved timer value for this claim
    const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
    return savedTimers[claimId] !== undefined ? savedTimers[claimId] : 180
  })
  const [claimData, setClaimData] = useState(null)
  const [invoices, setInvoices] = useState([]) //  Added invoices state
  const [validatedInvoices, setValidatedInvoices] = useState({}) // Track validated invoices
  const [invalidInvoices, setInvalidInvoices] = useState({}) // Track invalid invoices
  const [originalInvoiceKey, setOriginalInvoiceKey] = useState('invoices') // Store original invoice key from API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clinicalLoading, setClinicalLoading] = useState(false)
  const [clinicalError, setClinicalError] = useState(null)
  const [rawApiResponse, setRawApiResponse] = useState(null)
  const [rawExtractionResponse, setRawExtractionResponse] = useState(null)
  const [clinicalSaveFunction, setClinicalSaveFunction] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [isChecklistTabLocked, setIsChecklistTabLocked] = useState(true)
  const [isClinicalTabLocked, setIsClinicalTabLocked] = useState(true)
  const [isReviewTabLocked, setIsReviewTabLocked] = useState(true)

  // Fetch claim extraction data from API
  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await claimsService.getClaimExtractionData(claimId)

        // Store raw extraction response separately for digitisation tab
        setRawExtractionResponse(response)
        // Also store in rawApiResponse for backward compatibility
        setRawApiResponse(response)

        const transformedData = transformClaimExtractionData(response)

        if (transformedData) {
          setClaimData(transformedData)
          // set invoices state after data load
          setInvoices(transformedData?.digitisationData?.invoices || [])

          // Extract and store the original invoice key from the API response
          const outputData = response?.data?.output_data
          if (outputData) {
            const invoiceKey = Object.keys(outputData).find(key =>
              key === 'invoices' || key.includes('invoice')
            )
            if (invoiceKey) {
              setOriginalInvoiceKey(invoiceKey)
            }
          }
        } else {
          console.warn('Transformation failed, using mock data')
          setClaimData(getClaimDetailsById(claimId) || {})
        }
      } catch (err) {
        console.error('Error fetching claim data:', err)
        setError(err.message || 'Failed to load claim data')

        console.warn('API call failed, using mock data')
        // setClaimData(getClaimDetailsById(claimId) || {})
      } finally {
        setLoading(false)
      }
    }

    if (claimId) {
      fetchClaimData()
    }
  }, [claimId])

  // Fetch adjudication data when Clinical Validation tab opens
  useEffect(() => {
    console.log('Clinical validation useEffect triggered. activeTab:', activeTab, 'claimId:', claimId)

    const fetchClinicalData = async () => {
      if (activeTab !== 'clinical' || !claimId) {
        console.log('Skipping clinical data fetch. activeTab:', activeTab, 'claimId:', claimId)
        return
      }

      console.log('Starting clinical data fetch...')

      try {
        setClinicalLoading(true)
        setClinicalError(null)

        let response = null

        // Step 1: Try to get manual adjudication first, fallback to AI if not found
        console.log('Fetching manual adjudication...')
        try {
          response = await claimsService.getManualAdjudication(claimId)
          console.log('Manual adjudication response:', response)
        } catch (manualErr) {
          console.log('Manual adjudication not found, fetching AI adjudication...')
          response = await claimsService.getAIAdjudication(claimId)
          console.log('AI adjudication response:', response)
        }

        // Store the adjudication response for later use
        setRawApiResponse(response)

        const transformedData = transformAdjudicationData(response)

        if (transformedData) {
          // Update only the clinical validation data
          setClaimData(prevData => ({
            ...prevData,
            clinicalValidationInvoices: transformedData.clinicalValidationInvoices,
            financials: transformedData.financials
          }))
        }

        // Step 2: Trigger re-adjudication after initial data is loaded
        try {
          console.log('Calling re-adjudicate API for claimId:', claimId)
          const rerunResponse = await claimsService.reAdjudicate(claimId)
          console.log('Re-adjudication API response:', rerunResponse)
          console.log('Re-adjudication triggered successfully')

          // Step 3: Fetch updated AI adjudication data after rerun
          console.log('Fetching updated AI adjudication after rerun...')
          const updatedAiResponse = await claimsService.getAIAdjudication(claimId)
          console.log('Updated AI adjudication response:', updatedAiResponse)
          setRawApiResponse(updatedAiResponse)

          const updatedTransformedData = transformAdjudicationData(updatedAiResponse)
          if (updatedTransformedData) {
            setClaimData(prevData => ({
              ...prevData,
              clinicalValidationInvoices: updatedTransformedData.clinicalValidationInvoices,
              financials: updatedTransformedData.financials
            }))
            console.log('Clinical validation data updated with rerun results')
          }
        } catch (rerunErr) {
          console.error('Re-adjudication or AI fetch after rerun failed:', rerunErr)
          console.error('Error details:', {
            message: rerunErr.message,
            response: rerunErr.response?.data,
            status: rerunErr.response?.status
          })
          // Continue with existing data if rerun fails
        }
      } catch (err) {
        console.error('Error fetching clinical validation data:', err)
        // If all API calls fail, try AI adjudication as fallback
        try {
          const aiResponse = await claimsService.getAIAdjudication(claimId)

          setRawApiResponse(aiResponse)
          const transformedData = transformAdjudicationData(aiResponse)

          if (transformedData) {
            setClaimData(prevData => ({
              ...prevData,
              clinicalValidationInvoices: transformedData.clinicalValidationInvoices,
              financials: transformedData.financials
            }))
          }
        } catch (fallbackErr) {
          console.error('Error fetching AI adjudication fallback:', fallbackErr)
          // Both APIs failed, set error state
          setClinicalError('Details not found')
        }
      } finally {
        setClinicalLoading(false)
      }
    }

    fetchClinicalData()
  }, [activeTab, claimId])

  // Fetch adjudication data when Review tab opens
  useEffect(() => {
    const fetchReviewData = async () => {
      if (activeTab !== 'review' || !claimId) return

      try {
        setReviewLoading(true)

        // Try to get manual adjudication first
        let response = await claimsService.getManualAdjudication(claimId)

        // If manual adjudication fails, fetch AI adjudication
        if (!response.success) {
          response = await claimsService.getAIAdjudication(claimId)
        }

        if (response?.data?.adjudication_response) {
          const adjudicationResponse = response.data.adjudication_response

          // Transform adjudication response to review format
          const reviewData = transformAdjudicationToReview(adjudicationResponse, selectedSymptoms, selectedDiagnoses)

          // Update review data
          setClaimData(prevData => ({
            ...prevData,
            reviewData: reviewData
          }))
        }
      } catch (err) {
        console.error('Error fetching review data:', err)
        // Keep existing data on error
      } finally {
        setReviewLoading(false)
      }
    }

    fetchReviewData()
  }, [activeTab, claimId, selectedSymptoms, selectedDiagnoses])

  // Helper function to transform adjudication response to review format
  const transformAdjudicationToReview = (adjudicationResponse, userSelectedSymptoms, userSelectedDiagnoses) => {
    const billingData = adjudicationResponse.billing_data || []

    // Group by invoice
    const invoiceMap = {}
    billingData.forEach(item => {
      const invoiceNumber = item.invoice_number || 'UNKNOWN'
      if (!invoiceMap[invoiceNumber]) {
        invoiceMap[invoiceNumber] = {
          invoiceNumber,
          items: [],
          totalSavings: 0,
          totalInvoiced: 0
        }
      }

      const approvedQty = item.approved_quantity !== undefined && item.approved_quantity !== null
        ? item.approved_quantity
        : item.quantity || 0

      const invoicedAmount = item.request_amount || 0
      const qty = item.quantity || 1
      const calculatedRate = qty > 0 ? invoicedAmount / qty : 0

      invoiceMap[invoiceNumber].items.push({
        category: item.item_category || '',
        name: item.item_name || '',
        qty: approvedQty,
        rate: calculatedRate,
        preauthAmount: item.tariff_amount || 0,
        invoicedAmount: invoicedAmount,
        approvedAmount: item.approved_amount || 0,
        savings: item.savings || 0,
        status: item.approved_amount > 0 ? 'Approved' : 'Pending',
        deductionReasons: (item.deduction_reason || []).join(', ') || '-'
      })

      invoiceMap[invoiceNumber].totalInvoiced += item.request_amount || 0
      invoiceMap[invoiceNumber].totalSavings += item.savings || 0
    })

    // Use user-selected symptoms from Redux store (green labels in Digitisation tab)
    const symptoms = userSelectedSymptoms.map(s => ({ text: s }))

    // Use user-selected diagnoses from Redux store (green labels in Digitisation tab)
    const diagnoses = userSelectedDiagnoses.map(d => ({
      text: d.text,
      code: d.code || ''
    }))

    return {
      symptoms: symptoms,
      diagnoses: diagnoses,
      invoices: Object.values(invoiceMap),
      financialSummary: {
        totalInvoiced: adjudicationResponse.total_request_amount || 0,
        totalRequested: adjudicationResponse.total_request_amount || 0,
        totalApproved: adjudicationResponse.total_allowed_amount || 0,
        totalSavings: adjudicationResponse.total_savings || 0
      },
      productRules: (adjudicationResponse.policy_rules_outcome?.detailed_results || []).map(rule => ({
        status: rule.status === 'passed' ? 'success' : 'warning',
        title: rule.category || 'Rule',
        description: rule.message || ''
      })),
      decision: {
        status: adjudicationResponse.decision?.toLowerCase() || 'pending',
        title: `Claim ${adjudicationResponse.decision || 'Pending'}`,
        description: adjudicationResponse.message || 'Awaiting decision'
      }
    }
  }

  // Timer countdown effect with persistence - only runs when timer is started
  useEffect(() => {
    if (!timerStarted) {
      return // Don't start timer until user clicks Save & Continue from patient-info
    }

    const interval = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 0) {
          clearInterval(interval)
          return 0
        }
        const newTime = prevTime - 1

        // Save timer state to sessionStorage
        const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
        savedTimers[claimId] = newTime
        sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [claimId, timerStarted])

  // Save timer state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
      savedTimers[claimId] = timeRemaining
      sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))
    }
  }, [claimId, timeRemaining])

  const tabs = useMemo(() => [
    { id: 'patient-info', label: 'Patient Info. Claim & Policy Details' },
    { id: 'digitisation', label: 'Digitisation' },
    { id: 'checklist', label: 'Checklist', locked: isChecklistTabLocked },
    { id: 'clinical', label: 'Clinical Validation', locked: isClinicalTabLocked },
    { id: 'review', label: 'Review', locked: isReviewTabLocked }
  ], [isChecklistTabLocked, isClinicalTabLocked, isReviewTabLocked])

  // Calculate dynamic financials for Clinical Validation tab
  const financials = useMemo(() => {
    if (activeTab === 'clinical' && claimData?.clinicalValidationInvoices) {
      // Calculate totals from clinical validation invoices
      const totals = claimData.clinicalValidationInvoices.reduce((acc, invoice) => {
        invoice.items?.forEach(item => {
          acc.totalApproved += parseFloat(item.appAmt) || 0
          acc.totalSavings += parseFloat(item.savings) || 0
        })
        return acc
      }, { totalApproved: 0, totalSavings: 0 })

      return {
        ...claimData.financials,
        approved: totals.totalApproved,
        totalSavings: totals.totalSavings
      }
    }

    return claimData?.financials || {}
  }, [activeTab, claimData?.clinicalValidationInvoices, claimData?.financials])
  // Updated handleSave with PUT API integration
  const handleSave = async () => {
    if (!claimId) return

    // Handle Patient Info tab save
    if (activeTab === 'patient-info') {
      // Start the timer when user clicks Save & Continue from patient-info tab
      if (!timerStarted) {
        setTimerStarted(true)
        // Initialize timer in sessionStorage
        const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
        savedTimers[claimId] = 180 // Start with 180 seconds (3 minutes)
        sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))
      }
      setActiveTab('digitisation')
      return
    }

    // Handle Digitisation tab save
    if (activeTab === 'digitisation') {
      try {
        // Build PATCH payload with modified invoices and medical info
        const payload = buildExtractionPatchPayload(
          rawApiResponse,
          invoices,
          validatedInvoices,
          invalidInvoices,
          selectedSymptoms,
          selectedDiagnoses,
          originalInvoiceKey
        )

        if (!payload) {
          alert('Failed to build update payload. Please try again.')
          return
        }

        // Call PATCH API with the constructed payload
        await claimsService.patchClaimExtractionData(claimId, payload)
        alert('Extraction data saved successfully!')

        // Unlock checklist tab and navigate to it
        setIsChecklistTabLocked(false)
        setActiveTab('checklist')
      } catch (err) {
        console.error('Error updating extraction data:', err)
        alert('Failed to save extraction data. Please try again.')
      }
      return
    }

    // Handle Checklist tab save
    if (activeTab === 'checklist') {
      // For now, just unlock clinical tab and navigate
      // You can add checklist save logic here if needed
      setIsClinicalTabLocked(false)
      setActiveTab('clinical')
      return
    }

    // Handle Clinical Validation tab save
    if (activeTab === 'clinical' && clinicalSaveFunction) {
      const success = await clinicalSaveFunction()
      if (success) {
        // Unlock review tab and navigate to it
        setIsReviewTabLocked(false)
        setActiveTab('review')
      } else {
        console.error('Failed to save clinical validation data')
      }
      return
    }

    // Handle Review tab save - Finalize adjudication
    if (activeTab === 'review') {
      try {
        const response = await claimsService.finalizeManualAdjudication(claimId)

        // Clear timer for this claim since it's completed
        const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
        delete savedTimers[claimId]
        sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))

        alert('Claim adjudication finalized successfully!')

        // Navigate back to claims list
        navigate('/claims')
      } catch (err) {
        console.error('Error finalizing adjudication:', err)
        alert('Failed to finalize adjudication. Please try again.')
      }
    }
  }

  const handleQueryClick = () => {
    setIsQueryModalOpen(true)
  }

  // Helper function to clear timer for completed claims (optional)
  const clearClaimTimer = (claimIdToClear) => {
    const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
    delete savedTimers[claimIdToClear]
    sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))
  }

  // Handle rerun success - update clinical validation data
  const handleRerunSuccess = (aiAdjudicationResponse) => {
    const transformedData = transformAdjudicationData(aiAdjudicationResponse)

    if (transformedData) {
      // Update clinical validation data with new adjudication results
      setClaimData(prevData => ({
        ...prevData,
        clinicalValidationInvoices: transformedData.clinicalValidationInvoices,
        financials: transformedData.financials
      }))

      // Store updated response
      setRawApiResponse(aiAdjudicationResponse)
    }
  }

  // Handle show invoice - find and display the document with matching invoice number
  const handleShowInvoice = (invoiceNumber) => {
    if (!claimData?.documents || claimData.documents.length === 0) {
      console.warn('No documents available')
      return
    }

    // Find document index by matching invoice number in document name
    const documentIndex = claimData.documents.findIndex(doc =>
      doc.name && doc.name.includes(invoiceNumber)
    )

    if (documentIndex !== -1) {
      setSelectedDocumentIndex(documentIndex)
      setCurrentPage(1) // Reset to first page of document
    } else {
      console.warn('Document not found for invoice:', invoiceNumber)
      // Optionally show a notification to the user
      alert(`Document for invoice ${invoiceNumber} not found`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim data...</p>
        </div>
      </div>
    )
  }

  // Error state (with fallback to mock data already handled in useEffect)
  if (error && !claimData) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Claim Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!claimData) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No claim data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <ClaimHeader
        claimId={claimData.claimId}
        claim_id={claimData.claim_id}
        status={claimData.status}
        benefitType={claimData.benefitType}
        timeRemaining={timeRemaining}
        financials={financials}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Document Viewer (40%) */}
        <div className="w-[40%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <DocumentViewer
            documents={claimData.documents || []}
            selectedDocumentIndex={selectedDocumentIndex}
            onDocumentChange={setSelectedDocumentIndex}
            currentPage={currentPage}
            totalPages={claimData.totalPages || 10}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Section - Tabs and Information Panels (60%) */}
        <div className="w-[60%] flex flex-col bg-white overflow-y-auto">
          {/* Tabs Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />

          {/* Content Area */}
          <div className="p-6 bg-white">
            {activeTab === 'patient-info' && (
              <div className="space-y-6">
                {/* Patient and Claim Details - Side by Side */}
                <div className="grid grid-cols-2 gap-6">
                  <PatientDetails patient={claimData.patient} />
                  <ClaimDetails claim={claimData.claim} />
                </div>
                {/* Policy Details - Full Width */}
                <PolicyDetails policy={claimData.policy} />
              </div>
            )}

            {activeTab === 'symptoms' && (
              <div className="text-center text-gray-500 py-12">
                <p>Symptoms & Diagnosis content will be displayed here</p>
              </div>
            )}

            {activeTab === 'digitisation' && (
              <DigitisationTab
                digitisationData={claimData.digitisationData}
                invoices={invoices}
                setInvoices={setInvoices}
                validatedInvoices={validatedInvoices}
                setValidatedInvoices={setValidatedInvoices}
                invalidInvoices={invalidInvoices}
                setInvalidInvoices={setInvalidInvoices}
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistTab
                invoices={claimData.invoices}
                onShowInvoice={handleShowInvoice}
              />
            )}

            {activeTab === 'clinical' && (
              <ClinicalValidationTab
              invoices={claimData.clinicalValidationInvoices}
              financials={claimData.financials}
              loading={clinicalLoading}
              error={clinicalError}
              rawApiResponse={rawApiResponse}
              claimUniqueId={rawApiResponse?.data?.claim_unique_id || claimId}
              onSave={(saveFunc) => setClinicalSaveFunction(() => saveFunc)}
              onRerunSuccess={handleRerunSuccess}
              onShowInvoice={handleShowInvoice}
            />
            )}

            {activeTab === 'review' && (
              <ReviewTab reviewData={claimData.reviewData} />
            )}
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <ActionBar
        queryCount={0}
        onSave={handleSave}
        onQueryClick={handleQueryClick}
        invoices={invoices}
        setInvoices={setInvoices}
        activeTab={activeTab}
        validatedInvoices={validatedInvoices}
      />

      {/* Query Management Modal */}
      <QueryManagementModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        claimId={claimData.claimId}
      />
    </div>
  )
}

export default PatientClaimInfo
