
import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PDFDocument, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

async function uploadToCloudinary(fileBuffer) {
  // Convert buffer to base64 for upload
  const base64Data = Buffer.from(fileBuffer).toString('base64');
  const dataURI = `data:application/pdf;base64,${base64Data}`;

  const uploadData = {
    file: dataURI,
    upload_preset: 'WiScribbles',
    folder: 'stamped-documents',
    resource_type: 'raw'
  };

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dvhrg7bkp/raw/upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.secure_url;
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

export async function POST(request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'Submission ID is required' }, { status: 400 });
    }

    const submissionRef = doc(db, 'formSubmissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissionDoc.data();
    const originalDocUrl = submission.documentUrl;

    if (!originalDocUrl || !originalDocUrl.toLowerCase().includes('.pdf')) {
      return NextResponse.json({ success: true, approvedDocURL: originalDocUrl, message: 'Document is not a PDF, skipping stamping.' });
    }

    const referenceNumber = submission.referenceNumber || `WISS-${uuidv4().slice(0, 8)}`;
    const userName = `${submission.step1?.firstName || ''} ${submission.step1?.lastName || ''}`.trim() || 'User';
    const jurisdiction = submission.step1?.jurisdiction || 'N/A';
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(-2)}`;
    const signingOption = submission.step3?.signingOption || 'default';
    
    let footerText = '';
    if (signingOption === 'esign') {
      footerText = `This document has been executed by ${userName} for use in the ${jurisdiction} through www.wiscribbles.com on ${formattedDate}, under reference number ${referenceNumber}`;
    } else {
      footerText = `This document was processed by WiScribbles on ${formattedDate}. Reference Number: ${referenceNumber}`;
    }

    const modifiedPdfBytes = await addFooterToPDF(originalDocUrl, footerText);
    const approvedDocURL = await uploadToCloudinary(modifiedPdfBytes);

    await updateDoc(submissionRef, {
      approvedDocURL: approvedDocURL,
    });

    return NextResponse.json({ success: true, approvedDocURL });

  } catch (error) {
    console.error('Error in stamp-pdf API route:', error);
    return NextResponse.json({ success: false, error: 'Failed to stamp and save PDF', details: error.message }, { status: 500 });
  }
}

