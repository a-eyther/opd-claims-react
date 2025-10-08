/**
 * Mock data for Edit Management table
 * Can be replaced with actual API data
 */

export const claimsData = [
  {
    id: '0028',
    visitNumber: '140201',
    date: 'Aug 26, 2025',
    time: '8:36 PM',
    timeElapsed: '8m ago',
    provider: 'MOI Teaching and Referral Hospital',
    benefitType: 'OPD',
    benefitName: 'General Consultation & Treatment',
    diagnosis: 'Headache, Migraine Assessment',
    decision: 'MODIFIED & APPROVED',
  },
  {
    id: '0029',
    visitNumber: '140202',
    date: 'Aug 27, 2025',
    time: '9:15 AM',
    timeElapsed: '8m ago',
    provider: 'MOI Teaching and Referral Hospital',
    benefitType: 'DENTAL',
    benefitName: 'Dental Care & Services',
    diagnosis: 'Orthodontic Assessment',
    decision: 'APPROVED',
  },
  {
    id: '0030',
    visitNumber: '140203',
    date: 'Aug 28, 2025',
    time: '2:30 PM',
    timeElapsed: '8m ago',
    provider: 'MOI Teaching and Referral Hospital',
    benefitType: 'OPTICAL',
    benefitName: 'Eye Care & Vision Services',
    diagnosis: 'Refractive Error, Glasses',
    decision: 'REJECTED',
  },
  {
    id: '0031',
    visitNumber: '140204',
    date: 'Aug 29, 2025',
    time: '11:45 AM',
    timeElapsed: '8m ago',
    provider: 'MOI Teaching and Referral Hospital',
    benefitType: 'OPD',
    benefitName: 'General Consultation & Treatment',
    diagnosis: 'Respiratory Tract Infection',
    decision: 'DECISION PENDING',
  },
  {
    id: '0032',
    visitNumber: '140205',
    date: 'Aug 30, 2025',
    time: '3:20 PM',
    timeElapsed: '8m ago',
    provider: 'MOI Teaching and Referral Hospital',
    benefitType: 'DENTAL',
    benefitName: 'Dental Care & Services',
    diagnosis: 'Tooth Extraction, Oral Surgery',
    decision: 'DECISION PENDING',
  },
  {
    id: '0033',
    visitNumber: '140206',
    date: 'Aug 31, 2025',
    time: '10:15 AM',
    timeElapsed: '8m ago',
    provider: 'Kenyatta National Hospital',
    benefitType: 'OPD',
    benefitName: 'General Consultation & Treatment',
    diagnosis: 'Headache, Migraine Assessment',
    decision: 'APPROVED',
  },
  {
    id: '0034',
    visitNumber: '140207',
    date: 'Sep 1, 2025',
    time: '2:45 PM',
    timeElapsed: '8m ago',
    provider: 'Kenyatta National Hospital',
    benefitType: 'OPTICAL',
    benefitName: 'Eye Care & Vision Services',
    diagnosis: 'Eye Infection Treatment',
    decision: 'REJECTED',
  },
  {
    id: '0035',
    visitNumber: '140208',
    date: 'Sep 2, 2025',
    time: '9:30 AM',
    timeElapsed: '8m ago',
    provider: 'Aga Khan University Hospital',
    benefitType: 'DENTAL',
    benefitName: 'Dental Care & Services',
    diagnosis: 'Dental Caries, Root Canal',
    decision: 'DECISION PENDING',
  },
  {
    id: '0036',
    visitNumber: '140209',
    date: 'Sep 3, 2025',
    time: '4:10 PM',
    timeElapsed: '8m ago',
    provider: 'Aga Khan University Hospital',
    benefitType: 'OPD',
    benefitName: 'General Consultation & Treatment',
    diagnosis: 'Respiratory Tract Infection',
    decision: 'APPROVED',
  },
  {
    id: '0037',
    visitNumber: '140210',
    date: 'Sep 4, 2025',
    time: '11:25 AM',
    timeElapsed: '8m ago',
    provider: 'The Nairobi Hospital',
    benefitType: 'OPTICAL',
    benefitName: 'Eye Care & Vision Services',
    diagnosis: 'Glaucoma Screening',
    decision: 'MODIFIED & APPROVED',
  },
];

export const statsData = {
  totalClaims: 53,
  editDone: 35,
  editPending: 18,
};

/**
 * Detailed claim data for PatientClaimInfo page
 */
