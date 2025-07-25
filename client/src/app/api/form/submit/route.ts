import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validate the form data
    if (!formData.personalInfo || !formData.jobInterest || !formData.notifications) {
      return NextResponse.json({ error: 'Invalid form data structure' }, { status: 400 });
    }

    // Here you would typically save to database
    // For now, we'll simulate a successful submission
    console.log('Form submitted:', formData);

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        submissionId: `submission_${Date.now()}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
