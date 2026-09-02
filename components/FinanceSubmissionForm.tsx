'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from './FileUpload';

interface FinanceSubmissionFormProps {
    testCode: string;
}

const ANY_DOC = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
    'text/markdown': ['.md'],
    'text/plain': ['.txt', '.md'],
};
const MD_ONLY = { 'text/markdown': ['.md'], 'text/plain': ['.md'] };

export default function FinanceSubmissionForm({ testCode }: FinanceSubmissionFormProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [findings, setFindings] = useState<File | null>(null);
    const [emailFile, setEmailFile] = useState<File | null>(null);
    const [chatLog, setChatLog] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid Indian phone number.');
            return;
        }
        if (!findings || !emailFile || !chatLog) {
            setError('Please attach all three deliverables.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('testCode', testCode);
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('findings', findings);
            formData.append('emailFile', emailFile);
            formData.append('chatLog', chatLog);

            const res = await fetch('/api/testcode/submit', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                router.refresh();
            } else {
                setError(data.error || 'Submission failed');
                setUploading(false);
            }
        } catch {
            setError('Network error occurred.');
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-4 max-w-2xl w-full border-t-4 border-blue-600">
                <h1 className="text-3xl font-bold mb-2 text-gray-800">Submit your deliverables</h1>
                <p className="text-gray-600 mb-6 border-b pb-4">
                    Upload all three items below. You can submit once, so make sure it&apos;s complete.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-100 p-4 rounded">
                        <label className="block text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">Assessment code</label>
                        <input type="text" value={testCode} disabled
                            className="w-full bg-transparent text-lg font-mono font-bold text-gray-700 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="fullName">
                                Full Name <span className="text-red-600">*</span>
                            </label>
                            <input className="block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded py-3 px-4 focus:outline-none focus:bg-white focus:border-blue-500"
                                id="fullName" type="text" placeholder="Priya Nair"
                                value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="phone">
                                Phone Number <span className="text-red-600">*</span>
                            </label>
                            <input className="block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded py-3 px-4 focus:outline-none focus:bg-white focus:border-blue-500"
                                id="phone" type="tel" placeholder="+91 9876543210"
                                value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="email">
                            Email Address <span className="text-red-600">*</span>
                        </label>
                        <input className="block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded py-3 px-4 focus:outline-none focus:bg-white focus:border-blue-500"
                            id="email" type="email" placeholder="priya@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-1">
                            1 &middot; Findings <span className="text-red-600">*</span>
                            <span className="ml-2 font-normal text-sm text-gray-400">doc, sheet, or PDF</span>
                        </label>
                        <FileUpload onFileSelect={setFindings} selectedFile={findings} accept={ANY_DOC}
                            hint=".xlsx · .csv · .pdf · .docx · .md" />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-1">
                            2 &middot; Customer email <span className="text-red-600">*</span>
                            <span className="ml-2 font-normal text-sm text-gray-400">the one you&apos;d actually send</span>
                        </label>
                        <FileUpload onFileSelect={setEmailFile} selectedFile={emailFile} accept={ANY_DOC}
                            hint=".pdf · .docx · .txt · .md" />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-1">
                            3 &middot; AI chat log <span className="text-red-600">*</span>
                            <span className="ml-2 font-normal text-sm text-gray-400">exported as .md</span>
                        </label>
                        <FileUpload onFileSelect={setChatLog} selectedFile={chatLog} accept={MD_ONLY} hint=".md file" />
                    </div>

                    <p className="text-xs text-gray-500 border-t pt-4">
                        By submitting, you confirm the work is your own and the chat log accurately reflects how you worked. Submissions are final.
                    </p>

                    {error && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 text-center" role="alert">{error}</div>}

                    <button className="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-4 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        type="submit" disabled={uploading || isSuccess}>
                        {uploading || isSuccess ? 'Submitting...' : 'Submit answers'}
                    </button>
                </form>
            </div>
        </div>
    );
}
