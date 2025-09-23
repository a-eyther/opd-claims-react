import React from 'react';
import { AlertTriangle, Shield, User, FileText, DollarSign, Calendar, XCircle, CheckCircle } from 'lucide-react';

const FraudAlerts = ({ 
  claimData, 
  billItems = [], 
  hospitalTrustScore = 85, 
  patientTrustScore = 90,
  className = "" 
}) => {
  // Fraud detection algorithms
  const detectFraudPatterns = () => {
    const alerts = [];

    // 1. Multiple invoice validation
    if (billItems.length > 0) {
      const invoiceNumbers = [...new Set(billItems.map(item => item.invoiceNumber))];
      const invoiceDates = [...new Set(billItems.map(item => item.itemDate))];
      
      if (invoiceNumbers.length > 1) {
        if (invoiceDates.length > 1) {
          alerts.push({
            type: 'multiple_invoices',
            severity: 'high',
            title: 'Multiple Invoice Dates',
            message: `${invoiceNumbers.length} different invoice numbers with different dates detected`,
            icon: <FileText size={16} />,
            color: 'red',
            recommendation: 'Verify all invoices belong to the same visit and patient'
          });
        } else {
          alerts.push({
            type: 'multiple_invoices',
            severity: 'medium',
            title: 'Multiple Invoice Numbers',
            message: `${invoiceNumbers.length} different invoice numbers found for same date`,
            icon: <FileText size={16} />,
            color: 'yellow',
            recommendation: 'Confirm if multiple invoices are legitimate for single visit'
          });
        }
      }
    }

    // 2. Amount anomaly detection
    if (billItems.length > 0) {
      const amounts = billItems.map(item => item.invoicedAmount || 0);
      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
      const avgItemAmount = totalAmount / amounts.length;
      
      // Flag unusually high amounts
      const highValueItems = billItems.filter(item => (item.invoicedAmount || 0) > avgItemAmount * 3);
      if (highValueItems.length > 0) {
        alerts.push({
          type: 'amount_anomaly',
          severity: 'medium',
          title: 'High-Value Items Detected',
          message: `${highValueItems.length} items significantly above average cost`,
          icon: <DollarSign size={16} />,
          color: 'orange',
          recommendation: 'Review high-value items for medical necessity and pricing accuracy'
        });
      }

      // Flag claims above typical thresholds
      if (totalAmount > 10000) {
        alerts.push({
          type: 'high_value_claim',
          severity: 'high',
          title: 'High-Value Claim',
          message: `Total claim amount (${totalAmount.toLocaleString()}) exceeds normal thresholds`,
          icon: <DollarSign size={16} />,
          color: 'red',
          recommendation: 'Requires additional review and documentation verification'
        });
      }
    }

    // 3. Date-based anomalies
    if (claimData?.visitDate && billItems.length > 0) {
      const visitDate = new Date(claimData.visitDate);
      const futureDateItems = billItems.filter(item => {
        const itemDate = new Date(item.itemDate);
        return itemDate > visitDate;
      });

      if (futureDateItems.length > 0) {
        alerts.push({
          type: 'date_mismatch',
          severity: 'high',
          title: 'Future-Dated Items',
          message: `${futureDateItems.length} items dated after visit date`,
          icon: <Calendar size={16} />,
          color: 'red',
          recommendation: 'Verify item dates are correct and correspond to actual visit'
        });
      }
    }

    // 4. Trust score alerts
    if (hospitalTrustScore < 60) {
      alerts.push({
        type: 'hospital_trust',
        severity: 'high',
        title: 'Low Hospital Trust Score',
        message: `Hospital trust score: ${hospitalTrustScore}% (Below threshold)`,
        icon: <Shield size={16} />,
        color: 'red',
        recommendation: 'Enhanced scrutiny required - hospital has history of issues'
      });
    } else if (hospitalTrustScore < 75) {
      alerts.push({
        type: 'hospital_trust',
        severity: 'medium',
        title: 'Medium Hospital Trust Score',
        message: `Hospital trust score: ${hospitalTrustScore}% (Moderate risk)`,
        icon: <Shield size={16} />,
        color: 'yellow',
        recommendation: 'Standard verification procedures recommended'
      });
    }

    if (patientTrustScore < 70) {
      alerts.push({
        type: 'patient_trust',
        severity: 'medium',
        title: 'Patient Risk Indicator',
        message: `Patient trust score: ${patientTrustScore}% (Review recommended)`,
        icon: <User size={16} />,
        color: 'orange',
        recommendation: 'Review patient claim history and patterns'
      });
    }

    // 5. Pattern-based detection
    const medicationItems = billItems.filter(item => 
      item.category === 'Medication' || item.itemName.toLowerCase().includes('tablet') || 
      item.itemName.toLowerCase().includes('syrup') || item.itemName.toLowerCase().includes('capsule')
    );

    if (medicationItems.length > 5) {
      alerts.push({
        type: 'excessive_medications',
        severity: 'medium',
        title: 'High Medication Count',
        message: `${medicationItems.length} medications prescribed in single visit`,
        icon: <AlertTriangle size={16} />,
        color: 'yellow',
        recommendation: 'Verify medical necessity for multiple medications'
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const fraudAlerts = detectFraudPatterns();
  const criticalAlerts = fraudAlerts.filter(alert => alert.severity === 'high');
  const hasAlerts = fraudAlerts.length > 0;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityIconColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Fraud Detection Summary */}
      <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className={hasAlerts ? 'text-red-500' : 'text-green-500'} size={20} />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Fraud Detection</h3>
            <p className="text-xs text-gray-600">
              {hasAlerts 
                ? `${fraudAlerts.length} potential issues detected (${criticalAlerts.length} critical)`
                : 'No fraud indicators detected'
              }
            </p>
          </div>
        </div>
        
        {/* Trust Scores */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Hospital</div>
            <div className={`font-medium ${hospitalTrustScore >= 75 ? 'text-green-600' : hospitalTrustScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {hospitalTrustScore}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Patient</div>
            <div className={`font-medium ${patientTrustScore >= 80 ? 'text-green-600' : patientTrustScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {patientTrustScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Alerts */}
      {hasAlerts && (
        <div className="space-y-2">
          {fraudAlerts.map((alert, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={getSeverityIconColor(alert.severity)}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs mb-2">{alert.message}</p>
                  <div className="bg-white bg-opacity-50 rounded p-2 text-xs">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Alerts State */}
      {!hasAlerts && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
          <h4 className="text-sm font-medium text-green-800 mb-1">All Clear</h4>
          <p className="text-xs text-green-700">
            No fraud indicators detected. Claim appears legitimate based on current analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default FraudAlerts;