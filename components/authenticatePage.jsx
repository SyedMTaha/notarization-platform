'use client';
import React, { useState } from 'react';
import { FiUser, FiFileText, FiEdit, FiCreditCard, FiDownload } from 'react-icons/fi';
import AuthenticateSidebar from './authenticateSidebar';
import Link from 'next/link';
import Logo from './Logo';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AuthenticatePage = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState({ day: '', month: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckStatus = async () => {
    setError('');
    setLoading(true);
    try {
      const q = query(collection(db, 'formSubmissions'), where('referenceNumber', '==', referenceNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        router.push(`/authenticate/status?status=${docData.status}&referenceNumber=${referenceNumber}`);
      } else {
        setError('Document not found or invalid reference number.');
      }
    } catch (err) {
      console.error('Error checking document status:', err);
      setError('Error checking document status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1" style={{ marginRight: '320px' }}>
        <div className="mt-4" style={{ marginLeft: '22px' }}>
          <Logo variant="dark" size="default" />
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="form-card bg-white p-4 rounded-3">
                <div className="text-center mb-5">
                  <h2 style={{ color: '#2D3748', fontSize: '28px', fontWeight: '600' }}>Authenticate</h2>
                  <p style={{ color: '#718096', fontSize: '16px', marginTop: '8px' }}>
                    Find the Documents you need and download them
                  </p>
                </div>

                {/* Reference Number Input */}
                <div className="row justify-content-center mb-4">
                  <div className="col-md-8">
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#2D3748', marginBottom: '8px' }}>Reference Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="WIS-XXXX-XXXXX"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F7FAFC'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Date Input */}
                <div className="row justify-content-center mb-5">
                  <div className="col-md-8">
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#2D3748', marginBottom: '8px' }}>Date Signed</label>
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="DD"
                          value={date.day}
                          onChange={(e) => setDate({ ...date, day: e.target.value })}
                          style={{
                            width: '80px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F7FAFC'
                          }}
                        />
                        <span className="align-self-center" style={{ color: '#718096' }}>/</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM"
                          value={date.month}
                          onChange={(e) => setDate({ ...date, month: e.target.value })}
                          style={{
                            width: '80px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F7FAFC'
                          }}
                        />
                        <span className="align-self-center" style={{ color: '#718096' }}>/</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="YYYY"
                          value={date.year}
                          onChange={(e) => setDate({ ...date, year: e.target.value })}
                          style={{
                            width: '100px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F7FAFC'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Found Documents Section */}
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="d-flex mt-2">
                      <button
                        className="btn"
                        onClick={handleCheckStatus}
                        disabled={loading || !referenceNumber}
                        style={{
                          backgroundColor: '#274171',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '18px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'background-color 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#1A202C',
                          },
                        }}
                      >
                        {loading ? 'Checking...' : 'Check Status'}
                      </button>
                    </div>
                    {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
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
        <AuthenticateSidebar currentStep={1} />
      </div>
    </div>
  );
};

export default AuthenticatePage; 