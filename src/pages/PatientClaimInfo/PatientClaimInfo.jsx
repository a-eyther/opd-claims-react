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

  // Fetch claim data - replace with actual API call
  const claimData = getClaimDetailsById(claimId) || {}

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

  const handleSave = () => {
    // Save logic here
    console.log('Save & Continue clicked')
  }

  const handleQueryClick = () => {
    setIsQueryModalOpen(true)
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
  {console.log(claimData)}
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Document Viewer (40%) */}
        <div className="w-[40%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
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
            <DigitisationTab digitisationData={claimData.digitisationData} />
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
      <ActionBar queryCount={3} onSave={handleSave} onQueryClick={handleQueryClick} />

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
