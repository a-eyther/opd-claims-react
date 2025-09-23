import { create } from 'zustand';
import { mockData } from '../utils/mockData';

const useEditorStore = create((set, get) => ({
  billItems: [...mockData.billItems],
  medicineItems: [...mockData.billItems.filter(item => item.category === 'Medication')].map(item => ({
    ...item,
    approvedQuantity: item.quantity,
    systemDeductionReason: item.deductionReason || '',
    editorDeductionReason: '',
    customDeductionReason: ''
  })),
  isDirty: false,
  currentTab: 'digitization',
  selectedDiagnosis: ['K76.0', 'E83.110', 'R64'],
  selectedSymptoms: ['Fatty liver', 'Anorexia', 'Fatigue'],
  extractedDiagnosis: ['K76.0', 'E83.110', 'R64'],
  extractedSymptoms: ['Fatty liver', 'Anorexia', 'Fatigue'],
  
  // Enhanced Financial Tracking
  financialTotals: {
    totalExtractedAmount: 0.00,    // From AI processing
    totalRequestedAmount: 0.00,    // From claim submission
    totalAllowedAmount: 0.00,      // Pre-approved amounts
    totalApprovedAmount: 0.00,     // System-approved final amounts
    finalExtractedAmount: 0.00     // After manual editor changes
  },
  
  // Lock states
  isClaimInfoLocked: false,
  isDigitizationLocked: false,
  systemRerunStatus: 'idle', // idle, running, completed
  lastRerunTime: null,

  // Document viewing and verification
  currentDocument: null, // Currently selected document for viewing
  staticInfoPanelCollapsed: true,
  documentViewerCollapsed: false, // For collapsing the left document panel
  verificationStatus: {}, // Status of document verification checklist
  
  // Progressive step navigation system
  stepsCompleted: {
    digitization: false,
    diagnosis: false,
    clinicalValidation: false,
    review: false
  },
  decisionSubmitted: false, // Track if final decision was submitted
  
  // Diagnosis moved to digitization context
  diagnosisInDigitization: true, // Flag to show diagnosis in digitization tab
  
  setBillItems: (items) => set({ billItems: items, isDirty: true }),
  
  updateBillItem: (itemId, updates) => {
    set(state => ({
      billItems: state.billItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ),
      isDirty: true
    }));
  },
  
  addBillItem: () => {
    const newItem = {
      id: Date.now(),
      category: 'Medication',
      itemName: '',
      quantity: 1,
      unitPrice: 0.00,
      invoicedAmount: 0.00,
      approvedAmount: 0.00,
      savings: 0.00,
      status: 'relevant',
      deductionReason: '',
      invoiceNumber: 'INV-001',
      itemDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      preAuthAmount: 0.00 // Preauth amount for each line item
    };
    
    set(state => ({
      billItems: [...state.billItems, newItem],
      isDirty: true
    }));
  },
  
  deleteBillItem: (itemId) => {
    set(state => ({
      billItems: state.billItems.filter(item => item.id !== itemId),
      isDirty: true
    }));
  },
  
  duplicateBillItem: (itemId) => {
    const { billItems } = get();
    const item = billItems.find(i => i.id === itemId);
    if (item) {
      const newItem = { ...item, id: Date.now() };
      set(state => ({
        billItems: [...state.billItems, newItem],
        isDirty: true
      }));
    }
  },
  
  calculateTotals: () => {
    const { billItems } = get();
    const totalInvoiced = billItems.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);
    const totalApproved = billItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
    const totalSavings = billItems.reduce((sum, item) => sum + (item.savings || 0), 0);
    const savingsPercent = totalInvoiced > 0 ? (totalSavings / totalInvoiced * 100).toFixed(2) : '0.00';
    
    return { totalInvoiced, totalApproved, totalSavings, savingsPercent };
  },

  // Pure calculation function that doesn't update state
  calculateFinancialTotals: () => {
    const { billItems } = get();
    
    // Calculate each financial total based on bill items
    const totalExtractedAmount = billItems.reduce((sum, item) => sum + (item.aiExtractedAmount || item.invoicedAmount || 0), 0);
    const totalRequestedAmount = billItems.reduce((sum, item) => sum + (item.requestedAmount || item.invoicedAmount || 0), 0);
    const totalAllowedAmount = billItems.reduce((sum, item) => sum + (item.allowedAmount || item.invoicedAmount || 0), 0);
    const totalApprovedAmount = billItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
    const finalExtractedAmount = billItems.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);

    return {
      totalExtractedAmount: Math.floor(totalExtractedAmount * 100) / 100,
      totalRequestedAmount: Math.floor(totalRequestedAmount * 100) / 100,
      totalAllowedAmount: Math.floor(totalAllowedAmount * 100) / 100, 
      totalApprovedAmount: Math.floor(totalApprovedAmount * 100) / 100,
      finalExtractedAmount: Math.floor(finalExtractedAmount * 100) / 100
    };
  },

  // Function to update stored financial totals (to be called in useEffect)
  updateFinancialTotals: () => {
    const { calculateFinancialTotals } = get();
    const newTotals = calculateFinancialTotals();
    set({ financialTotals: newTotals });
  },
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  setSelectedDiagnosis: (diagnosis) => set({ selectedDiagnosis: diagnosis, isDirty: true }),
  
  setSelectedSymptoms: (symptoms) => set({ selectedSymptoms: symptoms, isDirty: true }),
  
  updateMedicineItem: (itemId, updates) => {
    set(state => ({
      medicineItems: state.medicineItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ),
      isDirty: true
    }));
  },
  
  addMedicineItem: () => {
    const newItem = {
      id: Date.now(),
      category: 'Medication',
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      invoicedAmount: 0,
      approvedAmount: 0,
      approvedQuantity: 1,
      savings: 0,
      status: 'relevant',
      systemDeductionReason: '',
      editorDeductionReason: '',
      customDeductionReason: ''
    };
    
    set(state => ({
      medicineItems: [...state.medicineItems, newItem],
      isDirty: true
    }));
  },
  
  deleteMedicineItem: (itemId) => {
    set(state => ({
      medicineItems: state.medicineItems.filter(item => item.id !== itemId),
      isDirty: true
    }));
  },
  
  // Lock functions
  lockClaimInfo: () => set({ isClaimInfoLocked: true }),
  unlockClaimInfo: () => set({ isClaimInfoLocked: false }),
  lockDigitization: () => set({ isDigitizationLocked: true }),
  unlockDigitization: () => set({ isDigitizationLocked: false }),
  
  // System rerun function
  rerunSystem: async () => {
    const { isClaimInfoLocked, isDigitizationLocked } = get();
    
    if (!isClaimInfoLocked || !isDigitizationLocked) {
      return Promise.reject('Both Claim Info and Digitization must be locked before rerun');
    }
    
    set({ systemRerunStatus: 'running' });
    
    // Simulate API call to rerun system with corrected data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update medicine items with new system response
        const updatedMedicineItems = get().billItems
          .filter(item => item.category === 'Medication')
          .map(item => ({
            ...item,
            approvedQuantity: item.quantity,
            systemDeductionReason: Math.random() > 0.7 ? 'Updated by system after rerun' : '',
            editorDeductionReason: '',
            customDeductionReason: '',
            approvedAmount: item.invoicedAmount * (Math.random() * 0.3 + 0.7), // Simulate system adjustment
            savings: item.invoicedAmount * (Math.random() * 0.3)
          }));
        
        set({ 
          medicineItems: updatedMedicineItems,
          systemRerunStatus: 'completed',
          lastRerunTime: new Date().toISOString()
        });
        
        resolve();
      }, 2000); // Simulate 2 second processing time
    });
  },
  
  saveChanges: () => {
    // Simulate save
    set({ isDirty: false });
    return Promise.resolve();
  },
  
  resetEditor: () => {
    set({
      billItems: [...mockData.billItems],
      medicineItems: [...mockData.billItems.filter(item => item.category === 'Medication')].map(item => ({
        ...item,
        approvedQuantity: item.quantity,
        systemDeductionReason: item.deductionReason || '',
        editorDeductionReason: '',
        customDeductionReason: ''
      })),
      isDirty: false,
      currentTab: 'claim-info',
      selectedDiagnosis: ['K76.0', 'E83.110', 'R64'],
      selectedSymptoms: ['Fatty liver', 'Anorexia', 'Fatigue'],
      extractedDiagnosis: ['K76.0', 'E83.110', 'R64'],
      extractedSymptoms: ['Fatty liver', 'Anorexia', 'Fatigue'],
      isClaimInfoLocked: false,
      isDigitizationLocked: false,
      systemRerunStatus: 'idle',
      lastRerunTime: null,
      currentDocument: null,
      staticInfoPanelCollapsed: true,
      verificationStatus: {}
    });
  },

  // Document and verification actions
  setCurrentDocument: (document) => set({ currentDocument: document, isDirty: true }),
  
  toggleStaticInfoPanel: () => set(state => ({ 
    staticInfoPanelCollapsed: !state.staticInfoPanelCollapsed 
  })),

  toggleDocumentViewer: () => set(state => ({ 
    documentViewerCollapsed: !state.documentViewerCollapsed 
  })),

  updateVerificationStatus: (documentId, fieldKey, status) => set(state => ({
    verificationStatus: {
      ...state.verificationStatus,
      [documentId]: {
        ...state.verificationStatus[documentId],
        [fieldKey]: status
      }
    },
    isDirty: true
  })),

  setVerificationComplete: (documentId, isComplete) => set(state => ({
    verificationStatus: {
      ...state.verificationStatus,
      [documentId]: {
        ...state.verificationStatus[documentId],
        isComplete
      }
    },
    isDirty: true
  })),

  raiseVerificationQuery: (queryData) => {
    // This would typically integrate with the existing query system
    console.log('Raising verification query:', queryData);
    // For now, just log the query - in a real app this would create a query record
    set(state => ({ isDirty: true }));
  },

  // Progressive step completion management
  markStepCompleted: (step) => set(state => ({
    stepsCompleted: {
      ...state.stepsCompleted,
      [step]: true
    },
    isDirty: true
  })),

  resetStepCompletion: () => set({
    stepsCompleted: {
      digitization: false,
      diagnosis: false,
      clinicalValidation: false,
      review: false
    },
    decisionSubmitted: false
  }),

  setDecisionSubmitted: (submitted) => set({ 
    decisionSubmitted: submitted,
    isDirty: true 
  }),

  // Helper to check if a step can be accessed
  canAccessStep: (step) => {
    const { stepsCompleted } = get();
    switch (step) {
      case 'digitization':
        return true; // Always accessible
      case 'diagnosis':
        return stepsCompleted.digitization;
      case 'clinicalValidation':
        return stepsCompleted.diagnosis;
      case 'review':
        return stepsCompleted.clinicalValidation;
      default:
        return false;
    }
  }
}));

export default useEditorStore;