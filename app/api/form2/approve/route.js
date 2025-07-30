import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateReferenceNumber() {
  const prefix = 'WS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request) {
  try {
    const { submissionId, approved, notaryId, notaryName } = await request.json();

    // Get the submission document
    const submissionRef = doc(db, 'formSubmissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissionDoc.data();
    const status = approved ? 'approved' : 'rejected';
    let referenceNumber = null;

    // If approved, generate reference number and send email
    if (approved) {
      referenceNumber = generateReferenceNumber();
      
      try {
        // Send email notification
        await resend.emails.send({
          from: 'WiScribble <notifications@wiscribble.com>',
          to: submission.step1.email,
          subject: 'Your Document Has Been Approved',
          html: `
            <h1>Document Approval Notification</h1>
            <p>Dear ${submission.step1.firstName} ${submission.step1.lastName},</p>
            <p>Your document has been approved by our notary team.</p>
            <p><strong>Reference Number:</strong> ${referenceNumber}</p>
            <p><strong>Document Type:</strong> ${submission.step2.documentType}</p>
            <p>Please keep this reference number for your records. You can use it to track your document status.</p>
            <p>Thank you for using WiScribble!</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue with the approval process even if email fails
      }
    }

    // Update the submission document
    const updateData = {
      status,
      referenceNumber: referenceNumber,
      approvedAt: new Date().toISOString(),
      approvedBy: {
        id: notaryId,
        name: notaryName
      }
    };

    // If approved and has documentUrl, add approvedDocURL (placeholder for now)
    if (approved && submission.documentUrl) {
      // For now, we'll use the same URL, but in production you'd process it
      updateData.approvedDocURL = submission.documentUrl;
    }

    await updateDoc(submissionRef, updateData);

    return NextResponse.json({ 
      success: true, 
      message: approved ? 'Document approved successfully' : 'Document rejected successfully',
      referenceNumber
    });

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process approval' 
    }, { status: 500 });
  }
} 