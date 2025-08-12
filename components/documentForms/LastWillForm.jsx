'use client';

import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const LastWillForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    testatorName: '',
    executorName: '',
    beneficiaryName: '',
    assetDescription: '',
    witnessName1: '',
    witnessName2: '',
    specialInstructions: '',
    ...formData
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    onFormDataChange(localFormData);
  }, [localFormData, onFormDataChange]);

  useEffect(() => {
    const requiredFields = ['testatorName', 'executorName', 'beneficiaryName'];
    const valid = requiredFields.every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <FormWrapper
      title="Last Will & Testament Form"
      subtitle="Create your legal will document"
      onProceed={() => isValid && onProceed()}
      isValid={isValid}
    >
      <FormField
        label="Testator Name (Your Name)"
        value={localFormData.testatorName}
        onChange={handleFieldChange('testatorName')}
        placeholder="Your full legal name"
        required
      />
      
      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Executor Name"
            value={localFormData.executorName}
            onChange={handleFieldChange('executorName')}
            placeholder="Person to execute your will"
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Primary Beneficiary"
            value={localFormData.beneficiaryName}
            onChange={handleFieldChange('beneficiaryName')}
            placeholder="Main beneficiary name"
            required
          />
        </div>
      </div>

      <FormField
        label="Asset Description"
        type="textarea"
        value={localFormData.assetDescription}
        onChange={handleFieldChange('assetDescription')}
        placeholder="Describe assets to be distributed"
      />

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Witness 1 Name"
            value={localFormData.witnessName1}
            onChange={handleFieldChange('witnessName1')}
            placeholder="First witness full name"
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Witness 2 Name"
            value={localFormData.witnessName2}
            onChange={handleFieldChange('witnessName2')}
            placeholder="Second witness full name"
          />
        </div>
      </div>

      <FormField
        label="Special Instructions"
        type="textarea"
        value={localFormData.specialInstructions}
        onChange={handleFieldChange('specialInstructions')}
        placeholder="Any special instructions or conditions"
      />
    </FormWrapper>
  );
};

export default LastWillForm;
