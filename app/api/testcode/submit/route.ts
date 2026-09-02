import { NextResponse } from 'next/server';
import { hasSubmitted, getTestCodeState, getResponsesSheet } from '@/lib/testCodes';
import { uploadFile } from '@/lib/googleDrive';
import { appendRow } from '@/lib/googleSheets';

const PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const testCode = formData.get('testCode') as string;
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        if (!testCode || !fullName || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (!PHONE_REGEX.test(phone)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        const state = await getTestCodeState(testCode);
        if (!state || state.status === 'not_invited') {
            return NextResponse.json({ error: 'Invalid TestCode' }, { status: 403 });
        }

        if (await hasSubmitted(testCode, state.assignmentType)) {
            return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
        }

        const responsesSheet = getResponsesSheet(state.assignmentType);
        const now = new Date().toISOString();

        if (state.assignmentType === 'finance') {
            const findings = formData.get('findings') as File | null;
            const emailFile = formData.get('emailFile') as File | null;
            const chatLog = formData.get('chatLog') as File | null;

            if (!findings || !emailFile || !chatLog) {
                return NextResponse.json({ error: 'All three deliverables are required' }, { status: 400 });
            }

            const [findingsLink, emailLink, chatLogLink] = await Promise.all([
                uploadDeliverable(testCode, 'findings', findings),
                uploadDeliverable(testCode, 'email', emailFile),
                uploadDeliverable(testCode, 'chatlog', chatLog),
            ]);

            // FinanceResponses: Timestamp | TestCode | FullName | Email | Phone | FindingsLink | EmailLink | ChatLogLink
            await appendRow(responsesSheet, [
                now, testCode, fullName, email, phone, findingsLink, emailLink, chatLogLink,
            ]);

            return NextResponse.json({ status: 'ok' });
        }

        // SDE flow: GitHub repo link + optional deploy link + commit-history screenshot.
        const link1 = formData.get('link1') as string;
        const link2 = formData.get('link2') as string;
        const file = formData.get('file') as File | null;

        if (!file || !link1) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const driveLink = await uploadDeliverable(testCode, file.name, file);

        // FormResponses: Timestamp | GitHubRepo | Deploy | Screenshot | TestCode | FullName | Email | Phone
        await appendRow(responsesSheet, [
            now, link1 || '', link2 || '', driveLink, testCode, fullName, email, phone,
        ]);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Submission API Error:', error);
        return NextResponse.json({ error: 'Failed to process submission. Please contact support.' }, { status: 500 });
    }
}

async function uploadDeliverable(testCode: string, label: string, file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${testCode}_${label}_${file.name}`;
    return uploadFile(fileName, file.type || 'application/octet-stream', buffer);
}
