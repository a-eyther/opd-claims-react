/**
 * Transform adjudication API response to clinical validation format
 * @param {Object} apiResponse - Raw adjudication API response
 * @returns {Object} Transformed data for ClinicalValidationTab
 */
export const transformAdjudicationData = (apiResponse) => {
  if (!apiResponse?.data?.adjudication_response) {
    console.error('Invalid adjudication response:', apiResponse)
    return null
  }

  const { adjudication_response } = apiResponse.data
  const billingData = adjudication_response.billing_data || []

  // Group billing data by invoice number
  const invoiceMap = {}
  billingData.forEach(item => {
    const invoiceNumber = item.invoice_number || 'UNKNOWN'
    if (!invoiceMap[invoiceNumber]) {
      invoiceMap[invoiceNumber] = {
        invoiceNumber: invoiceNumber,
        invoiceId: item.invoice_id || 'UNKNOWN',
        items: [],
        totalInvoiced: 0,
        totalSavings: 0
      }
    }

    const invQty = item.quantity || 1 // Prevent division by zero
    const invAmt = item.request_amount || 0
    const unitPrice = invQty > 0 ? invAmt / invQty : 0

    // Use approved_quantity if present, otherwise fall back to quantity
    const appQty = item.approved_quantity !== undefined && item.approved_quantity !== null
      ? item.approved_quantity
      : item.quantity || 0

    invoiceMap[invoiceNumber].items.push({
      medicineName: item.item_name || '',
      invQty: invQty,
      appQty: appQty,
      unitPrice: unitPrice,
      preauthAmt: item.tariff_amount || 0,
      invAmt: invAmt,
      appAmt: item.approved_amount || 0,
      savings: item.savings || 0,
      invoiceNo: invoiceNumber,
      category: item.item_category || '',
      systemReason: item.message || '',
      editorReason: item.editor_reason || '',
      necessary: item.necessary || 'PENDING',
      deductionReasons: item.deduction_reason || []
    })

    invoiceMap[invoiceNumber].totalInvoiced += item.request_amount || 0
    invoiceMap[invoiceNumber].totalSavings += item.savings || 0
  })

  const invoices = Object.values(invoiceMap)

  // Calculate financial totals
  const totalInvoiced = adjudication_response.total_request_amount || 0
  const totalApproved = adjudication_response.total_allowed_amount || 0
  const totalSavings = adjudication_response.total_savings || 0

  return {
    clinicalValidationInvoices: invoices,
    financials: {
      totalInvoiced: totalInvoiced,
      totalRequested: totalInvoiced,
      totalApproved: totalApproved,
      totalSavings: totalSavings
    },
    adjudicationResponse: adjudication_response
  }
}

/**
 * Transform API extraction data to match component structure
 * @param {Object} apiResponse - Raw API response
 * @returns {Object} Transformed data for PatientClaimInfo component
 */
