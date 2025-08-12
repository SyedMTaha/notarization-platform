'use client';
import React, { useState, useEffect } from 'react';
import FormWrapper, { FormField } from '../shared/FormWrapper';

const AgreementOfSaleForm = ({ formData = {}, onFormDataChange, onProceed }) => {
  const [localFormData, setLocalFormData] = useState({
    sellerName: '', buyerName: '', propertyAddress: '', salePrice: '', ...formData
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => { onFormDataChange(localFormData); }, [localFormData, onFormDataChange]);
  useEffect(() => {
    const valid = ['sellerName', 'buyerName', 'propertyAddress', 'salePrice'].every(field => localFormData[field]);
    setIsValid(valid);
  }, [localFormData]);

  const handleFieldChange = (field) => (e) => {
    setLocalFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <FormWrapper title="Agreement of Sale Form" onProceed={() => isValid && onProceed()} isValid={isValid}>
      <div className="row">
        <div className="col-md-6">
          <FormField label="Seller Name" value={localFormData.sellerName} onChange={handleFieldChange('sellerName')} required />
        </div>
        <div className="col-md-6">
          <FormField label="Buyer Name" value={localFormData.buyerName} onChange={handleFieldChange('buyerName')} required />
        </div>
      </div>
      <FormField label="Property Address" value={localFormData.propertyAddress} onChange={handleFieldChange('propertyAddress')} required />
      <FormField label="Sale Price" type="number" value={localFormData.salePrice} onChange={handleFieldChange('salePrice')} required />
    </FormWrapper>
  );
};

export default AgreementOfSaleForm;
