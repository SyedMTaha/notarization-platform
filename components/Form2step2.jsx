'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FormProgressSidebar from './FormProgressSidebar';
import { saveFormData, getFormData } from '@/utils/formStorage';

const documentTypes = [
  {
    id: 'power-of-attorney',
    icon: '/assets/v3/img/form-img01.png',
    title: 'Power of Attorney',
    selected: false
  },
  {
    id: 'last-will',
    icon: '/assets/v3/img/form-img02.png',
    title: 'Last Will & Testament',
    selected: false
  },
  {
    id: 'agreement-of-sale',
    icon: '/assets/v3/img/form-img03.png',
    title: 'Agreement of Sale',
    selected: false
  },
  {
    id: 'lease-agreement',
    icon: '/assets/v3/img/form-img04.png',
    title: 'Lease Agreement',
    selected: false
  },
  {
    id: 'promissory-note',
    icon: '/assets/v3/img/form-img05.png',
    title: 'Promissory Note',
    selected: false
  },
  {
    id: 'passport-application',
    icon: '/assets/v3/img/form-img06.png',
    title: 'Passport Application',
    selected: false
  },
  {
    id: 'affidavit-of-identity',
    icon: '/assets/v3/img/form-img07.png',
    title: 'Affidavit Of Identity',
    selected: false
  },
  {
    id: 'property-management',
    icon: '/assets/v3/img/form-img08.png',
    title: 'Property Management Agreement',
    selected: false
  },
  {
    id: 'custom-document',
    icon: '/assets/v3/img/form-img09.png',
    title: 'Upload your own Document',
    selected: false
  }
];

const Form2step2 = () => {
  const router = useRouter();
  const t = useTranslations();
  const [selectedDocument, setSelectedDocument] = React.useState(null);

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = getFormData().step2;
    if (savedData && savedData.documentType) {
      setSelectedDocument(savedData.documentType);
    }
  }, []);

  const handleDocumentSelect = (documentId) => {
    setSelectedDocument(documentId);
    // Save to localStorage
    saveFormData(2, {
      documentType: documentId
    });
  };

  const handleNext = () => {
    if (selectedDocument) {
      router.push('/form2-page3');
    } else {
      // Show error or notification that document selection is required
      alert('Please select a document to proceed');
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1" style={{ marginRight: '320px' }}>
        <div className="mt-4 ml-4">
          <Link legacyBehavior href="/">
            <a>
              <img
                src="/assets/images/logos/logo.png"
                style={{ height: '70px' }}
                alt="Logo"
                title="Logo"
              />
            </a>
          </Link>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="form-card bg-white p-4 rounded-3">
                {/* Form Header */}
                <div className="text-center mb-5">
                  <h2 style={{ color: '#2D3748', fontSize: '28px', fontWeight: '600' }}>{t('form2_step2_title')}</h2>
                  <p style={{ color: '#718096', fontSize: '16px', marginTop: '8px' }}>{t('form2_step2_subtitle')}</p>
                </div>

                <div className="form-content">
                  <div className="row g-4">
                    {documentTypes.map((doc) => (
                      <div key={doc.id} className="col-md-4">
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDocumentSelect(doc.id);
                          }}
                          className="document-card"
                          style={{
                            cursor: 'pointer',
                            border: selectedDocument === doc.id ? '2px solid #274171' : '1px solid #E2E8F0',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            padding: '20px',
                            backgroundColor: selectedDocument === doc.id ? '#F7FAFC' : '#FFFFFF',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            minHeight: '160px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                        >
                          <div 
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '15px'
                            }}
                          >
                            <img
                              src={doc.icon}
                              alt={doc.title}
                              style={{ 
                                width: '40px', 
                                height: '40px',
                                objectFit: 'contain',
                                pointerEvents: 'none'
                              }}
                            />
                            <h5 
                              style={{
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#2D3748',
                                textAlign: 'center',
                                pointerEvents: 'none'
                              }}
                            >
                              {doc.title}
                            </h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form Actions */}
                  <div className="actions">
                    <div className="d-flex justify-content-between align-items-center mt-5" style={{ paddingBottom: '5px' }}>
                      <Link href="/forms2" className="text-decoration-none">
                        <span
                          className="btn"
                          style={{ 
                            backgroundColor: "#274171",
                            color: 'white',
                            padding: '10px 30px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginRight: '465px',
                            marginBottom: '-170px',
                            position: 'relative',
                            left: '20px'
                          }}
                        >
                          <i className="fa fa-arrow-left"></i> Back
                        </span>
                      </Link>
                      <span
                        className="btn"
                        style={{ 
                          backgroundColor: "#274171",
                          color: 'white',
                          padding: '10px 30px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '-170px',
                          cursor: 'pointer',
                          position: 'relative',
                          right: '20px'
                        }}
                        onClick={handleNext}
                      >
                        Next <i className="fa fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        width: '300px', 
        position: 'fixed', 
        right: 0, 
        top: 0, 
        height: '100vh',
        borderLeft: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: '#091534'
      }}>
        <FormProgressSidebar currentStep={2} />
      </div>
    </div>
  );
};

export default Form2step2;
