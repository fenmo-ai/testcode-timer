import { NextResponse } from 'next/server';
import { getTestCodeState } from '@/lib/testCodes';
import { downloadFile } from '@/lib/googleDrive';

// Gated download of the finance assignment materials.
// Only serves the file once the candidate's code is enabled, is a finance
// assignment, has a configured materials file, and the timer has started.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const testCode = searchParams.get('testCode');

        if (!testCode) {
            return NextResponse.json({ error: 'TestCode is required' }, { status: 400 });
        }

        const state = await getTestCodeState(testCode);
        if (!state || state.status === 'not_invited') {
            return NextResponse.json({ error: 'Invalid TestCode' }, { status: 403 });
        }
        if (state.assignmentType !== 'finance' || !state.materialsFileId) {
            return NextResponse.json({ error: 'No materials available for this assignment' }, { status: 404 });
        }
        if (!state.startTime) {
            return NextResponse.json({ error: 'Start the assessment before downloading materials' }, { status: 403 });
        }

        const file = await downloadFile(state.materialsFileId);

        return new Response(new Uint8Array(file.buffer), {
            headers: {
                'Content-Type': file.mimeType,
                'Content-Disposition': `attachment; filename="${file.name}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Materials API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch materials. Please contact support.' }, { status: 500 });
    }
}
