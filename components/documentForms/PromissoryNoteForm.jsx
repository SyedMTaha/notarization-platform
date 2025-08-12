'use client';
import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const PromissoryNoteForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    borrowerName: '', lenderName: '', principalAmount: '', interestRate: '', maturityDate: '', ...formData
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => { onFormDataChange(localFormData); }, [localFormData, onFormDataChange]);
  useEffect(() => {
    const valid = ['borrowerName', 'lenderName', 'principalAmount'].every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <FormWrapper title="Promissory Note Form" onProceed={() => isValid && onProceed()} isValid={isValid}>
      <div className="row">
        <div className="col-md-6">
          <FormField label="Borrower Name" value={localFormData.borrowerName} onChange={handleFieldChange('borrowerName')} required />
        </div>
        <div className="col-md-6">
          <FormField label="Lender Name" value={localFormData.lenderName} onChange={handleFieldChange('lenderName')} required />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <FormField label="Principal Amount" type="number" value={localFormData.principalAmount} onChange={handleFieldChange('principalAmount')} required />
        </div>
        <div className="col-md-4">
          <FormField label="Interest Rate %" type="number" value={localFormData.interestRate} onChange={handleFieldChange('interestRate')} />
        </div>
        <div className="col-md-4">
          <FormField label="Maturity Date" type="date" value={localFormData.maturityDate} onChange={handleFieldChange('maturityDate')} />
        </div>
      </div>
    </FormWrapper>
  );
};

export default PromissoryNoteForm;
