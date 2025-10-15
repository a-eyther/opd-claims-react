/**
 * Build PATCH payload for extraction data updates
 * Handles invoice modifications, invalidations, and medical info updates
 *
 * @param {Object} rawApiResponse - Original API response from extraction-data endpoint
 * @param {Array} modifiedInvoices - Array of modified invoices from UI
 * @param {Object} validatedInvoices - Map of validated invoice indices
 * @param {Object} invalidInvoices - Map of invalidated invoice indices
 * @param {Array} selectedSymptoms - Array of selected symptom strings
 * @param {Array} selectedDiagnoses - Array of selected diagnosis objects {text, code}
 * @param {string} originalInvoiceKey - Original invoice key from API response (e.g., 'invoices', '?2_invoices')
 * @returns {Object} Payload for PATCH request
 */
export const buildExtractionPatchPayload = (
  rawApiResponse,
  modifiedInvoices,
  validatedInvoices = {},
  invalidInvoices = {},
  selectedSymptoms = [],
  selectedDiagnoses = [],
  originalInvoiceKey = 'invoices'
) => {
  if (!rawApiResponse?.data?.output_data) {
    console.error('Invalid raw API response:', rawApiResponse)
    return null
  }

  const originalOutputData = rawApiResponse.data.output_data

  // Filter out invalid invoices and transform modified invoices back to API format
  const validInvoices = modifiedInvoices
    .map((invoice, index) => {
      // Skip invalid invoices
      if (invalidInvoices[index]) {
        return null
      }

      // Transform invoice items back to API format
      const lineItems = invoice.items.map(item => ({
        item_name: item.item,
        item_category: item.category,
        unit: item.qty,
        unit_price: item.unit,
        request_amount: item.amount,
        necessary: item.necessary || 'YES',
        message: item.message || ''
      }))

      return {
        invoice_id: invoice.invoiceNumber,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        invoice_total_amount: invoice.totalAmount,
        line_items: lineItems
      }
    })
    .filter(invoice => invoice !== null) // Remove nulls (invalid invoices)

  // Update medical info with selected symptoms and diagnoses
  const updatedMedicalInfo = {
    ...(originalOutputData.medical_info || {}),
    symptoms: selectedSymptoms.map(symptom => ({
      value: symptom
    })),
    diagnosis: selectedDiagnoses.map(diagnosis => ({
      diagnosis_name: diagnosis.text,
      icd_code: diagnosis.code || ''
    }))
  }

  // Calculate updated billing details from valid invoices
  const totalRequestAmount = validInvoices.reduce((sum, invoice) => {
    return sum + (invoice.invoice_total_amount || 0)
  }, 0)

  // Build bill_breakup array from all line items across all valid invoices
  const billBreakup = []
  validInvoices.forEach(invoice => {
    invoice.line_items?.forEach(item => {
      billBreakup.push({
        item_name: item.item_name,
        item_category: item.item_category,
        unit: item.unit,
        unit_price: item.unit_price,
        request_amount: item.request_amount,
        necessary: item.necessary,
        message: item.message,
        invoice_number: invoice.invoice_number
      })
    })
  })

  const updatedBillingDetails = {
    ...(originalOutputData.billing_details || {}),
    total_req_amount: {
      value: totalRequestAmount,
      confidence_score: originalOutputData.billing_details?.total_req_amount?.confidence_score || 0
    },
    bill_breakup: billBreakup
  }

  // Build the final payload with only output_data
  // Use the original invoice key to preserve the API response structure
  const payload = {
    output_data: {
      ...originalOutputData,
      medical_info: updatedMedicalInfo,
      billing_details: updatedBillingDetails,
      [originalInvoiceKey]: validInvoices
    },
    trigger_readjudication: true
  }

  return payload
}
