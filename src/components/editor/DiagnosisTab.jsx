import React from 'react';
import { AlertCircle } from 'lucide-react';
import useEditorStore from '../../store/useEditorStore';
import { mockData } from '../../utils/mockData';

const DiagnosisTab = () => {
  const { selectedDiagnosis, selectedSymptoms, setSelectedDiagnosis, setSelectedSymptoms } = useEditorStore();

  const handleSymptomToggle = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleDiagnosisToggle = (code) => {
    if (selectedDiagnosis.includes(code)) {
      setSelectedDiagnosis(selectedDiagnosis.filter(d => d !== code));
    } else {
      setSelectedDiagnosis([...selectedDiagnosis, code]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium">Diagnosis/Treatment Details</h3>
      
      <div>
        <label className="label">Symptoms</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {mockData.symptoms.map((symptom) => (
            <label key={symptom} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="w-3.5 h-3.5"
              />
              <span>{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Diagnosis (Select one or more)</label>
        <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
          {mockData.diagnosisCodes.map((diagnosis) => (
            <label key={diagnosis.code} className="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedDiagnosis.includes(diagnosis.code)}
                onChange={() => handleDiagnosisToggle(diagnosis.code)}
                className="w-3.5 h-3.5 mt-0.5"
              />
              <div>
                <span className="font-medium">{diagnosis.code}</span>
                <span className="text-gray-600 ml-2">{diagnosis.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Treatment Provided</label>
        <textarea
          className="input"
          rows="3"
          defaultValue="Prescribed medications for fatty liver management including Cyproheptadine syrup, H-Pylori Kit, and supportive medications. Advised dietary modifications and follow-up after 2 weeks."
        />
      </div>

      <div>
        <label className="label">Prescription Details</label>
        <textarea
          className="input"
          rows="4"
          defaultValue={`1. Cyproheptadine 200ml syrup - 4 bottles
2. Diclofenac/Methyl Salicylate/Menthol/Linseed Gel - 2 tubes
3. H-Pylori Kit - 2 kits
4. Paracetamol 500mg tablet - 100 tablets
5. Rabeprazole 20mg capsule - 30 capsules`}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          Validation Note
        </h4>
        <p className="text-xs text-yellow-700">
          Please ensure that the diagnosis matches the prescribed medications and treatment plan.
          Any discrepancies should be clarified before submission.
        </p>
      </div>
    </div>
  );
};

export default DiagnosisTab;