export const transformClaimExtractionData = (apiResponse) => {
  if (!apiResponse?.data) {
    console.error('Invalid API response:', apiResponse)
    return null
  }

  const { data } = apiResponse
  const { claim_details, output_data, policy_details, documents, approved_amount } = data

  // Helper function to check for null/undefined/"Not Available"
  const getValue = (value, defaultValue = 'Not Available') => {
    if (value === null || value === undefined || value === 'Not Available' || value === '') {
      return defaultValue
    }
    return value
  }

  // Find invoices - check for different possible keys
  const invoicesData = output_data?.invoices ||
                       output_data?.['?2_invoices'] ||
                       output_data?.['2_invoices'] ||
                       Object.keys(output_data || {}).find(key => key.includes('invoice'))
                         ? output_data[Object.keys(output_data).find(key => key.includes('invoice'))]
                         : []

  // Transform invoice line items for digitisation tab
  const transformedInvoices = invoicesData?.map((invoice) => ({
    invoiceNumber: getValue(invoice.invoice_id) !== 'Not Available' ? invoice.invoice_id : getValue(invoice.invoice_number),
    invoiceDate: getValue(invoice.invoice_date),
    totalAmount: invoice.invoice_total_amount || 0,
    savings: 0, // Will be calculated
    items: invoice.line_items?.map((item) => ({
      date: getValue(invoice.invoice_date, ''),
      category: getValue(item.item_category, 'General'),
      item: getValue(item.item_name, ''),
      qty: item.unit || 1,
      unit: item.unit_price || 0,
      amount: item.request_amount || 0,
      preauth: 0, // Default value - not in API
      necessary: getValue(item.necessary, 'YES'),
      message: getValue(item.message, '')
    })) || []
  })) || []

  // Transform symptoms from LCT
  const symptomsByLCT = data?.lct_claim_request?.claim_data?.treatment_info?.symptom_list
    ?.map(s => getValue(s.name || s.value))
    .filter(s => s && s !== 'Not Available') || []

  // Transform diagnoses from LCT
  const diagnosisByLCT = data?.lct_claim_request?.claim_data?.treatment_info?.diagnosis_list
    ?.map(d => ({
      text: getValue(d.name),
      code: getValue(d.icd_code, '')
    }))
    .filter(d => d.text && d.text !== 'Not Available') || []

  // Transform symptoms from Vitraya (for selected symptoms)
  const vitrayaSymptoms = output_data?.medical_info?.symptoms
    ?.map(s => getValue(s.value))
    .filter(s => s && s !== 'Not Available') || []

  // Transform diagnoses from Vitraya (for selected diagnoses)
  const vitrayaDiagnoses = output_data?.medical_info?.diagnosis
    ?.map(d => ({
      text: getValue(d.diagnosis_name),
      code: getValue(d.icd_code, '')
    }))
    .filter(d => d.text && d.text !== 'Not Available') || []


  // Calculate total requested amount
  const totalRequested = output_data?.billing_details?.total_req_amount?.value || claim_details?.request_amount || 0
  const totalApproved = approved_amount || 0

  // Transform all documents from API
  const transformedDocuments = documents && documents.length > 0
    ? documents.map(doc => ({
        name: doc.file_name || 'Document',
        type: (doc.file_type || 'PDF').toUpperCase(),
        url: doc.presigned_url || null,
        fileKey: doc.file_key || ''
      }))
    : []

  // Get first document for backward compatibility
  const firstDocument = transformedDocuments.length > 0 ? transformedDocuments[0] : null
  const documentUrl = firstDocument?.url || null
  const documentName = firstDocument?.name || 'Not Available'

  // Get policy period from benefits
  const activeBenefit = policy_details?.benefits?.find(b => b.benefitName === claim_details?.benefit_name)
  const policyPeriod = getValue(policy_details?.policy_start_date) !== 'Not Available' && getValue(policy_details?.policy_end_date) !== 'Not Available'
    ? `${policy_details.policy_start_date} → ${policy_details.policy_end_date}`
    : 'Not Available'

  return {
    claimId: getValue(claim_details?.claim_unique_id, data.claim_unique_id),
    claim_id:getValue(claim_details?.id, data.id),
    status: getValue(data?.edit_status, 'PENDING'),
    benefitType: getValue(claim_details?.benefit_name, getValue(claim_details?.claim_type, 'OPD')),
    timer: '03:00', // Timer not in API
    timerStatus: 'ACTION REQUIRED', // Timer status not in API
    totalPages: documents && documents.length > 0 ? 10 : 0, // Page count not in API - default to 10

    financials: {
      totalRequested: totalRequested,
      preAuthAmount: claim_details?.pre_auth_amount || 0,
      approved: totalApproved,
      totalSavings: totalRequested - totalApproved,
      totalInvoiced: totalRequested,
      totalApproved: totalApproved
    },

    patient: {
      name: getValue(claim_details?.member_name, getValue(output_data?.medical_info?.patient_details?.name)),
      relation: 'Not Available', // Beneficiary relation not in API
      beneficiaryName: getValue(claim_details?.member_name, getValue(output_data?.medical_info?.patient_details?.name)),
      visitNumber: getValue(claim_details?.visit_number, ''),
      claimNumber: getValue(claim_details?.claim_number, ''),
      claimCreated: claim_details?.created_at ? new Date(claim_details.created_at).toLocaleString() : 'Not Available',
      currentDecision: getValue(claim_details?.status, 'Pending'),
      patientId: getValue(output_data?.medical_info?.patient_details?.patient_id, ''),
      age: getValue(output_data?.medical_info?.patient_details?.age),
      gender: getValue(output_data?.medical_info?.patient_details?.gender)
    },

    claim: {
      hospital: getValue(claim_details?.provider_name),
      invoiceNumbers: invoicesData?.map(inv => getValue(inv.invoice_id)).join(', ') || 'Not Available',
      invoiceId: getValue(invoicesData?.[0]?.invoice_id, ''),
      invoiceDate: getValue(invoicesData?.[0]?.invoice_date, ''),
      vettingStatus: getValue(data?.edit_status, 'Pending Review'),
      visitType: getValue(claim_details?.visit_type, ''),
      claimType: getValue(claim_details?.claim_type, ''),
      claimSubType: getValue(claim_details?.claim_sub_type, ''),
      admissionDate: claim_details?.admission_date ? new Date(claim_details.admission_date).toLocaleString() : 'Not Available',
      dischargeDate: claim_details?.discharge_date ? new Date(claim_details.discharge_date).toLocaleString() : 'Not Available'
    },

    policy: {
      policyNumber: getValue(policy_details?.policy_number, getValue(claim_details?.member_id, '')),
      schemeName: getValue(policy_details?.scheme_name, getValue(claim_details?.scheme_name, '')),
      policyPeriod: policyPeriod,
      policyStatus: getValue(policy_details?.policy_status, 'Not Available'),
      benefitType: getValue(claim_details?.benefit_name, getValue(claim_details?.claim_type)),
      benefitName: getValue(claim_details?.benefit_name, ''),
      roomCategory: getValue(claim_details?.room_category, ''),
      benefitLimit: activeBenefit?.benefitLimit || 'Not Available',
      benefitBalance: activeBenefit?.balance || 'Not Available'
    },

    document: {
      name: documentName,
      type: documents && documents.length > 0 ? documents[0].file_type.toUpperCase() : 'PDF',
      url: documentUrl,  // Will be null if no valid URL
      fileKey: documents && documents.length > 0 ? documents[0].file_key : 'Not Available',
      details: [
        { label: 'Patient', value: getValue(claim_details?.member_name, '') },
        { label: 'Invoice', value: getValue(invoicesData?.[0]?.invoice_id, '') },
        { label: 'Visit No', value: getValue(claim_details?.visit_number, '') },
        { label: 'Hospital', value: getValue(claim_details?.provider_name, '') },
        { label: 'Date', value: getValue(invoicesData?.[0]?.invoice_date, '') }
      ],
      services: invoicesData?.[0]?.line_items?.map(item => ({
        name: getValue(item.item_name, ''),
        amount: item.request_amount || 0
      })) || [],
      totalAmount: totalRequested
    },

    // All documents array
    documents: transformedDocuments,

    invoices: transformedInvoices,

    // Digitisation tab data
    digitisationData: {
      symptomsByLCT: symptomsByLCT,
      diagnosisByLCT: diagnosisByLCT,
      symptomsByVitraya: vitrayaSymptoms,
      diagnosisByVitraya: vitrayaDiagnoses,
      invoices: transformedInvoices
    },

    // Clinical validation tab data
    clinicalValidationInvoices: transformedInvoices.map(invoice => ({
      ...invoice,
      items: invoice.items.map(item => ({
        medicineName: item.item,
        invQty: item.qty,
        appQty: item.qty,
        unitPrice: item.unit,
        preauthAmt: item.preauth,
        invAmt: item.amount,
        appAmt: item.amount,
        savings: 0,
        invoiceNo: invoice.invoiceNumber,
        category: item.category,
        necessary: item.necessary,
        message: item.message,
        systemReason: item.message, // Map message to systemReason
        editorReason: '' // Initialize empty editor reason
      }))
    })),

    // Review tab data
    reviewData: {
      symptoms: vitrayaSymptoms.map(s => ({ text: s })),
      diagnoses: vitrayaDiagnoses,
      invoices: transformedInvoices.map(invoice => ({
        ...invoice,
        items: invoice.items.map(item => ({
          category: item.category,
          name: item.item,
          qty: item.qty,
          rate: item.unit,
          preauthAmount: item.preauth,
          invoicedAmount: item.amount,
          approvedAmount: item.amount,
          savings: 0,
          status: totalApproved > 0 ? 'Approved' : 'Pending',
          deductionReasons: 'Not Available'
        })),
        totalSavings: totalRequested - totalApproved,
        totalInvoiced: invoice.totalAmount
      })),
      financialSummary: {
        totalInvoiced: totalRequested,
        totalRequested: totalRequested,
        totalApproved: totalApproved,
        totalSavings: totalRequested - totalApproved
      },
      productRules: [], // Product rules not in API
      decision: {
        status: totalApproved > 0 ? 'approved' : 'pending',
        title: totalApproved > 0 ? 'Claim Approved' : 'Pending Decision',
        description: totalApproved > 0
          ? `Claim approved for KES ${totalApproved.toLocaleString()}`
          : 'Awaiting adjudication decision'
      }
    },

    // Additional data from API
    medications: output_data?.medical_info?.medications?.map(med => ({
      name: getValue(med.name, ''),
      dosage: getValue(med.dosage, ''),
      frequency: getValue(med.frequency)
    })) || [],

    labTests: output_data?.medical_info?.lab_tests
      ?.map(test => getValue(test.value))
      .filter(test => test && test !== 'Not Available') || [],

    treatmentDetails: output_data?.medical_info?.treatment_details
      ?.map(treatment => getValue(treatment.value))
      .filter(treatment => treatment && treatment !== 'Not Available') || [],

    // Metadata
    editStatus: getValue(data?.edit_status),
    outputSource: getValue(data?.outout_source),
    qrData: data?.qr_data || 'Not Available',
    checklistData: data?.checklist_data || 'Not Available'
  }
}
