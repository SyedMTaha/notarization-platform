'use client';
import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const AffidavitOfIdentityForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    affiantName: '', currentAddress: '', dateOfBirth: '', identificationNumber: '', purposeOfAffidavit: '', ...formData
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => { onFormDataChange(localFormData); }, [localFormData, onFormDataChange]);
  useEffect(() => {
    const valid = ['affiantName', 'currentAddress', 'dateOfBirth'].every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <FormWrapper title="Affidavit of Identity Form" onProceed={() => isValid && onProceed()} isValid={isValid}>
      <FormField label="Affiant Name (Your Name)" value={localFormData.affiantName} onChange={handleFieldChange('affiantName')} required />
      <FormField label="Current Address" type="textarea" value={localFormData.currentAddress} onChange={handleFieldChange('currentAddress')} required />
      <div className="row">
        <div className="col-md-6">
          <FormField label="Date of Birth" type="date" value={localFormData.dateOfBirth} onChange={handleFieldChange('dateOfBirth')} required />
        </div>
        <div className="col-md-6">
          <FormField label="ID Number" value={localFormData.identificationNumber} onChange={handleFieldChange('identificationNumber')} />
        </div>
      </div>
      <FormField label="Purpose of Affidavit" type="textarea" value={localFormData.purposeOfAffidavit} onChange={handleFieldChange('purposeOfAffidavit')} />
    </FormWrapper>
  );
};

export default AffidavitOfIdentityForm;
