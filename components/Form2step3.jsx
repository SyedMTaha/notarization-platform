"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FormProgressSidebar from './FormProgressSidebar';
import { saveFormData, getFormData } from '@/utils/formStorage';
import { db } from '@/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

const Form2step3 = () => {
  const router = useRouter();
  const t = useTranslations();
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = getFormData().step3;
    if (savedData) {
      if (savedData.signingOption) {
        setSelectedOption(savedData.signingOption);
      }
      if (savedData.uploadedFile) {
        setUploadedFile(savedData.uploadedFile);
      }
    }
  }, []);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    // Save to localStorage
    saveFormData(3, {
      signingOption: optionId,
      uploadedFile: uploadedFile
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Save to localStorage
      saveFormData(3, {
        signingOption: selectedOption,
        uploadedFile: file
      });
    }
  };

  const uploadFileToCloudinary = async (file, folder = '') => {
    if (!file) return null;

    try {
      console.log('Starting Cloudinary upload for file:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'WiScribbles');
      formData.append('cloud_name', 'dvhrg7bkp');

      // Optional: Add folder structure
      if (folder) {
        formData.append('folder', folder);
      }

      console.log('Sending request to Cloudinary...');
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvhrg7bkp/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary upload failed:', errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Cloudinary upload successful:', data.secure_url);
      return data.secure_url;

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  };

  const createNewSubmission = async () => {
    try {
      const formData = getFormData();
      const newSubmission = {
        step1: formData.step1 || {},
        step2: formData.step2 || {},
        step3: {
          signingOption: selectedOption,
          documentUrl: null,
          uploadedAt: new Date().toISOString()
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'formSubmissions'), newSubmission);
      console.log('New submission created with ID:', docRef.id);
      
      // Save the submission ID to localStorage
      saveFormData('submissionId', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating new submission:', error);
      throw new Error('Failed to create new submission');
    }
  };

  const handleNext = async () => {
    if (!selectedOption) {
      alert('Please select a signing option to proceed');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      let documentUrl = null;
      if (uploadedFile) {
        console.log('Starting document upload process...');
        try {
          documentUrl = await uploadFileToCloudinary(uploadedFile, 'documents');
          console.log('Document uploaded successfully:', documentUrl);
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          throw new Error(`Document upload failed: ${uploadError.message}`);
        }
      }

      // Get the submission ID from localStorage or create a new submission
      const formData = getFormData();
      let submissionId = formData.submissionId;

      if (!submissionId) {
        console.log('No submission ID found, creating new submission...');
        submissionId = await createNewSubmission();
      }

      console.log('Updating Firestore with submission ID:', submissionId);
      // Update Firestore with the new data
      const submissionRef = doc(db, 'formSubmissions', submissionId);
      await updateDoc(submissionRef, {
        step3: {
          signingOption: selectedOption,
          documentUrl: documentUrl,
          uploadedAt: new Date().toISOString()
        }
      });

      console.log('Firestore update successful');
      // Save to localStorage
      saveFormData(3, {
        signingOption: selectedOption,
        documentUrl: documentUrl,
        uploadedAt: new Date().toISOString()
      });

      // Navigate to next step
      router.push('/form2-page4');
    } catch (error) {
      console.error('Error in handleNext:', error);
      setError(error.message || 'Failed to save your document. Please try again.');
    } finally {
      setIsUploading(false);
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
                <div className="text-center mb-5">
                  <h2 style={{ color: '#2D3748', fontSize: '28px', fontWeight: '600' }}>{t('form2_step3_signature_notarization_title')}</h2>
                  <p style={{ color: '#718096', fontSize: '16px', marginTop: '8px' }}>{t('form2_step3_choose_signature_method')}</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="row justify-content-center mb-5">
                  <div className="col-md-8">
                    <div className="d-flex justify-content-center gap-4">
                      {/* E-Sign Option */}
                      <div
                        className={`card signing-option ${selectedOption === 'esign' ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect('esign')}
                        style={{
                          cursor: 'pointer',
                          width: '200px',
                          border: selectedOption === 'esign' ? '2px solid #274171' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          backgroundColor: selectedOption === 'esign' ? '#F7FAFC' : '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="card-body text-center p-4">
                          <img
                            src="/assets/v3/img/form-img11.png"
                            alt="E-Sign"
                            style={{ width: '48px', height: '48px', marginBottom: '1rem' }}
                          />
                          <h5 className="card-title">E-Sign</h5>
                        </div>
                      </div>

                      {/* Connect to Notary Option */}
                      <div
                        className={`card signing-option ${selectedOption === 'notary' ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect('notary')}
                        style={{
                          cursor: 'pointer',
                          width: '200px',
                          border: selectedOption === 'notary' ? '2px solid #274171' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          backgroundColor: selectedOption === 'notary' ? '#F7FAFC' : '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="card-body text-center p-4">
                          <img
                            src="/assets/v3/img/form-img12.png"
                            alt="Connect to a Notary"
                            style={{ width: '48px', height: '48px', marginBottom: '1rem' }}
                          />
                          <h5 className="card-title">Connect to a Notary</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="upload-section p-4" style={{ 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      backgroundColor: selectedOption ? '#FFFFFF' : '#F7F8FA',
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      opacity: selectedOption ? 1 : 0.7,
                      pointerEvents: selectedOption ? 'auto' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <input
                        type="file"
                        id="document-upload"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        disabled={!selectedOption || isUploading}
                      />
                      <label 
                        htmlFor="document-upload" 
                        style={{ 
                          cursor: selectedOption && !isUploading ? 'pointer' : 'not-allowed', 
                          textAlign: 'center' 
                        }}
                      >
                        <img
                          src="/assets/v3/img/form-img09.png"
                          alt="Upload"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            marginBottom: '1rem',
                            opacity: selectedOption ? 1 : 0.7
                          }}
                        />
                        <h5 style={{ color: selectedOption ? '#2D3748' : '#718096' }}>Upload Document</h5>
                        {uploadedFile ? (
                          <p className="text-success">File uploaded: {uploadedFile.name}</p>
                        ) : (
                          <p style={{ color: '#718096', fontSize: '14px' }}>
                            {selectedOption 
                              ? 'Click to upload or drag and drop your document here'
                              : 'Please select a signing option above to enable upload'
                            }
                          </p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="actions">
                  <div className="d-flex justify-content-between align-items-center mt-5">
                    <Link href="/form2-page2" className="text-decoration-none">
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
                    <button
                      onClick={handleNext}
                      className="btn"
                      disabled={isUploading}
                      style={{
                        backgroundColor: '#274171',
                        color: 'white',
                        padding: '10px 30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '-170px',
                        position: 'relative',
                        right: '20px',
                        opacity: isUploading ? 0.7 : 1,
                        cursor: isUploading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isUploading ? 'Uploading...' : 'Next'} <i className="fa fa-arrow-right"></i>
                    </button>
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
        <FormProgressSidebar currentStep={3} />
      </div>
    </div>
  );
};

export default Form2step3;
