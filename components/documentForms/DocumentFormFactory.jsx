'use client';

import React from 'react';
import PowerOfAttorneyForm from './PowerOfAttorneyForm';
import LastWillTestamentForm from './LastWillTestamentForm';
import AgreementOfSaleForm from './AgreementOfSaleForm';
import LeaseAgreementForm from './LeaseAgreementForm';
import PromissoryNoteForm from './PromissoryNoteForm';
import PassportApplicationForm from './PassportApplicationForm';
import AffidavitOfIdentityForm from './AffidavitOfIdentityForm';
import PropertyManagementForm from './PropertyManagementForm';
import CustomDocumentForm from './CustomDocumentForm';

const DocumentFormFactory = ({ documentType, formData, onFormDataChange, onProceed }) => {
  const getFormComponent = () => {
    switch (documentType) {
      case 'power-of-attorney':
        return <PowerOfAttorneyForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'last-will':
        return <LastWillTestamentForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'agreement-of-sale':
        return <AgreementOfSaleForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'lease-agreement':
        return <LeaseAgreementForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'promissory-note':
        return <PromissoryNoteForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'passport-application':
        return <PassportApplicationForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'affidavit-of-identity':
        return <AffidavitOfIdentityForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'property-management':
        return <PropertyManagementForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      case 'custom-document':
        return <CustomDocumentForm 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          onProceed={onProceed}
        />;
      default:
        return null;
    }
  };

  if (!documentType) return null;

  return (
    <div className="document-form-container" style={{
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      {getFormComponent()}
    </div>
  );
};

export default DocumentFormFactory;
