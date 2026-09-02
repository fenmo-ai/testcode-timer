import { getRows, updateCell } from './googleSheets';

const TESTCODES_SHEET = process.env.TESTCODES_SHEET_NAME || 'TestCodes';
const FORM_RESPONSES_SHEET = process.env.FORM_RESPONSES_SHEET_NAME || 'FormResponses';
const FINANCE_RESPONSES_SHEET = process.env.FINANCE_RESPONSES_SHEET_NAME || 'FinanceResponses';

export type AssignmentType = 'sde' | 'finance';

export interface TestCodeState {
    status: 'not_invited' | 'pre_start' | 'running' | 'ended' | 'submitted';
    testCode: string;
    durationHours: number;
    startTime: string | null; // ISO string
    problemPdfId: string;
    formUrlTemplate: string;
    assignmentType: AssignmentType;
    materialsFileId: string;
    rowIndex: number;
}

// TestCodes columns:
// A=TestCode(0) B=DurationHours(1) C=StartTime(2) D=ProblemPdfId(3)
// E=FormUrlTemplate(4) F=Enabled(5) G=AssignmentType(6) H=MaterialsFileId(7)
function parseAssignmentType(raw: string | undefined): AssignmentType {
    return raw?.trim().toLowerCase() === 'finance' ? 'finance' : 'sde';
}

export function getResponsesSheet(assignmentType: AssignmentType): string {
    return assignmentType === 'finance' ? FINANCE_RESPONSES_SHEET : FORM_RESPONSES_SHEET;
}

export async function getTestCodeState(testCodeInput: string): Promise<TestCodeState | null> {
    const rows = await getRows(TESTCODES_SHEET);
    const dataRows = rows.slice(1); // Header is row 1
    const testCode = testCodeInput.trim();

    const rowIndexInData = dataRows.findIndex(row => row[0]?.trim().toLowerCase() === testCode.toLowerCase());
    if (rowIndexInData === -1) {
        return null;
    }

    const row = dataRows[rowIndexInData];
    const rowIndex = rowIndexInData + 2; // +1 header, +1 for 0-index -> 1-index

    const enabled = row[5]?.toUpperCase() === 'TRUE';
    if (!enabled) {
        return {
            status: 'not_invited',
            testCode: row[0],
            durationHours: 0,
            startTime: null,
            problemPdfId: '',
            formUrlTemplate: '',
            assignmentType: 'sde',
            materialsFileId: '',
            rowIndex,
        };
    }

    const startTime = row[2] || null;

    return {
        status: startTime ? 'running' : 'pre_start', // Simplified; caller refines running vs ended
        testCode: row[0],
        durationHours: parseFloat(row[1] || '0'),
        startTime,
        problemPdfId: row[3] || '',
        formUrlTemplate: row[4] || '',
        assignmentType: parseAssignmentType(row[6]),
        materialsFileId: row[7] || '',
        rowIndex,
    };
}

export async function setStartTime(testCode: string, isoTime: string) {
    const state = await getTestCodeState(testCode);
    if (!state || state.status === 'not_invited') throw new Error('Invalid test code');

    if (state.startTime) {
        return state.startTime;
    }

    // Column C is StartTime (1-indexed column 3)
    await updateCell(TESTCODES_SHEET, state.rowIndex, 3, isoTime);
    return isoTime;
}

export async function hasSubmitted(
    testCodeInput: string,
    assignmentType: AssignmentType = 'sde',
): Promise<boolean> {
    const sheet = getResponsesSheet(assignmentType);
    const rows = await getRows(sheet);
    const header = rows[0];
    if (!header) return false;

    const testCodeColIndex = header.findIndex(h => h.trim().toLowerCase() === 'testcode');
    if (testCodeColIndex === -1) {
        console.warn(`TestCode column not found in ${sheet} sheet`);
        return false;
    }

    const testCode = testCodeInput.trim().toLowerCase();
    const dataRows = rows.slice(1);
    return dataRows.some(row => row[testCodeColIndex]?.trim().toLowerCase() === testCode);
}
