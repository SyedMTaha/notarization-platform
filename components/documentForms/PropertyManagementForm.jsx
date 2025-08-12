'use client';
import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const PropertyManagementForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    ownerName: '', managerName: '', propertyAddress: '', managementFee: '', contractDuration: '', ...formData
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => { onFormDataChange(localFormData); }, [localFormData, onFormDataChange]);
  useEffect(() => {
    const valid = ['ownerName', 'managerName', 'propertyAddress'].every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <FormWrapper title="Property Management Agreement Form" onProceed={() => isValid && onProceed()} isValid={isValid}>
      <div className="row">
        <div className="col-md-6">
          <FormField label="Property Owner Name" value={localFormData.ownerName} onChange={handleFieldChange('ownerName')} required />
        </div>
        <div className="col-md-6">
          <FormField label="Property Manager Name" value={localFormData.managerName} onChange={handleFieldChange('managerName')} required />
        </div>
      </div>
      <FormField label="Property Address" value={localFormData.propertyAddress} onChange={handleFieldChange('propertyAddress')} required />
      <div className="row">
        <div className="col-md-6">
          <FormField label="Management Fee %" type="number" value={localFormData.managementFee} onChange={handleFieldChange('managementFee')} />
        </div>
        <div className="col-md-6">
          <FormField label="Contract Duration (months)" type="number" value={localFormData.contractDuration} onChange={handleFieldChange('contractDuration')} />
        </div>
      </div>
    </FormWrapper>
  );
};

export default PropertyManagementForm;
