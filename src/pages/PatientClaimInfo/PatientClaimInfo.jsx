import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import { transformClaimExtractionData } from '../../utils/transformClaimData'

/**
 * Patient Claim Info Page
 * Full-page view without sidebar for detailed claim information
 */
const PatientClaimInfo = () => {
  const { claimId } = useParams()
  const [activeTab, setActiveTab] = useState('patient-info')
  const [currentPage, setCurrentPage] = useState(1)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes in seconds
  const [claimData, setClaimData] = useState(null)
  const [invoices, setInvoices] = useState([]) //  Added invoices state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch claim extraction data from API
  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching claim extraction data for:', claimId)
        const response = await claimsService.getClaimExtractionData(claimId)
        console.log('API Response:', response)

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
    { id: 'checklist', label: 'Checklist' },
    { id: 'clinical', label: 'Clinical Validation' },
    { id: 'review', label: 'Review' }
  ]

  // Updated handleSave with PUT API integration
  const handleSave = async () => {
    if (!claimId) return
    try {
      console.log('Saving extraction data...', invoices)
      const payload = { output_data: { invoices } }
      const response = await claimsService.updateClaimExtractionData(claimId, payload)
      console.log('Extraction data updated successfully:', response)
      alert('Extraction data saved successfully!')
    } catch (err) {
      console.error('Error updating extraction data:', err)
      alert('Failed to save extraction data.')
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
          {console.log('PatientClaimInfo - Document URL being passed:', claimData.document?.url)}
          <DocumentViewer
            documentUrl={claimData.document?.url}
            document={claimData.document}
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
