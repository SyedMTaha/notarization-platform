'use client';

import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const PassportApplicationForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    applicantType: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    currentAddress: '',
    passportType: '',
    emergencyContact: '',
    ...formData
  });

  const [isValid, setIsValid] = useState(false);

  // Update parent component when local form data changes
  useEffect(() => {
    onFormDataChange(localFormData);
  }, [localFormData, onFormDataChange]);

  // Validate form
  useEffect(() => {
    const requiredFields = [
      'applicantType', 
      'firstName', 
      'lastName', 
      'dateOfBirth', 
      'nationality', 
      'passportType'
    ];
    const valid = requiredFields.every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceed = () => {
    if (isValid) {
      onProceed();
    }
  };

  const applicantTypeOptions = [
    { value: 'new', label: 'New Passport Application' },
    { value: 'renewal', label: 'Passport Renewal' },
    { value: 'replacement', label: 'Lost/Damaged Passport Replacement' }
  ];

  const passportTypeOptions = [
    { value: 'regular', label: 'Regular Passport' },
    { value: 'official', label: 'Official Passport' },
    { value: 'diplomatic', label: 'Diplomatic Passport' }
  ];

  const nationalityOptions = [
    { value: 'GY', label: 'Guyanese' },
    { value: 'TT', label: 'Trinidadian and Tobagonian' },
    { value: 'BB', label: 'Barbadian' },
    { value: 'JM', label: 'Jamaican' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <FormWrapper
      title="Passport Application Form"
      subtitle="Please provide the required information for your passport application"
      onProceed={handleProceed}
      isValid={isValid}
    >
      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Application Type"
            type="select"
            value={localFormData.applicantType}
            onChange={handleFieldChange('applicantType')}
            options={applicantTypeOptions}
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Passport Type"
            type="select"
            value={localFormData.passportType}
            onChange={handleFieldChange('passportType')}
            options={passportTypeOptions}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="First Name"
            value={localFormData.firstName}
            onChange={handleFieldChange('firstName')}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Last Name"
            value={localFormData.lastName}
            onChange={handleFieldChange('lastName')}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Date of Birth"
            type="date"
            value={localFormData.dateOfBirth}
            onChange={handleFieldChange('dateOfBirth')}
            required
          />
        </div>
        <div className="col-md-6">
          <FormField
            label="Place of Birth"
            value={localFormData.placeOfBirth}
            onChange={handleFieldChange('placeOfBirth')}
            placeholder="City, Country"
          />
        </div>
      </div>

      <FormField
        label="Nationality"
        type="select"
        value={localFormData.nationality}
        onChange={handleFieldChange('nationality')}
        options={nationalityOptions}
        required
      />

      <FormField
        label="Current Address"
        type="textarea"
        value={localFormData.currentAddress}
        onChange={handleFieldChange('currentAddress')}
        placeholder="Enter your current residential address"
      />

      <FormField
        label="Emergency Contact"
        value={localFormData.emergencyContact}
        onChange={handleFieldChange('emergencyContact')}
        placeholder="Name and phone number of emergency contact"
      />
    </FormWrapper>
  );
};

export default PassportApplicationForm;