export const claimDetailsData = {
  '0031': {
    claimId: 'ID-2314',
    status: 'Edit Pending',
    benefitType: 'OPD Dental',
    timer: '02:55',
    timerStatus: 'ACTION REQUIRED',
    totalPages: 10,
    financials: {
      totalRequested: 23000,
      preAuthAmount: 25000,
      approved: 22500,
      totalSavings: 0,
      totalInvoiced: 12200,
      totalApproved: 10200,
      totalSavings: 2000
    },
    patient: {
      name: 'GRACE AKINYI ODHIAMBO',
      relation: 'Wife',
      beneficiaryName: 'Aaliyah Kimani',
      visitNumber: '140204',
      claimNumber: '0031',
      claimCreated: 'Aug. 29, 2025, 11:45 a.m.',
      currentDecision: 'Pending'
    },
    claim: {
      hospital: 'MOI Teaching and Referral Hospital',
      invoiceNumbers: 'INV-2025-0517-001',
      invoiceId: 'inv_67893',
      invoiceDate: 'May 17, 2025, midnight',
      vettingStatus: 'Pending Review'
    },
    policy: {
      policyNumber: 'MTRH004',
      schemeName: 'MOI TEACHING AND REFERRAL HOSPITAL - INSURED',
      policyPeriod: '2025/04/01 → 2026/03/31',
      policyStatus: 'Active',
      benefitType: 'OPD Dental',
      benefitName: 'General Consultation & Treatment'
    },
    document: {
      name: 'Doc.h344453...',
      type: 'MEDICAL INVOICE',
      url: '/documents/sample-invoice.pdf', // PDF file to display
      details: [
        { label: 'Patient', value: 'Grace Akinyi Odhiambo' },
        { label: 'Invoice', value: 'INV-2025-0517-001' },
        { label: 'Visit No', value: '140204' },
        { label: 'Hospital', value: 'MOI Teaching Hospital' },
        { label: 'Date', value: 'May 17, 2025' },
        { label: 'Department', value: 'Dental' }
      ],
      services: [
        { name: 'Dental Consultation', amount: 1500 },
        { name: 'Tooth Extraction', amount: 3000 },
        { name: 'Prescription', amount: 500 }
      ],
      totalAmount: 5000
    },
    invoices: [
      {
        invoiceNumber: 'INV-2025-0517-001',
        visitNumber: '140204',
        totalAmount: 8500,
        beneficiaryName: 'GRACE AKINYI ODHIAMBO',
        invoiceDate: 'May 17, 2025'
      },
      {
        invoiceNumber: 'INV-2025-0517-002',
        visitNumber: '140204',
        totalAmount: 7500,
        beneficiaryName: 'GRACE AKINYI ODHIAMBO',
        invoiceDate: 'May 17, 2025'
      },
      {
        invoiceNumber: 'INV-2025-0517-003',
        visitNumber: '140204',
        totalAmount: 7500,
        beneficiaryName: 'GRACE AKINYI ODHIAMBO',
        invoiceDate: 'May 17, 2025'
      }
    ],
    clinicalValidationInvoices: [
      {
        invoiceNumber: 'Invoice-6778728',
        totalSavings: 0,
        totalInvoiced: 7800,
        items: [
          {
            medicineName: 'Standard General Consultation',
            invQty: 1,
            appQty: 1,
            unitPrice: 300.00,
            preauthAmt: 300.00,
            invAmt: 300.00,
            appAmt: 300,
            savings: 0.00,
            invoiceNo: 'Invoice-6778728',
            category: 'Consultation',
            systemReason: 'From approved Invoice-6778728',
            editorReason: 'No reason'
          },
          {
            medicineName: 'Blood Test - Complete Panel',
            invQty: 1,
            appQty: 1,
            unitPrice: 2500.00,
            preauthAmt: 2000.00,
            invAmt: 2500.00,
            appAmt: 2500,
            savings: 0.00,
            invoiceNo: 'Invoice-6778728',
            category: 'Laboratory',
            systemReason: 'From approved Invoice-6778728',
            editorReason: 'No reason'
          },
          {
            medicineName: 'X-Ray Chest',
            invQty: 1,
            appQty: 1,
            unitPrice: 5000.00,
            preauthAmt: 4500.00,
            invAmt: 5000.00,
            appAmt: 5000,
            savings: 0.00,
            invoiceNo: 'Invoice-6778728',
            category: 'Imaging',
            systemReason: 'From approved Invoice-6778728',
            editorReason: 'No reason'
          }
        ]
      },
      {
        invoiceNumber: 'Invoice-6778729',
        totalSavings: 0,
        totalInvoiced: 15200,
        items: [
          {
            medicineName: 'Follow-up Consultation',
            invQty: 1,
            appQty: 1,
            unitPrice: 200.00,
            preauthAmt: 200.00,
            invAmt: 200.00,
            appAmt: 200,
            savings: 0.00,
            invoiceNo: 'Invoice-6778729',
            category: 'Consultation',
            systemReason: 'From approved Invoice-6778729',
            editorReason: 'No reason'
          },
          {
            medicineName: 'Prescription Medications',
            invQty: 3,
            appQty: 3,
            unitPrice: 5000.00,
            preauthAmt: 12000.00,
            invAmt: 15000.00,
            appAmt: 15000,
            savings: 0.00,
            invoiceNo: 'Invoice-6778729',
            category: 'Pharmacy',
            systemReason: 'From approved Invoice-6778729',
            editorReason: 'No reason'
          }
        ]
      },
      {
        invoiceNumber: 'Invoice-6778730',
        totalSavings: 0,
        totalInvoiced: 12000,
        items: [
          {
            medicineName: 'Physiotherapy Session',
            invQty: 4,
            appQty: 4,
            unitPrice: 1500.00,
            preauthAmt: 5000.00,
            invAmt: 6000.00,
            appAmt: 6000,
            savings: 0.00,
            invoiceNo: 'Invoice-6778730',
            category: 'Treatment',
            systemReason: 'From approved Invoice-6778730',
            editorReason: 'No reason'
          },
          {
            medicineName: 'MRI Scan',
            invQty: 1,
            appQty: 1,
            unitPrice: 6000.00,
            preauthAmt: 6000.00,
            invAmt: 6000.00,
            appAmt: 6000,
            savings: 0.00,
            invoiceNo: 'Invoice-6778730',
            category: 'Imaging',
            systemReason: 'From approved Invoice-6778730',
            editorReason: 'No reason'
          }
        ]
      }
    ],
    digitisationData: {
      symptomsByLCT: [
        'Severe abdominal pain',
        'Nausea and vomiting',
        'Loss of appetite'
      ],
      diagnosisByLCT: [
        { text: 'Acute gastric ulcer with hemorrhage', code: 'K25.1' },
        { text: 'Chronic obstructive pulmonary disease', code: 'K25.1' }
      ],
      invoices: [
        {
          invoiceNumber: 'Invoice-6778729',
          savings: 0,
          totalAmount: 15200,
          items: [
            {
              date: '02/05/2024',
              category: 'Consultation',
              item: 'Follow-up Consultation',
              qty: 1,
              unit: 200,
              amount: 200,
              preauth: 200
            },
            {
              date: '02/05/2024',
              category: 'Consultation',
              item: 'Prescription Medications',
              qty: 3,
              unit: 5000,
              amount: 15000,
              preauth: 12000
            }
          ]
        },
        {
          invoiceNumber: 'Invoice-6778730',
          savings: 0,
          totalAmount: 12000,
          items: [
            {
              date: '03/05/2024',
              category: 'Treatment',
              item: 'Physiotherapy Session',
              qty: 4,
              unit: 1500,
              amount: 6000,
              preauth: 5000
            },
            {
              date: '03/05/2024',
              category: 'Imaging',
              item: 'MRI Scan',
              qty: 1,
              unit: 6000,
              amount: 6000,
              preauth: 6000
            }
          ]
        }
      ]
    },
    reviewData: {
      symptoms: [
        { text: 'Severe abdominal pain' },
        { text: 'Nausea and vomiting', tag: 'Missing' }
      ],
      diagnoses: [
        { text: 'Acute gastric ulcer with hemorrhage', code: 'K25.1' },
        { text: 'Calculus of kidney', code: 'K25.1', tag: 'Missing' },
        { text: 'Chronic obstructive pulmonary disease', code: 'K25.1' }
      ],
      invoices: [
        {
          invoiceNumber: 'Invoice INV-2025-0517-001',
          totalSavings: 0,
          totalInvoiced: 10700,
          items: [
            {
              category: 'Consultation',
              name: 'General Consultation',
              qty: 1,
              rate: 2500,
              preauthAmount: 2500,
              invoicedAmount: 2500,
              approvedAmount: 2500,
              savings: 0,
              status: 'Approved',
              deductionReasons: ''
            },
            {
              category: 'Dental Treatment',
              name: 'Tooth Extraction',
              qty: 2,
              rate: 3500,
              preauthAmount: 7000,
              invoicedAmount: 7000,
              approvedAmount: 6500,
              savings: 500,
              status: 'Partially Approved',
              deductionReasons: 'Reduced rate as per scheme guidelines'
            },
            {
              category: 'Medication',
              name: 'Pain Medication',
              qty: 1,
              rate: 1200,
              preauthAmount: 1200,
              invoicedAmount: 1200,
              approvedAmount: 1200,
              savings: 0,
              status: 'Approved',
              deductionReasons: ''
            }
          ]
        },
        {
          invoiceNumber: 'Invoice INV-2025-0517-007',
          totalSavings: 700,
          totalInvoiced: 7850,
          items: [
            {
              category: 'Laboratory',
              name: 'Blood Chemistry Panel',
              qty: 1,
              rate: 1800,
              preauthAmount: 1800,
              invoicedAmount: 1800,
              approvedAmount: 1800,
              savings: 0,
              status: 'Approved',
              deductionReasons: ''
            },
            {
              category: 'Pharmacy',
              name: 'Antibiotic Prescription',
              qty: 1,
              rate: 850,
              preauthAmount: 850,
              invoicedAmount: 850,
              approvedAmount: 850,
              savings: 0,
              status: 'Approved',
              deductionReasons: ''
            },
            {
              category: 'Imaging',
              name: 'Dental X-Ray',
              qty: 1,
              rate: 2200,
              preauthAmount: 2200,
              invoicedAmount: 2200,
              approvedAmount: 1800,
              savings: 400,
              status: 'Partially Approved',
              deductionReasons: 'Standard rate applied as per tariff guidelines'
            },
            {
              category: 'Treatment',
              name: 'Dental Filling',
              qty: 2,
              rate: 1500,
              preauthAmount: 3000,
              invoicedAmount: 3000,
              approvedAmount: 2700,
              savings: 300,
              status: 'Partially Approved',
              deductionReasons: 'Standard composite filling rate applied'
            }
          ]
        },
        {
          invoiceNumber: 'Invoice INV-2025-0517-008',
          totalSavings: 5000,
          totalInvoiced: 19300,
          items: [
            {
              category: 'Consultation',
              name: 'Specialist Consultation',
              qty: 1,
              rate: 4000,
              preauthAmount: 4000,
              invoicedAmount: 4000,
              approvedAmount: 3500,
              savings: 500,
              status: 'Partially Approved',
              deductionReasons: 'Standard specialist consultation rate applied'
            },
            {
              category: 'Procedure',
              name: 'Root Canal Treatment',
              qty: 1,
              rate: 12000,
              preauthAmount: 12000,
              invoicedAmount: 12000,
              approvedAmount: 10000,
              savings: 2000,
              status: 'Partially Approved',
              deductionReasons: 'Standard endodontic treatment rate applied'
            },
            {
              category: 'Pharmacy',
              name: 'Post-procedure Medication Kit',
              qty: 1,
              rate: 2500,
              preauthAmount: 2500,
              invoicedAmount: 2500,
              approvedAmount: 0,
              savings: 2500,
              status: 'Rejected',
              deductionReasons: 'Medication kit not covered under dental benefit'
            },
            {
              category: 'Follow-up',
              name: 'Post-treatment Review',
              qty: 1,
              rate: 800,
              preauthAmount: 800,
              invoicedAmount: 800,
              approvedAmount: 800,
              savings: 0,
              status: 'Approved',
              deductionReasons: ''
            }
          ]
        }
      ],
      financialSummary: {
        totalInvoiced: 37850,
        totalRequested: 37850,
        totalApproved: 31650,
        totalSavings: 6200
      },
      productRules: [
        {
          status: 'success',
          title: 'Benefit Limit Validation',
          description: 'Annual OPD Dental limit: KES 50,000 - Current utilization: 46%'
        },
        {
          status: 'success',
          title: 'Co-payment Calculation',
          description: '10% co-payment applied as per scheme guidelines'
        },
        {
          status: 'warning',
          title: 'Frequency Rule Check',
          description: 'Elbow test frequency exceeded - Manual review required'
        }
      ],
      decision: {
        status: 'partially-approved',
        title: 'Claim Partially Approved',
        description: '8 out of 10 items approved for payment'
      }
    }
  }
};

/**
 * Helper function to get claim details by ID
 */
export const getClaimDetailsById = (claimId) => {
  return claimDetailsData[claimId] || claimDetailsData['0031']; // Default to 0031
};
