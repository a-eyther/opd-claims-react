export const mockData = {
  currentUser: {
    id: 'USR001',
    name: 'John Executive',
    role: 'Junior Executive',
    avatar: 'JE',
    email: 'john.executive@lct.com',
    permissions: ['view_claims', 'edit_claims', 'approve_claims', 'raise_queries']
  },

  claims: [
    {
      claimSeqId: '7893',
      claimUniqueId: 'VIT-20250811144430-88edb9ab',
      claimType: 'OPD',
      providerName: 'OASIS HEALTHCARE - KISII',
      dataDigitized: true,
      diagnosis: 'NA',
      adjudicated: true,
      decision: 'PENDING',
      totalInvoicedAmount: 0,
      totalAllowedAmount: 0,
      totalSavings: 0,
      savingsPercent: '0%',
      createTime: 'Aug. 11, 2025, 2:44 p.m.',
      status: 'pending'
    },
    {
      claimSeqId: '7892',
      claimUniqueId: 'VIT-20250811144428-251c0d27',
      claimType: 'OPD',
      providerName: 'OASIS SPECIALIST HOSPITAL - KISII',
      dataDigitized: true,
      diagnosis: 'NA',
      adjudicated: true,
      decision: 'PENDING',
      totalInvoicedAmount: 0,
      totalAllowedAmount: 0,
      totalSavings: 0,
      savingsPercent: '0%',
      createTime: 'Aug. 11, 2025, 2:44 p.m.',
      status: 'pending'
    },
    {
      claimSeqId: '7891',
      claimUniqueId: 'VIT-20250811144425-89a7abcd',
      claimType: 'OPD',
      providerName: 'ELDORET HOSPITAL',
      dataDigitized: true,
      diagnosis: 'NA',
      adjudicated: true,
      decision: 'PENDING',
      totalInvoicedAmount: 0,
      totalAllowedAmount: 0,
      totalSavings: 0,
      savingsPercent: '0%',
      createTime: 'Aug. 11, 2025, 2:44 p.m.',
      status: 'pending'
    },
  ],

  claimDetails: {
    'ABHI28800381331': {
      claimNumber: 'CLM-2025-000123',
      visitNumber: '881628',
      beneficiaryName: 'GLENDA CHEPKORIR',
      invoiceDate: 'Dec. 30, 2024, 3:30 p.m.',
      createdAt: 'Sept. 11, 2025, 4:30 p.m.',
      
      files: [
        { id: 1, name: '20250911163053__file_1175098_e699167de45a4f22856b6e9e520648cb.pdf', size: '1.2 MB', type: 'invoice' },
        { id: 2, name: '20250911163054__file_983563_109e368b0e2248eda8097da689d980ca.pdf', size: '856 KB', type: 'invoice' },
        { id: 3, name: '20250911163056__file_983564_725930a237224bdfa4b977e8325a2581.pdf', size: '2.3 MB', type: 'prescription' }
      ],

      documents: [
        {
          id: 'doc_1',
          type: 'invoice',
          displayName: 'Main Invoice',
          fileName: '20250911163053__file_1175098_e699167de45a4f22856b6e9e520648cb.pdf',
          invoiceNumber: 'NMC302412/24',
          date: 'Dec. 30, 2024, 3:30 p.m.',
          totalAmount: '6,589.00',
          content: {
            hospitalName: 'Medlife Hospital',
            patientName: 'GLENDA CHEPKORIR',
            memberID: 'MEM123456',
            visitNumber: '881628',
            items: [
              { description: 'Standard General Consultation', qty: 1, rate: 300.00, amount: 300.00 },
              { description: 'Cyproheptadine 200ml syrup', qty: 4, rate: 260.00, amount: 1040.00 },
              { description: 'H-Pylori Kit', qty: 2, rate: 870.00, amount: 1740.00 },
              { description: 'Paracetamol 500mg tablet', qty: 100, rate: 2.00, amount: 200.00 }
            ]
          }
        },
        {
          id: 'doc_2', 
          type: 'invoice',
          displayName: 'Additional Charges',
          fileName: '20250911163054__file_983563_109e368b0e2248eda8097da689d980ca.pdf',
          invoiceNumber: 'NMC302413/24',
          date: 'Dec. 30, 2024, 4:15 p.m.',
          totalAmount: '3,309.00',
          content: {
            hospitalName: 'Medlife Hospital',
            patientName: 'GLENDA CHEPKORIR',
            memberID: 'MEM123456', 
            visitNumber: '881628',
            items: [
              { description: 'Diclofenac/Methyl Salicylate/Menthol/Linseed Gel', qty: 2, rate: 109.00, amount: 218.00 },
              { description: 'Rabeprazole 20mg capsule', qty: 30, rate: 16.00, amount: 480.00 },
              { description: 'Sucralfate + Oxetacaine syrup 200ml', qty: 2, rate: 508.00, amount: 1016.00 },
              { description: 'Medical Heel Cushion M', qty: 1, rate: 1595.00, amount: 1595.00 }
            ]
          }
        },
        {
          id: 'doc_3',
          type: 'prescription', 
          displayName: 'Medication Prescription',
          fileName: '20250911163056__file_983564_725930a237224bdfa4b977e8325a2581.pdf',
          prescriptionNumber: 'RX-2024-12345',
          date: 'Dec. 30, 2024, 3:30 p.m.',
          doctor: 'Dr. Sarah Johnson',
          content: {
            patientName: 'GLENDA CHEPKORIR',
            age: '45 years',
            diagnosis: 'Fatty liver disease, Gastritis',
            medications: [
              { name: 'Cyproheptadine 200ml syrup', dosage: '5ml twice daily', quantity: '4 bottles', duration: '1 month' },
              { name: 'H-Pylori Kit', dosage: 'As directed', quantity: '2 kits', duration: '14 days' },
              { name: 'Paracetamol 500mg', dosage: '1 tablet when needed', quantity: '100 tablets', duration: 'As needed' },
              { name: 'Rabeprazole 20mg', dosage: '1 capsule daily before breakfast', quantity: '30 capsules', duration: '1 month' }
            ]
          }
        }
      ],
      
      policyData: {
        policyNumber: 'INACTIVE-AIC001-KIJABE',
        schemeName: 'AIC KIJABE',
        policyStartDate: '2024-01-01',
        policyEndDate: '2024-12-31'
      },
      
      claimsHistory: [
        {
          benefitType: 'OUTPATIENT',
          invoiceDate: '2024-12-31T15:34:24+05:30',
          memberName: 'GLENDA CHEPKORIR',
          visitNumber: '881628',
          invoiceNumber: 'NMC302412/24',
          invoiceId: '1758792',
          totalInvoicedAmount: 6589.0,
          vettingStatus: 'PENDING'
        }
      ],
      
      adjudications: [
        {
          time: 'July 31, 2025, 12:24 p.m.',
          decision: 'APPROVED',
          totalInvoicedAmount: 6589.00,
          totalAllowedAmount: 4994.00,
          totalSavings: 1595.00,
          percentSavings: '24.21%'
        }
      ]
    }
  },

  billItems: [
    {
      id: 1,
      category: 'Consultation',
      itemName: 'Standard General Consultation',
      quantity: 1,
      unitPrice: 300.0,
      invoicedAmount: 300.0,
      requestedAmount: 300.0,
      approvedAmount: 300.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: null
    },
    {
      id: 2,
      category: 'Medication',
      itemName: 'Cyproheptadine 200ml syrup',
      quantity: 4,
      unitPrice: 260.0,
      invoicedAmount: 1040.0,
      requestedAmount: 1040.0,
      approvedAmount: 1040.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 1200.0
    },
    {
      id: 3,
      category: 'Medication',
      itemName: 'Diclofenac/Methyl Salicylate/Menthol/Linseed Gel',
      quantity: 2,
      unitPrice: 109.0,
      invoicedAmount: 218.0,
      requestedAmount: 218.0,
      approvedAmount: 218.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 250.0
    },
    {
      id: 4,
      category: 'Medication',
      itemName: 'H-Pylori Kit',
      quantity: 2,
      unitPrice: 870.0,
      invoicedAmount: 1740.0,
      requestedAmount: 1740.0,
      approvedAmount: 1740.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 1800.0
    },
    {
      id: 5,
      category: 'Medication',
      itemName: 'Paracetamol 500mg tablet',
      quantity: 100,
      unitPrice: 2.0,
      invoicedAmount: 200.0,
      requestedAmount: 200.0,
      approvedAmount: 200.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 220.0
    },
    {
      id: 6,
      category: 'Medication',
      itemName: 'Rabeprazole 20mg capsule',
      quantity: 30,
      unitPrice: 16.0,
      invoicedAmount: 480.0,
      requestedAmount: 480.0,
      approvedAmount: 480.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 500.0
    },
    {
      id: 7,
      category: 'Medication',
      itemName: 'Sucralfate + Oxetacaine syrup 200ml',
      quantity: 2,
      unitPrice: 508.0,
      invoicedAmount: 1016.0,
      requestedAmount: 1016.0,
      approvedAmount: 1016.0,
      savings: 0,
      status: 'relevant',
      deductionReason: '',
      preAuthAmount: 1100.0
    },
    {
      id: 8,
      category: 'Physiotherapy',
      itemName: 'Medical Heel Cushion M',
      quantity: 1,
      unitPrice: 1595.0,
      invoicedAmount: 1595.0,
      requestedAmount: 1595.0,
      approvedAmount: 0,
      savings: 1595.0,
      status: 'irrelevant',
      deductionReason: 'Item not necessary for diagnosis/symptoms presented',
      preAuthAmount: 0
    }
  ],

  diagnosisCodes: [
    { code: 'K76.0', name: 'Fatty (change of) liver, not elsewhere classified' },
    { code: 'E83.110', name: 'Hereditary hemochromatosis' },
    { code: 'R64', name: 'Cachexia' },
    { code: 'J44.0', name: 'Chronic obstructive pulmonary disease with acute lower respiratory infection' },
    { code: 'I10', name: 'Essential (primary) hypertension' },
    { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications' },
    { code: 'J45.9', name: 'Asthma, unspecified' },
    { code: 'M79.3', name: 'Myalgia' },
    { code: 'R50.9', name: 'Fever, unspecified' },
    { code: 'R05', name: 'Cough' }
  ],

  symptoms: [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Body aches',
    'Sore throat', 'Runny nose', 'Chest pain', 'Shortness of breath',
    'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain', 'Loss of appetite',
    'Dizziness', 'Joint pain', 'Muscle pain', 'Skin rash', 'Difficulty swallowing'
  ],

  queryTemplates: [
    { id: 1, title: 'Missing Documents', message: 'Please provide the missing documents for claim processing.' },
    { id: 2, title: 'Diagnosis Clarification', message: 'Please clarify the diagnosis as it doesn\'t match the treatment provided.' },
    { id: 3, title: 'Invoice Discrepancy', message: 'There is a discrepancy in the invoice amount. Please provide clarification.' },
    { id: 4, title: 'Pre-authorization Required', message: 'This treatment requires pre-authorization. Please provide the approval documentation.' },
    { id: 5, title: 'Policy Coverage', message: 'This item/service is not covered under the policy. Please review.' }
  ],

  providers: [
    { id: 'PRV001', name: 'OASIS HEALTHCARE - KISII', type: 'Hospital' },
    { id: 'PRV002', name: 'OASIS SPECIALIST HOSPITAL - KISII', type: 'Specialist Hospital' },
    { id: 'PRV003', name: 'ELDORET HOSPITAL', type: 'Hospital' },
    { id: 'PRV004', name: 'MALIBU PHARMACY - ELDORET', type: 'Pharmacy' },
    { id: 'PRV005', name: 'MOI TEACHING AND REFERRAL HOSPITAL', type: 'Referral Hospital' },
    { id: 'PRV006', name: 'AMBIENCE CHILDRENS HOSPITAL - ELDORET', type: 'Children Hospital' }
  ],

  itemCategories: [
    'Consultation',
    'Medication',
    'Laboratory',
    'Radiology',
    'Procedure',
    'Physiotherapy',
    'Dental',
    'Optical',
    'Others'
  ],

  deductionReasons: [
    'Item not necessary for diagnosis/symptoms presented',
    'Duplicate medication',
    'Exceeds policy limit',
    'Not covered under policy',
    'Pre-authorization required',
    'Invalid/incomplete documentation',
    'Service not rendered',
    'Incorrect billing',
    'Alternative treatment available'
  ],
};