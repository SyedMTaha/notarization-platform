'use client';

import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const PowerOfAttorneyForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    principalName: '',
    attorneyName: '',
    powersGranted: '',
    durationType: '',
    startDate: '',
    endDate: '',
    witnessName: '',
    specificInstructions: '',
    ...formData
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    onFormDataChange(localFormData);
  }, [localFormData, onFormDataChange]);

  useEffect(() => {
    const requiredFields = ['principalName', 'attorneyName', 'powersGranted', 'durationType'];
    const valid = requiredFields.every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const durationTypeOptions = [
    { value: 'general', label: 'General Power of Attorney' },
    { value: 'limited', label: 'Limited Power of Attorney' },
    { value: 'durable', label: 'Durable Power of Attorney' },
    { value: 'springing', label: 'Springing Power of Attorney' }
  ];

  const powersOptions = [
    { value: 'financial', label: 'Financial Affairs' },
    { value: 'property', label: 'Property Management' },
    { value: 'healthcare', label: 'Healthcare Decisions' },
    { value: 'legal', label: 'Legal Matters' },
    { value: 'business', label: 'Business Operations' }
  ];

  return (
    <FormWrapper
      title="Power of Attorney Form"
      subtitle="Create a legal document to authorize someone to act on your behalf"
      onProceed={() => isValid && onProceed()}
      isValid={isValid}
    >
      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Principal (Your Name)"
            value={localFormData.principalName}
            onChange={handleFieldChange('principalName')}
            placeholder="Full legal name of person granting power"
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Attorney-in-Fact Name"
            value={localFormData.attorneyName}
            onChange={handleFieldChange('attorneyName')}
            placeholder="Full name of person receiving power"
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Type of Power of Attorney"
            type="select"
            value={localFormData.durationType}
            onChange={handleFieldChange('durationType')}
            options={durationTypeOptions}
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Powers Granted"
            type="select"
            value={localFormData.powersGranted}
            onChange={handleFieldChange('powersGranted')}
            options={powersOptions}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Effective Start Date"
            type="date"
            value={localFormData.startDate}
            onChange={handleFieldChange('startDate')}
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Expiration Date (if applicable)"
            type="date"
            value={localFormData.endDate}
            onChange={handleFieldChange('endDate')}
          />
        </div>
      </div>

      <FormField
        label="Witness Name"
        value={localFormData.witnessName}
        onChange={handleFieldChange('witnessName')}
        placeholder="Full name of witness (if required)"
      />

      <FormField
        label="Specific Instructions or Limitations"
        type="textarea"
        value={localFormData.specificInstructions}
        onChange={handleFieldChange('specificInstructions')}
        placeholder="Enter any specific instructions or limitations for the attorney-in-fact"
      />
    </FormWrapper>
  );
};

export default PowerOfAttorneyForm;
