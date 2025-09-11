"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FormProgressSidebar from './FormProgressSidebar';
import { toast } from 'react-hot-toast';
import { getFormData, saveFormData, clearFormData, getSubmissionId } from '@/utils/formStorage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("nWH88iJVBzhSqWLzz");

const Form2step5 = () => {
  const router = useRouter();
  const t = useTranslations();
  const [deliveryMethod, setDeliveryMethod] = useState('download');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [processType, setProcessType] = useState(null); // 'esign' or 'notary'

  // Load saved data when component mounts
  useEffect(() => {
    const loadData = async () => {
      const savedData = getFormData();
      console.log('Initial form data loaded:', savedData);
      if (savedData) {
        setFormData(savedData);
        if (savedData.step5) {
          setDeliveryMethod(savedData.step5.deliveryMethod || 'download');
          setEmail(savedData.step5.email || '');
        }
        
        // Determine the process type from saved data
        const signingOption = savedData.step3?.signingOption;
        if (signingOption) {
          setProcessType(signingOption); // 'esign' or 'notary'
          console.log('Process type detected:', signingOption);
        }
        
        // Try to get submission data from Firebase if available
        const submissionId = getSubmissionId();
        if (submissionId) {
          try {
            const submissionRef = doc(db, 'formSubmissions', submissionId);
            const submissionDoc = await getDoc(submissionRef);
            if (submissionDoc.exists()) {
              const data = submissionDoc.data();
              setSubmissionData({ id: submissionId, ...data });
              
              // Also determine process type from submission data if not already set
              if (!signingOption && data.type) {
                setProcessType(data.type === 'notary' ? 'notary' : 'esign');
              }
              
              console.log('Submission data loaded:', {
                id: submissionId,
                type: data.type,
                status: data.status,
                hasNotarizedDoc: !!data.notarizedDocURL,
                hasApprovedDoc: !!data.approvedDocURL
              });
            }
          } catch (error) {
            console.error('Error fetching submission data:', error);
          }
        }
      }
    };
    
    loadData();
  }, []);

  // Save data when values change
  useEffect(() => {
    if (formData) {
      const step5Data = {
        deliveryMethod,
        email: deliveryMethod === 'email' ? email : ''
      };
      console.log('Saving step 5 data:', step5Data);
      saveFormData(5, step5Data);
    }
  }, [deliveryMethod, email, formData]);

  const sendDocumentByEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!submissionData && !formData) {
      toast.error('Document not available');
      return;
    }

    try {
      setIsDownloading(true);
      
      let documentURL = null;
      let documentType = 'document';
      
      // Determine which document URL to use based on process type and availability
      if (processType === 'notary') {
        // For notary process, prioritize notarized document
        if (submissionData?.notarizedDocURL) {
          documentURL = submissionData.notarizedDocURL;
          documentType = 'notarized document';
          console.log('Using notarized document URL:', documentURL);
        } else if (submissionData?.document?.notarizedUrl) {
          documentURL = submissionData.document.notarizedUrl;
          documentType = 'notarized document';
          console.log('Using notarized document URL from nested document:', documentURL);
        } else if (submissionData?.documentUrl || submissionData?.document?.originalUrl) {
          documentURL = submissionData?.documentUrl || submissionData?.document?.originalUrl;
          documentType = 'document (pending notarization)';
          console.log('Using original document URL (notarization pending):', documentURL);
        }
      } else if (processType === 'esign') {
        // For e-sign process, prioritize approved/signed document
        if (submissionData?.approvedDocURL) {
          documentURL = submissionData.approvedDocURL;
          documentType = 'signed document';
          console.log('Using e-signed document URL:', documentURL);
        } else if (submissionData?.documentUrl) {
          documentURL = submissionData.documentUrl;
          documentType = 'document (pending signature)';
          console.log('Using original document URL (e-sign pending):', documentURL);
        }
      }
      
      // Fallback to any available document URL
      if (!documentURL) {
        if (submissionData?.documentUrl) {
          documentURL = submissionData.documentUrl;
          documentType = 'document';
        } else if (formData?.step3?.documentUrl) {
          documentURL = formData.step3.documentUrl;
          documentType = 'document';
        } else if (formData?.step2?.documentUrl) {
          documentURL = formData.step2.documentUrl;
          documentType = 'document';
        }
      }
      
      if (!documentURL) {
        const errorMessage = processType === 'notary' 
          ? 'Notarized document not found. It may still be processing.'
          : 'Signed document not found. Please complete the signing process.';
        toast.error(errorMessage);
        console.error('No document URL found. Submission data:', submissionData);
        return;
      }
      
      // Validate document URL
      if (!documentURL || !documentURL.startsWith('http')) {
        toast.error('Invalid document URL. Please contact support.');
        console.error('Invalid document URL:', documentURL);
        return;
      }
      
      // Get user information
      const userName = formData?.step1 ? `${formData.step1.firstName || ''} ${formData.step1.lastName || ''}`.trim() : 'User';
      const referenceNumber = submissionData?.referenceNumber || formData?.referenceNumber || `DOC-${Date.now()}`;
      const documentTypeName = formData?.step2?.documentType || 'Document';
      
      // Create download link HTML
      const downloadLinkHTML = `<a href="${documentURL}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #274171; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Download Your ${documentType}</a>`;
      
      // Create detailed message
      const detailedMessage = `
Dear ${userName},

Your ${documentType} is ready for download!

Document Details:
- Type: ${documentTypeName}
- Reference Number: ${referenceNumber}
- Status: ${documentType.includes('signed') ? 'Signed and Ready' : 'Processed'}

You can download your document by clicking the button below or using this direct link:
${documentURL}

If you have any questions, please contact our support team.

Best regards,
WiScribbles Team
      `;
      
      // Prepare comprehensive email template parameters
      const templateParams = {
        // Recipient information
        to_email: email,
        to_name: userName,
        user_name: userName,
        recipient_email: email,
        
        // Document information
        document_url: documentURL,
        document_link: documentURL,
        download_url: documentURL,
        download_link: documentURL,
        document_download_link: downloadLinkHTML,
        
        // Reference and tracking
        reference_number: referenceNumber,
        ref_number: referenceNumber,
        reference: referenceNumber,
        tracking_number: referenceNumber,
        
        // Document details
        document_type: documentTypeName,
        document_status: documentType.includes('signed') ? 'Signed and Ready' : 'Processed',
        
        // Email content
        subject: `Your ${documentType} is Ready - Reference: ${referenceNumber}`,
        email_subject: `Your ${documentType} is Ready - Reference: ${referenceNumber}`,
        
        // Message content
        message: detailedMessage,
        email_message: detailedMessage,
        custom_message: detailedMessage,
        
        // Action items
        action_text: `Download ${documentType}`,
        button_text: `Download Document`,
        call_to_action: `Your ${documentType} is ready for download. Click the link above to access it.`,
        
        // Additional template variables that might be needed
        company_name: 'WiScribbles',
        support_email: 'support@wiscribbles.com',
        current_date: new Date().toLocaleDateString(),
        current_year: new Date().getFullYear().toString()
      };

      console.log('=== EMAIL SENDING DEBUG ===');
      console.log('Document URL:', documentURL);
      console.log('Email recipient:', email);
      console.log('Reference number:', referenceNumber);
      console.log('Template parameters:', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        'service_9wu43ho',
        'template_bu0fm8i',
        templateParams,
        'nWH88iJVBzhSqWLzz'
      );

      console.log('EmailJS Response:', response);
      
      if (response.status === 200) {
        toast.success(`Document sent successfully to ${email}! Check your email for the download link.`);
      } else {
        throw new Error('Failed to send email - unexpected response status');
      }
      
    } catch (error) {
      console.error('=== EMAIL SENDING ERROR ===');
      console.error('Error details:', error);
      console.error('Email recipient:', email);
      
      if (error.text) {
        console.error('EmailJS error text:', error.text);
        toast.error(`Failed to send email: ${error.text}`);
      } else {
        toast.error('Failed to send document via email. Please try again or use the download option.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadDocument = async () => {
    if (!submissionData && !formData) {
      toast.error('Document not available for download');
      return;
    }

    try {
      setIsDownloading(true);
      
      let downloadURL = null;
      let fileName = '';
      
      // Determine which document URL to use based on process type
      if (processType === 'notary') {
        // For notary process, prioritize notarized document
        if (submissionData?.notarizedDocURL) {
          downloadURL = submissionData.notarizedDocURL;
          fileName = `notarized_document_${submissionData?.referenceNumber || new Date().toISOString().slice(0, 10)}.pdf`;
          console.log('Downloading notarized document:', downloadURL);
        } else if (submissionData?.document?.notarizedUrl) {
          downloadURL = submissionData.document.notarizedUrl;
          fileName = `notarized_document_${submissionData?.referenceNumber || new Date().toISOString().slice(0, 10)}.pdf`;
          console.log('Downloading notarized document from nested:', downloadURL);
        } else if (submissionData?.documentUrl || submissionData?.document?.originalUrl) {
          downloadURL = submissionData?.documentUrl || submissionData?.document?.originalUrl;
          fileName = `document_pending_notarization_${new Date().toISOString().slice(0, 10)}.pdf`;
          console.log('Downloading original document (notarization pending):', downloadURL);
          toast.warning('Document is pending notarization. Downloading original version.');
        }
      } else if (processType === 'esign') {
        // For e-sign process, prioritize approved/signed document
        if (submissionData?.approvedDocURL) {
          downloadURL = submissionData.approvedDocURL;
          fileName = `signed_document_${new Date().toISOString().slice(0, 10)}.pdf`;
          console.log('Downloading e-signed document:', downloadURL);
        } else if (submissionData?.documentUrl) {
          downloadURL = submissionData.documentUrl;
          fileName = `document_pending_signature_${new Date().toISOString().slice(0, 10)}.pdf`;
          console.log('Downloading original document (e-sign pending):', downloadURL);
          toast.warning('Document is pending signature. Downloading original version.');
        }
      }
      
      // Fallback to any available document URL
      if (!downloadURL) {
        if (submissionData?.documentUrl) {
          downloadURL = submissionData.documentUrl;
          fileName = `document_${new Date().toISOString().slice(0, 10)}.pdf`;
        } else if (formData?.step3?.documentUrl) {
          downloadURL = formData.step3.documentUrl;
          fileName = `document_${new Date().toISOString().slice(0, 10)}.pdf`;
        } else if (formData?.step2?.documentUrl) {
          downloadURL = formData.step2.documentUrl;
          fileName = `document_${new Date().toISOString().slice(0, 10)}.pdf`;
        }
      }
      
      if (!downloadURL) {
        const errorMessage = processType === 'notary' 
          ? 'Notarized document not found. It may still be processing.'
          : 'Signed document not found. Please complete the signing process.';
        toast.error(errorMessage);
        console.error('No document URL found for download. Submission data:', submissionData);
        return;
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = fileName || `document_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Document download initiated from: ${downloadURL}`);
      toast.success('Document download started!');
      
      // Fallback to opening in new tab if download doesn't work
      setTimeout(() => {
        window.open(downloadURL, '_blank');
      }, 500);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    } finally {
      setIsDownloading(false);
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
                {/* Form Header - Dynamic based on process type */}
                <div className="text-center mb-5">
                  <h2 style={{ color: '#2D3748', fontSize: '28px', fontWeight: '600' }}>
                    {processType === 'notary' 
                      ? 'Download Your Notarized Document'
                      : processType === 'esign'
                      ? 'Download Your E-Signed Document'
                      : 'Download Your Document'
                    }
                  </h2>
                  <p style={{ color: '#718096', fontSize: '16px', marginTop: '8px' }}>
                    {processType === 'notary'
                      ? 'Your document has been successfully notarized. Choose how you would like to receive it.'
                      : processType === 'esign'
                      ? 'Your document has been successfully signed. Choose how you would like to receive it.'
                      : 'Your document is ready. Choose how you would like to receive it.'
                    }
                  </p>
                  {submissionData?.referenceNumber && (
                    <p style={{ color: '#4A5568', fontSize: '14px', marginTop: '12px' }}>
                      Reference Number: <strong>{submissionData.referenceNumber}</strong>
                    </p>
                  )}
                </div>

                {/* Delivery Method Selection */}
                <div className="row justify-content-center mb-5">
                  <div className="col-md-8">
                    <div className="d-flex gap-4">
                      <div
                        className={`delivery-option ${deliveryMethod === 'download' ? 'selected' : ''}`}
                        onClick={() => setDeliveryMethod('download')}
                        style={{
                          flex: 1,
                          padding: '20px',
                          border: '2px solid',
                          borderColor: deliveryMethod === 'download' ? '#274171' : '#E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: deliveryMethod === 'download' ? '#F7FAFC' : 'white',
                        }}
                      >
                        <h5 style={{ color: '#2D3748', marginBottom: '10px' }}>{t('Download')}</h5>
                        <p style={{ color: '#718096', margin: 0 }}>{t('Download your document directly')}</p>
                      </div>
                      
                      <div
                        className={`delivery-option ${deliveryMethod === 'email' ? 'selected' : ''}`}
                        onClick={() => setDeliveryMethod('email')}
                        style={{
                          flex: 1,
                          padding: '20px',
                          border: '2px solid',
                          borderColor: deliveryMethod === 'email' ? '#274171' : '#E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: deliveryMethod === 'email' ? '#F7FAFC' : 'white',
                        }}
                      >
                        <h5 style={{ color: '#2D3748', marginBottom: '10px' }}>{t('Email')}</h5>
                        <p style={{ color: '#718096', margin: 0 }}>{t('form2_receive_via_email')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Input (shown only when email delivery is selected) */}
                {deliveryMethod === 'email' && (
                  <div className="row justify-content-center mb-5">
                    <div className="col-md-8">
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#4A5568', fontWeight: '500', marginBottom: '8px' }}>{t('Email Address')}</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="johndoe@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '10px',
                            fontSize: '14px',
                            height: '50px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="actions">
                  <div className="d-flex justify-content-between align-items-center mt-5" style={{ paddingBottom: '5px' }}>
                    <Link href="/form2-page4" className="text-decoration-none">
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
                          left: '150px',
                          border: 'none'
                        }}
                      >
                        <i className="fa fa-arrow-left"></i> {t('Back')}
                      </span>
                    </Link>
                    <button
                      onClick={deliveryMethod === 'email' ? sendDocumentByEmail : downloadDocument}
                      disabled={isDownloading}
                      className="btn"
                      style={{
                        backgroundColor: deliveryMethod === 'email' ? '#274171' : '#274171',
                        color: 'white',
                        padding: '10px 30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '-170px',
                        position: 'relative',
                        right: '20px',
                        border: 'none',
                        opacity: isDownloading ? 0.7 : 1,
                        cursor: isDownloading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i> {deliveryMethod === 'email' ? 'Sending...' : 'Downloading...'}
                        </>
                      ) : (
                        <>
                          <i className={deliveryMethod === 'email' ? 'fa fa-envelope' : 'fa fa-download'}></i> 
                          {deliveryMethod === 'email' ? 'Send Document' : 'Download Document'}
                        </>
                      )}
                    </button>
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
          <FormProgressSidebar currentStep={5} />
        </div>
      </div>
    </div>
  );
};

export default Form2step5;
