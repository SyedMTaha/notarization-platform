import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

async function uploadToCloudinary(fileBuffer, fileName = 'notarized_document') {
  try {
    // Convert buffer to base64 for upload
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:application/pdf;base64,${base64Data}`;
    
    console.log('Uploading notarized PDF to Cloudinary, size:', fileBuffer.length, 'bytes');

    const uploadData = {
      file: dataURI,
      upload_preset: 'wiscribbles',
      folder: 'notarized-documents',
      resource_type: 'raw',
      public_id: `${fileName}_${Date.now()}.pdf`
    };

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dgyv432jt/raw/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary response not ok:', response.status, errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

async function addNotaryStampToPDF(pdfUrl, notaryInfo, clientInfo) {
  console.log('Fetching PDF from URL:', pdfUrl);
  console.log('Notary Info:', notaryInfo);
  console.log('Client Info:', clientInfo);
  
  // Fetch the PDF
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }
  
  const pdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  // Load a standard font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Generate reference number if not exists
  const referenceNumber = notaryInfo.referenceNumber || `WISS-NOT-${uuidv4().slice(0, 8).toUpperCase()}`;
  
  // Format dates
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  // Create notary stamp text
  const notaryStampText = `This document has been notarized by ${notaryInfo.notaryName} (Commission #${notaryInfo.commissionNumber || 'PENDING'}) 
for ${clientInfo.clientName} in ${notaryInfo.jurisdiction} through www.wiscribbles.com 
on ${formattedDate}, under reference number ${referenceNumber}`;
  
  // Add stamp to each page
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    
    // Add notary stamp text at the bottom
    const lines = notaryStampText.split('\n');
    let yPosition = 30;
    
    lines.forEach((line, lineIndex) => {
      page.drawText(line.trim(), {
        x: 30,
        y: yPosition - (lineIndex * 10),
        size: 7,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
    
    // Add page number
    const pageNumberText = `Page ${index + 1} of ${pages.length}`;
    page.drawText(pageNumberText, {
      x: width - 80,
      y: 15,
      size: 7,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Add "NOTARIZED" watermark diagonally on first page only
    if (index === 0) {
      // Add semi-transparent "NOTARIZED" stamp
      page.drawText('NOTARIZED', {
        x: width / 2 - 100,
        y: height / 2,
        size: 60,
        font: helveticaBold,
        color: rgb(0.8, 0.1, 0.1),
        opacity: 0.2,
        rotate: degrees(45)  // Fixed rotation syntax
      });
      
      // Add notary seal box on the first page (top right corner)
      const sealBoxX = width - 180;
      const sealBoxY = height - 100;
      const sealBoxWidth = 150;
      const sealBoxHeight = 70;
      
      // Draw seal border
      page.drawRectangle({
        x: sealBoxX,
        y: sealBoxY,
        width: sealBoxWidth,
        height: sealBoxHeight,
        borderColor: rgb(0, 0, 0.5),
        borderWidth: 2,
      });
      
      // Add notary seal text
      page.drawText('NOTARY PUBLIC', {
        x: sealBoxX + 25,
        y: sealBoxY + 50,
        size: 10,
        font: helveticaBold,
        color: rgb(0, 0, 0.5),
      });
      
      page.drawText(notaryInfo.notaryName || 'Notary Name', {
        x: sealBoxX + 15,
        y: sealBoxY + 35,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Commission: ${notaryInfo.commissionNumber || 'PENDING'}`, {
        x: sealBoxX + 15,
        y: sealBoxY + 22,
        size: 7,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(notaryInfo.jurisdiction || 'Jurisdiction', {
        x: sealBoxX + 15,
        y: sealBoxY + 10,
        size: 7,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Add signature lines on first page
      const signatureY = 120;
      
      // Client signature line
      page.drawLine({
        start: { x: 50, y: signatureY },
        end: { x: 250, y: signatureY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Client Signature', {
        x: 50,
        y: signatureY - 15,
        size: 8,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(clientInfo.clientName || 'Client Name', {
        x: 50,
        y: signatureY + 5,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Notary signature line
      page.drawLine({
        start: { x: 300, y: signatureY },
        end: { x: 500, y: signatureY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Notary Signature', {
        x: 300,
        y: signatureY - 15,
        size: 8,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(notaryInfo.notaryName || 'Notary Name', {
        x: 300,
        y: signatureY + 5,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
  });

  return await pdfDoc.save();
}

export async function POST(request) {
  console.log('=== Notary Stamp PDF API Called ===');
  
  try {
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      sessionId, 
      documentUrl, 
      notaryName, 
      notaryId,
      notaryCommissionNumber,
      clientName,
      clientId,
      jurisdiction,
      documentType 
    } = body;
    
    console.log('Processing notarization request:', {
      sessionId,
      notaryName,
      clientName,
      jurisdiction,
      documentType
    });

    if (!documentUrl) {
      console.error('ERROR: No document URL provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No document URL provided',
        details: 'documentUrl field is missing or empty in request'
      }, { status: 400 });
    }
    
    console.log('Document URL to process:', documentUrl);

    // Prepare notary and client information
    const notaryInfo = {
      notaryName: notaryName || 'Authorized Notary',
      notaryId: notaryId,
      commissionNumber: notaryCommissionNumber || 'COMM-2024-001', // Default commission number
      jurisdiction: jurisdiction || 'Not Specified',
      referenceNumber: sessionId ? `WISS-NOT-${sessionId.slice(-8).toUpperCase()}` : null
    };
    
    const clientInfo = {
      clientName: clientName || 'Client',
      clientId: clientId
    };

    try {
      console.log('Adding notary stamp to PDF...');
      const modifiedPdfBytes = await addNotaryStampToPDF(documentUrl, notaryInfo, clientInfo);
      console.log('PDF notarized successfully, uploading to Cloudinary...');
      
      const notarizedDocUrl = await uploadToCloudinary(modifiedPdfBytes, 'notarized_document');
      console.log('Notarized document uploaded:', notarizedDocUrl);

      // If sessionId is provided, update the session/submission in Firebase
      if (sessionId) {
        try {
          // All notary sessions are stored in formSubmissions collection
          const submissionRef = doc(db, 'formSubmissions', sessionId);
          const submissionDoc = await getDoc(submissionRef);
          
          if (submissionDoc.exists()) {
            // Update with notarized document information
            await updateDoc(submissionRef, {
              notarizedDocURL: notarizedDocUrl,
              notarizedAt: new Date().toISOString(),
              notarizedBy: notaryId,
              notaryName: notaryName,
              notaryCommissionNumber: notaryInfo.commissionNumber,
              status: 'notarized',
              referenceNumber: notaryInfo.referenceNumber,
              // Also update nested document object for consistency
              'document.notarizedUrl': notarizedDocUrl,
              'document.status': 'notarized',
              'document.notarizedAt': new Date().toISOString(),
              'document.notarizedBy': notaryId
            });
            console.log('Form submission updated with notarized document:', sessionId);
            console.log('Notarized document URL saved:', notarizedDocUrl);
          } else {
            console.warn('No document found with ID:', sessionId);
            // Continue anyway - the document is still notarized
          }
        } catch (updateError) {
          console.error('Error updating Firebase document:', updateError);
          // Continue even if update fails - the notarized document is still available
        }
      }

      return NextResponse.json({ 
        success: true, 
        notarizedDocURL: notarizedDocUrl,
        referenceNumber: notaryInfo.referenceNumber,
        message: 'Document successfully notarized'
      });

    } catch (error) {
      console.error('ERROR in notarization process:', error);
      console.error('Error stack:', error.stack);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to notarize document',
        details: error.message || 'Unknown error in notarization process'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('CRITICAL ERROR in notary-stamp-pdf API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message || 'Critical error occurred'
    }, { status: 500 });
  }
}
