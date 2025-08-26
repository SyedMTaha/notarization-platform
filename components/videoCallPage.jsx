'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getUserData } from '@/firebase';
import { useWorkflow, USER_ROLES } from '../contexts/WorkflowContext';
import { useCollaborativeForm } from '../hooks/useCollaborativeForm';
import DynamicFormRenderer from './DynamicFormRenderer/DynamicFormRenderer';
import { getDocumentConfig } from '../config/documentTypes';

const VideoCallPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const meetingId = searchParams.get('meetingId');
  const documentType = searchParams.get('documentType');
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoinedCall, setHasJoinedCall] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const user = useAuthStore((s) => s.user);
  const [role, setRole] = useState(null);
  
  // Workflow context
  const { state, actions, computed } = useWorkflow();
  
  // Collaborative form hook
  const {
    syncFormField,
    syncSignature,
    isCollaborative,
    isConnected,
    collaborators
  } = useCollaborativeForm({
    sessionId: meetingId,
    enableSync: true
  });

  useEffect(() => {
    // Fetch user role if not present
    const fetchRole = async () => {
      if (user && user.uid) {
        // If user object already has signUpAs, use it
        if (user.signUpAs) {
          setRole(user.signUpAs);
          // Set user role in workflow context
          const userRole = user.signUpAs === 'Notary' ? USER_ROLES.NOTARY : USER_ROLES.CLIENT;
          actions.setUserRole(userRole, user.uid, meetingId);
          
          // Set service type to notary since we're in video call
          actions.setServiceType('notary');
        } else {
          // Otherwise, fetch from Firestore (using mock)
          const { success, data } = await getUserData(user.uid);
          if (success && data.signUpAs) {
            setRole(data.signUpAs);
            const userRole = data.signUpAs === 'Notary' ? USER_ROLES.NOTARY : USER_ROLES.CLIENT;
            actions.setUserRole(userRole, user.uid, meetingId);
            actions.setServiceType('notary');
          }
        }
      }
    };
    fetchRole();
  }, [user, meetingId, actions]);

  // Initialize document configuration if not already set
  useEffect(() => {
    if (documentType && !state.selectedDocumentType) {
      const config = getDocumentConfig(documentType);
      if (config) {
        actions.setDocumentType(documentType, config);
      }
    }
  }, [documentType, state.selectedDocumentType, actions]);

  // Handle form field changes with collaborative sync
  const handleFormFieldChange = (fieldId, value) => {
    actions.updateFormField(fieldId, value);
    // Sync with other participants if collaborative
    if (isCollaborative && hasJoinedCall) {
      syncFormField(fieldId, value);
    }
  };

  // Handle signature changes with collaborative sync
  const handleSignatureChange = (fieldId, signature) => {
    const signedBy = role === 'Notary' ? 'notary' : 'client';
    actions.addSignature(fieldId, signature, signedBy);
    // Sync with other participants if collaborative
    if (isCollaborative && hasJoinedCall) {
      syncSignature(fieldId, signature, signedBy);
    }
  };

  // Toggle form panel visibility
  const toggleFormPanel = () => {
    setShowFormPanel(!showFormPanel);
  };

  useEffect(() => {
    if (!meetingId) return;
    // Use meetingId from URL for ZegoCloud room
    const userID = user && user.uid ? user.uid : Math.floor(Math.random() * 10000).toString();
    const userName = user && user.email ? user.email : `User_${userID}`;
    const initializeCall = async () => {
      const appID = 350196793; // Replace with your Zego Cloud App ID
      const serverSecret = '7ce30a0e63c55b55eb4a204d82e3352a'; // Replace with your Zego Cloud Server Secret
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        meetingId,
        userID,
        userName
      );
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      await zp.joinRoom({
        container: document.querySelector("#video-call-container"),
        sharedLinks: [{
          name: 'Personal link',
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?meetingId=' + meetingId,
        }],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: true,
        onJoinRoom: () => {
          setHasJoinedCall(true);
          // Start video call in workflow context
          const notaryId = role === 'Notary' ? user?.uid : 'notary_id';
          actions.startVideoCall(notaryId);
        },
        onLeaveRoom: () => {
          console.log('User left the room');
          // End video call in workflow context
          actions.endVideoCall();
          // Navigate based on role
          if (role === 'Notary') {
            handleBack();
          } else {
            handleNext();
          }
        },
      });
      setIsLoading(false);
    };
    initializeCall();
  }, [meetingId, user]);

  const handleNext = () => {
    router.push('/form2-page5');
  };

  const handleBack = () => {
    if (from === 'member') {
      router.push('/dashboard/member');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ fontFamily: "'Jost', sans-serif" }}>
      {/* Header with Logo */}
      <div className="mt-4" style={{ marginLeft: '120px' }}>
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

      {/* Main Content */}
      <div className="flex-grow-1 container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="bg-white p-4 rounded-3 shadow-sm">
              {/* Title */}
              <div className="text-center mb-4">
                <h2 style={{ 
                  color: '#2D3748', 
                  fontSize: '28px', 
                  fontWeight: '600',
                  fontFamily: "'Jost', sans-serif"
                }}>Video Verification</h2>
                <p style={{ 
                  color: '#718096', 
                  fontSize: '16px',
                  fontFamily: "'Jost', sans-serif"
                }}>Please complete the video verification process</p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div 
                  className="d-flex flex-column align-items-center justify-content-center"
                  style={{ 
                    height: '500px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div className="text-center">
                    <div className="spinner-border" 
                      style={{ 
                        color: '#274171',
                        width: '3rem',
                        height: '3rem',
                        marginBottom: '1.5rem'
                      }} 
                      role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h3 style={{ 
                      color: '#2D3748', 
                      fontSize: '24px',
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      We are setting up your video call
                    </h3>
                    <p style={{ 
                      color: '#718096', 
                      fontSize: '16px',
                      fontFamily: "'Jost', sans-serif",
                      maxWidth: '400px',
                      margin: '0 auto'
                    }}>
                      Please wait while we prepare a secure connection for your verification process
                    </p>
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="row" style={{ display: isLoading ? 'none' : 'flex' }}>
                {/* Video Call Section */}
                <div className={showFormPanel ? 'col-lg-8' : 'col-12'}>
                  <div 
                    id="video-call-container" 
                    className="mb-4" 
                    style={{ 
                      height: '500px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  ></div>
                  
                  {/* Video Call Controls */}
                  {hasJoinedCall && (
                    <div className="d-flex justify-content-center mb-3">
                      <button
                        onClick={toggleFormPanel}
                        className="btn"
                        style={{
                          backgroundColor: showFormPanel ? '#E53E3E' : '#274171',
                          color: 'white',
                          padding: '8px 20px',
                          border: 'none',
                          borderRadius: '6px',
                          fontFamily: "'Jost', sans-serif",
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className={`fa ${showFormPanel ? 'fa-eye-slash' : 'fa-file-text'}`}></i>
                        {showFormPanel ? 'Hide Form' : 'Show Form'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Form Panel Section */}
                {showFormPanel && (
                  <div className="col-lg-4">
                    <div 
                      style={{
                        height: '500px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        overflow: 'auto',
                        padding: '20px'
                      }}
                    >
                      {/* Collaborative Status */}
                      {isCollaborative && (
                        <div 
                          style={{
                            backgroundColor: isConnected ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${isConnected ? '#10B981' : '#EF4444'}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            marginBottom: '15px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <div 
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isConnected ? '#10B981' : '#EF4444'
                            }}
                          ></div>
                          <span style={{
                            color: isConnected ? '#065F46' : '#991B1B',
                            fontWeight: '500'
                          }}>
                            {isConnected ? 'Live Collaboration Active' : 'Collaboration Offline'}
                          </span>
                        </div>
                      )}
                      
                      {/* Collaborators List */}
                      {collaborators.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                          <h6 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>Active Participants:</h6>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {collaborators.map(collaborator => (
                              <div key={collaborator.id} style={{
                                fontSize: '12px',
                                color: '#6B7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <div style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: collaborator.role === 'notary' ? '#3B82F6' : '#10B981'
                                }}></div>
                                {collaborator.role === 'notary' ? 'Notary' : 'Client'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Form Content */}
                      {state.selectedDocumentType && state.documentConfig ? (
                        <DynamicFormRenderer
                          documentType={state.selectedDocumentType}
                          config={state.documentConfig}
                          formData={state.formData}
                          onFieldChange={handleFormFieldChange}
                          onSignature={handleSignatureChange}
                          errors={state.formErrors}
                          isNotaryMode={role === 'Notary'}
                          mode="video_call"
                          isCompact={true}
                        />
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#6B7280',
                          fontSize: '14px',
                          padding: '40px 20px'
                        }}>
                          <i className="fa fa-file-text" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                          <p style={{ margin: 0 }}>No document selected for editing</p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                            The form will appear here once a document is selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                {/* Notary: show only Back button, User: show only Next button */}
                {role === 'Notary' ? (
                  <button
                    onClick={handleBack}
                    className="btn"
                    style={{ 
                      backgroundColor: "#274171",
                      color: 'white',
                      padding: '10px 30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: "'Jost', sans-serif",
                      border: 'none'
                    }}
                  >
                    <i className="fa fa-arrow-left"></i> Back
                  </button>
                ) : <div />}
                {role !== 'Notary' && (
                  <button
                    onClick={handleNext}
                    className="btn"
                    style={{ 
                      backgroundColor: '#274171',
                      color: 'white',
                      padding: '10px 30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: "'Jost', sans-serif",
                      border: 'none'
                    }}
                  >
                    Next <i className="fa fa-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
