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
  // Get assignment status from Redux store
  const assignmentStatus = useSelector(state => state.claims?.assignmentStatus || null)

  const [activeTab, setActiveTab] = useState('patient-info')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(() => {
    // Try to get saved timer value for this claim
    const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
    return savedTimers[claimId] !== undefined ? savedTimers[claimId] : 180
  })
  const [timerStarted, setTimerStarted] = useState(() => {
    // Check if timer has already been started for this claim
    const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
    // If timer exists, it's already started, otherwise start it now
    if (savedTimers[claimId] === undefined) {
      // Initialize timer for new claim
      savedTimers[claimId] = 180
      sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))
    }
    return true
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
  const [checklistSaveFunction, setChecklistSaveFunction] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [isChecklistTabLocked, setIsChecklistTabLocked] = useState(true)
  const [isClinicalTabLocked, setIsClinicalTabLocked] = useState(true)
  const [isReviewTabLocked, setIsReviewTabLocked] = useState(true)
  const [clinicalInvoiceItems, setClinicalInvoiceItems] = useState([])
  const [reviewTotals, setReviewTotals] = useState({ totalApproved: 0, totalSavings: 0 })
  const [editStatus, setEditStatus] = useState(null)
  const [assignedUsername, setAssignedUsername] = useState(null)
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false)

  // Call assignment API on component mount (only if not already assigned)
  useEffect(() => {
    const assignClaim = async () => {
      try {
        // Get assignment status from Redux store
        if (!assignmentStatus) {
          console.warn('Assignment status not found in store')
          return
        }

        // Only call assignment API if:
        // 1. Not already assigned
        // 2. Not expired
        // 3. time_remaining_minutes >= 1
        const shouldAssign = !assignmentStatus.is_assigned &&
                           !assignmentStatus.is_expired &&
                           (assignmentStatus.time_remaining_minutes || 0) >= 1

        if (shouldAssign) {
          await claimsService.assignClaim(claimId, { duration_minutes: 10 })
        }
      } catch (err) {
        console.error('Error assigning claim:', err)
      }
    }

    if (claimId && assignmentStatus) {
      assignClaim()
    }
  }, [claimId, assignmentStatus])

  // Fetch claim extraction data from API
  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await claimsService.getClaimExtractionData(claimId)

        // Store raw extraction response separately for digitisation tab and checklist tab
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

          // Extract edit_status and assignment info from claim_status
          const claimStatus = response?.data?.claim_status
          const extractedEditStatus = claimStatus?.edit_status
          const extractedAssignedUsername = claimStatus?.assignment?.assigned_to_username

          setEditStatus(extractedEditStatus)
          setAssignedUsername(extractedAssignedUsername)

          // Get current logged in username from localStorage or session
          const loggedInUsername = localStorage.getItem('username') || sessionStorage.getItem('username')

          // Determine if view-only mode
          const isViewOnly = extractedEditStatus === 'AUTOMATED' && extractedAssignedUsername !== loggedInUsername
          setIsViewOnlyMode(isViewOnly)

          // If EDITED status, unlock all tabs
          if (extractedEditStatus === 'EDITED') {
            setIsChecklistTabLocked(false)
            setIsClinicalTabLocked(false)
            setIsReviewTabLocked(false)
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
    const fetchClinicalData = async () => {
      if (activeTab !== 'clinical' || !claimId) return

      try {
        setClinicalLoading(true)
        setClinicalError(null)

        let response

        // Step 1: Try to get manual adjudication first
        try {
          response = await claimsService.getManualAdjudication(claimId)
        } catch (manualErr) {
          // Step 2: If manual adjudication fails, fetch AI adjudication
          console.log('Manual adjudication not found, fetching AI adjudication')
          response = await claimsService.getAIAdjudication(claimId)
        }

        // Step 3: Call re-adjudication
        await claimsService.reAdjudicate(claimId)

        // Step 4: Fetch AI adjudication again after re-adjudication
        response = await claimsService.getAIAdjudication(claimId)

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

        let response

        // Try to get manual adjudication first
        try {
          response = await claimsService.getManualAdjudication(claimId)
        } catch (manualErr) {
          // If manual adjudication fails, fetch AI adjudication
          console.log('Manual adjudication not found, fetching AI adjudication for review')
          response = await claimsService.getAIAdjudication(claimId)
        }

        if (response?.data?.adjudication_response) {
          const adjudicationResponse = response.data.adjudication_response

          // Store the adjudication response for financial calculations
          setRawApiResponse(response)

          // Transform adjudication response to review format
          const reviewData = transformAdjudicationToReview(adjudicationResponse, selectedSymptoms, selectedDiagnoses)

          // Update review data and financials
          setClaimData(prevData => ({
            ...prevData,
            reviewData: reviewData,
            financials: {
              ...prevData?.financials,
              totalApproved: adjudicationResponse.total_allowed_amount || 0,
              totalSavings: adjudicationResponse.total_savings || 0,
              approved: adjudicationResponse.total_allowed_amount || 0
            }
          }))

          // Update reviewTotals for header
          setReviewTotals({
            totalApproved: adjudicationResponse.total_allowed_amount || 0,
            totalSavings: adjudicationResponse.total_savings || 0
          })
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
    if (!timerStarted || timeRemaining === null) return

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
  }, [claimId, timerStarted, timeRemaining])

  // Save timer state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (timerStarted && timeRemaining !== null) {
        const savedTimers = JSON.parse(sessionStorage.getItem('claimTimers') || '{}')
        savedTimers[claimId] = timeRemaining
        sessionStorage.setItem('claimTimers', JSON.stringify(savedTimers))
      }
    }
  }, [claimId, timeRemaining, timerStarted])

  const tabs = useMemo(() => [
    { id: 'patient-info', label: 'Patient Info. Claim & Policy Details' },
    { id: 'digitisation', label: 'Digitisation' },
    { id: 'checklist', label: 'Checklist', locked: isChecklistTabLocked },
    { id: 'clinical', label: 'Clinical Validation', locked: isClinicalTabLocked },
    { id: 'review', label: 'Review', locked: isReviewTabLocked }
  ], [isChecklistTabLocked, isClinicalTabLocked, isReviewTabLocked])

  // Calculate dynamic financials for Clinical Validation tab and Review tab
  const financials = useMemo(() => {
    // Get Total Requested from lct_claim_request->claim_data->total_cost
    const totalRequested = rawExtractionResponse?.data?.lct_claim_request?.claim_data?.total_cost || 0
    // Get Pre-Auth Amount from lct_claim_request->claim_data->preAuthDetails->authorizedAmount
    const preAuthAmount = rawExtractionResponse?.data?.lct_claim_request?.claim_data?.preAuthDetails?.authorizedAmount || 0

    if (activeTab === 'clinical') {
      // Use clinicalInvoiceItems if available (edited data), otherwise use initial data
      const invoicesToCalculate = clinicalInvoiceItems.length > 0
        ? clinicalInvoiceItems
        : (claimData?.clinicalValidationInvoices || [])

      // Calculate total approved from clinical validation invoices
      const totalApproved = invoicesToCalculate.reduce((acc, invoice) => {
        invoice.items?.forEach(item => {
          acc += parseFloat(item.appAmt) || 0
        })
        return acc
      }, 0)

      // Get total savings from adjudication_response
      const totalSavingsFromAPI = rawApiResponse?.data?.adjudication_response?.total_savings || 0

      return {
        ...claimData?.financials,
        totalRequested: totalRequested,
        preAuthAmount: preAuthAmount,
        approved: totalApproved,
        totalSavings: totalSavingsFromAPI
      }
    }

    if (activeTab === 'review') {
      // Use reviewTotals from ReviewTab
      return {
        ...claimData?.financials,
        totalRequested: totalRequested,
        preAuthAmount: preAuthAmount,
        approved: reviewTotals.totalApproved,
        totalSavings: reviewTotals.totalSavings
      }
    }

    return {
      ...claimData?.financials,
      totalRequested: totalRequested,
      preAuthAmount: preAuthAmount
    }
  }, [activeTab, clinicalInvoiceItems, claimData?.clinicalValidationInvoices, claimData?.financials, rawExtractionResponse, reviewTotals])
  // Updated handleSave with PUT API integration
  const handleSave = async () => {
    if (!claimId) return

    // If in view-only mode, don't allow saves (this should not happen as button is hidden)
    if (isViewOnlyMode) {
      console.warn('Cannot save in view-only mode')
      return
    }

    // Handle Patient Info tab save
    if (activeTab === 'patient-info') {
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
          // alert('Failed to build update payload. Please try again.')
          return
        }

        // Call PATCH API with the constructed payload
        await claimsService.patchClaimExtractionData(claimId, payload)
        // alert('Extraction data saved successfully!')

        // Unlock checklist tab and navigate to it
        setIsChecklistTabLocked(false)
        setActiveTab('checklist')
      } catch (err) {
        console.error('Error updating extraction data:', err)
        // alert('Failed to save extraction data. Please try again.')
      }
      return
    }

    // Handle Checklist tab save
    if (activeTab === 'checklist') {
      try {
        // Get checklist data from save function
        if (typeof checklistSaveFunction === 'function') {
          const checklistData = checklistSaveFunction()
          console.log('Checklist data to submit:', checklistData)

          // Submit checklist data to API
          await claimsService.submitChecklistData(claimId, checklistData)
          // alert('Checklist data saved successfully!')
        } else {
          console.error('checklistSaveFunction is not a function:', checklistSaveFunction)
          throw new Error('Checklist save function not initialized')
        }

        // Unlock clinical tab and navigate
        setIsClinicalTabLocked(false)
        setActiveTab('clinical')
      } catch (err) {
        console.error('Error saving checklist data:', err)
        // alert('Failed to save checklist data. Please try again.')
      }
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

        // alert('Claim adjudication finalized successfully!')

        // Navigate back to claims list
        navigate('/claims')
      } catch (err) {
        console.error('Error finalizing adjudication:', err)
        // alert('Failed to finalize adjudication. Please try again.')
      }
    }
  }

  const handleQueryClick = () => {
    setIsQueryModalOpen(true)
  }

  // Handle Continue button click for view-only mode
  const handleContinue = () => {
    // Just navigate to next tab without saving
    if (activeTab === 'patient-info') {
      setActiveTab('digitisation')
    } else if (activeTab === 'digitisation') {
      setIsChecklistTabLocked(false)
      setActiveTab('checklist')
    } else if (activeTab === 'checklist') {
      setIsClinicalTabLocked(false)
      setActiveTab('clinical')
    } else if (activeTab === 'clinical') {
      setIsReviewTabLocked(false)
      setActiveTab('review')
    }
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
        timeRemaining={timeRemaining !== null ? timeRemaining : 180}
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
                lctClaimRequest={rawExtractionResponse?.data?.lct_claim_request}
                invoices={claimData.invoices}
                onShowInvoice={handleShowInvoice}
                onSave={setChecklistSaveFunction}
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
              onInvoiceItemsChange={setClinicalInvoiceItems}
            />
            )}

            {activeTab === 'review' && (
              <ReviewTab
                reviewData={claimData.reviewData}
                onTotalsChange={setReviewTotals}
              />
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
        editStatus={editStatus}
        isViewOnlyMode={isViewOnlyMode}
        onContinue={handleContinue}
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
