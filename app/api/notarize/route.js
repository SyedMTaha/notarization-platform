import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PDFDocument, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

async function uploadToCloudinary(fileBuffer) {
  try {
    // Create a FormData object for the upload
    const formData = new FormData();
    
    // Create a blob from the buffer
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    // Append the blob as a file
    formData.append('file', blob, 'stamped-document.pdf');
    formData.append('upload_preset', 'WiScribbles');
    formData.append('folder', 'stamped-documents');
    formData.append('resource_type', 'raw');
    formData.append('access_mode', 'public'); // Ensure public access
    
    console.log('Uploading PDF to Cloudinary...');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dvhrg7bkp/raw/upload`,
      {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let FormData handle it
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    
    // Create a download URL that works better for PDFs
    const downloadUrl = data.secure_url.replace('/raw/upload/', '/image/upload/fl_attachment/');
    console.log('Generated download URL:', downloadUrl);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
}

async function addFooterToPDF(pdfUrl, footerText) {
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from Cloudinary: ${response.statusText}`);
  }
  const pdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    page.drawText(footerText, {
      x: 30,
      y: 30,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });
    const pageNumberText = `Page ${index + 1} of ${pages.length}`;
    page.drawText(pageNumberText, {
      x: width - 80,
      y: 15,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdfDoc.save();
}

function generateReferenceNumber() {
  const prefix = 'WS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request) {
  try {
    const { submissionId, notaryId, notaryName } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'Submission ID is required' }, { status: 400 });
    }

    const submissionRef = doc(db, 'formSubmissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissionDoc.data();
    console.log('Submission data:', JSON.stringify(submission, null, 2));
    
    // The document URL should be in step3.documentUrl based on how Form2step3 saves it
    const originalDocUrl = submission.step3?.documentUrl || submission.documentUrl;
    console.log('Original document URL:', originalDocUrl);

    // Generate reference number
    const referenceNumber = generateReferenceNumber();
    const userName = `${submission.step1?.firstName || ''} ${submission.step1?.lastName || ''}`.trim() || 'User';
    // Check multiple possible fields for jurisdiction
    const jurisdiction = submission.step1?.jurisdiction || submission.step1?.jurisdictionOfDocumentUse || 'N/A';
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(-2)}`;
    const signingOption = submission.step3?.signingOption || 'default';
    
    console.log('Processing details:', {
      referenceNumber,
      userName,
      jurisdiction,
      formattedDate,
      signingOption,
      originalDocUrl
    });
    
    let approvedDocURL = null;
    
    // Always ensure we have some document URL to work with
    if (!originalDocUrl) {
      console.warn('No document URL found in submission. Setting approvedDocURL to null.');
      approvedDocURL = null;
    } else {
      // If the document is a PDF, process it with footer and page numbers
      try {
        if (originalDocUrl.toLowerCase().includes('.pdf')) {
          console.log('Processing PDF with footer and page numbers...');
          
          let footerText = '';
          if (signingOption === 'esign') {
            footerText = `This document has been executed by ${userName} for use in the ${jurisdiction} through www.wiscribbles.com on ${formattedDate}, under reference number ${referenceNumber}`;
          } else {
            footerText = `This document was processed by WiScribbles on ${formattedDate}. Reference Number: ${referenceNumber}`;
          }

          const modifiedPdfBytes = await addFooterToPDF(originalDocUrl, footerText);
          approvedDocURL = await uploadToCloudinary(modifiedPdfBytes);
          console.log('PDF processed successfully:', approvedDocURL);
        } else {
          // For non-PDF documents, use the original URL
          console.log('Document is not a PDF, using original URL');
          approvedDocURL = originalDocUrl;
        }
      } catch (pdfError) {
        console.error('PDF processing failed, using original document URL:', pdfError);
        // Fallback to original document URL if PDF processing fails
        approvedDocURL = originalDocUrl;
      }
    }

    // Update the submission document with approval data
    const updateData = {
      status: 'approved',
      referenceNumber: referenceNumber,
      approvedAt: new Date().toISOString(),
      approvedBy: {
        id: notaryId || 'system',
        name: notaryName || 'System'
      },
      approvedDocURL: approvedDocURL
    };

    await updateDoc(submissionRef, updateData);

    return NextResponse.json({ 
      success: true, 
      referenceNumber,
      approvedDocURL,
      message: 'Document notarized successfully'
    });

  } catch (error) {
    console.error('Error in notarize API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to notarize document', 
      details: error.message 
    }, { status: 500 });
  }
}
