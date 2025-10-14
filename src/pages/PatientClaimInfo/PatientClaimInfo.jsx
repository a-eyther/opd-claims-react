import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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

/**
 * Patient Claim Info Page
 * Full-page view without sidebar for detailed claim information
 */
const PatientClaimInfo = () => {
  const { claimId } = useParams()

  // Get selected symptoms and diagnoses from Redux store
  const selectedSymptoms = useSelector(state => state.symptoms?.selectedSymptoms || [])
  const selectedDiagnoses = useSelector(state => state.diagnosis?.selectedDiagnoses || [])

  const [activeTab, setActiveTab] = useState('patient-info')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes in seconds
  const [claimData, setClaimData] = useState(null)
  const [invoices, setInvoices] = useState([]) //  Added invoices state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clinicalLoading, setClinicalLoading] = useState(false)
  const [clinicalError, setClinicalError] = useState(null)
  const [rawApiResponse, setRawApiResponse] = useState(null)
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

        console.log('Fetching claim extraction data for:', claimId)
        const response = await claimsService.getClaimExtractionData(claimId)
        console.log('API Response:', response)

        // Store raw API response for later use
        setRawApiResponse(response)

        const transformedData = transformClaimExtractionData(response)
        console.log('Transformed Data:', transformedData)

        if (transformedData) {
          setClaimData(transformedData)
          // set invoices state after data load
          setInvoices(transformedData?.digitisationData?.invoices || [])
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
        console.log('Fetching adjudication data for Clinical Validation tab:', claimId)

        // Try to get manual adjudication first
        let response = await claimsService.getManualAdjudication(claimId)
        console.log('Manual Adjudication API Response:', response)

        // If manual adjudication fails, fetch AI adjudication
        if (!response.success) {
          console.log('Manual adjudication not available, fetching AI adjudication...')
          response = await claimsService.getAIAdjudication(claimId)
          console.log('AI Adjudication API Response:', response)
        }

        // Store the adjudication response for later use
        setRawApiResponse(response)

        const transformedData = transformAdjudicationData(response)
        console.log('Clinical Validation Transformed Data:', transformedData)

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
          console.log('Trying AI adjudication as fallback...')
          const aiResponse = await claimsService.getAIAdjudication(claimId)
          console.log('AI Adjudication Fallback Response:', aiResponse)

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
        console.log('Fetching adjudication data for Review tab:', claimId)

        // Try to get manual adjudication first
        let response = await claimsService.getManualAdjudication(claimId)
        console.log('Review - Manual Adjudication API Response:', response)

        // If manual adjudication fails, fetch AI adjudication
        if (!response.success) {
          console.log('Manual adjudication not available for review, fetching AI adjudication...')
          response = await claimsService.getAIAdjudication(claimId)
          console.log('Review - AI Adjudication API Response:', response)
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

      invoiceMap[invoiceNumber].items.push({
        category: item.item_category || '',
        name: item.item_name || '',
        qty: approvedQty,
        rate: item.rate || 0,
        preauthAmount: item.tariff_amount || 0,
        invoicedAmount: item.request_amount || 0,
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

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 0) {
          clearInterval(interval)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'patient-info', label: 'Patient Info. Claim & Policy Details' },
    { id: 'digitisation', label: 'Digitisation' },
    { id: 'checklist', label: 'Checklist', locked: isChecklistTabLocked },
    { id: 'clinical', label: 'Clinical Validation', locked: isClinicalTabLocked },
    { id: 'review', label: 'Review', locked: isReviewTabLocked }
  ]
  // Updated handleSave with PUT API integration
  const handleSave = async () => {
    if (!claimId) return

    // Handle Digitisation tab save
    if (activeTab === 'digitisation') {
      try {
        console.log('Saving extraction data...', invoices)
        const payload = { output_data: { invoices } }
        const response = await claimsService.updateClaimExtractionData(claimId, payload)
        console.log('Extraction data updated successfully:', response)
        alert('Extraction data saved successfully!')
        // Unlock checklist tab and navigate to it
        setIsChecklistTabLocked(false)
        setActiveTab('checklist')
      } catch (err) {
        console.error('Error updating extraction data:', err)
        alert('Failed to save extraction data.')
      }
      return
    }

    // Handle Checklist tab save
    if (activeTab === 'checklist') {
      // For now, just unlock clinical tab and navigate
      // You can add checklist save logic here if needed
      console.log('Checklist validated, moving to clinical validation')
      setIsClinicalTabLocked(false)
      setActiveTab('clinical')
      return
    }

    // Handle Clinical Validation tab save
    if (activeTab === 'clinical' && clinicalSaveFunction) {
      const success = await clinicalSaveFunction()
      if (success) {
        console.log('Clinical validation data saved successfully')
        // Unlock review tab and navigate to it
        setIsReviewTabLocked(false)
        setActiveTab('review')
      } else {
        console.error('Failed to save clinical validation data')
      }
    }
  }

  const handleQueryClick = () => {
    setIsQueryModalOpen(true)
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
        status={claimData.status}
        benefitType={claimData.benefitType}
        timeRemaining={timeRemaining}
        financials={claimData.financials}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Document Viewer (40%) */}
        <div className="w-[40%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {console.log('PatientClaimInfo - Documents array:', claimData.documents)}
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
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistTab invoices={claimData.invoices} />
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
        queryCount={3}
        onSave={handleSave}
        onQueryClick={handleQueryClick}
        invoices={invoices}
        setInvoices={setInvoices}
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
