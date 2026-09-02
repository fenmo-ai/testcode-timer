'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Countdown from './Countdown';
import FinanceSubmissionForm from './FinanceSubmissionForm';

interface FinanceRunningScreenProps {
    testCode: string;
    startTime: string;
    durationHours: number;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100">{title}</h2>
            {children}
        </div>
    );
}

const DELIVERABLES: [string, string][] = [
    ['Validation Findings', 'Were there any anomalies in the AI output? If yes: what are those, why could they have happened, and what is the true position for each customer?'],
    ['Customer Communications', 'What do you communicate to which customers?'],
    ['AI Chat Log', 'The full conversation (see instructions below).'],
];

const DATA_ROOM: [string, string][] = [
    ['contracts/', 'Source'],
    ['invoices.csv · payments.csv', 'Source'],
    ['remittance_emails/', 'Source'],
    ['ai_reconciliation.csv', 'AI'],
    ['ai_collections_emails.txt', 'AI'],
];

export default function FinanceRunningScreen({ testCode, startTime, durationHours }: FinanceRunningScreenProps) {
    const router = useRouter();
    const [isFinished, setIsFinished] = useState(false);

    if (isFinished) {
        return <FinanceSubmissionForm testCode={testCode} />;
    }

    const materialsHref = `/api/testcode/materials?testCode=${encodeURIComponent(testCode)}`;

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/fenmo-logo.svg" alt="Fenmo" className="h-7 w-auto" />
                        <Countdown startTime={startTime} durationHours={durationHours} onEnd={() => router.refresh()} />
                    </div>
                    <button
                        onClick={() => { if (confirm('Go to the submission form? Your timer keeps running.')) setIsFinished(true); }}
                        className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        Submit deliverables →
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-6">
                <div className="mb-4">
                    <p className="text-sm font-semibold text-brand mb-1">Take-home · Finance Operations Fellow</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">The AI already ran the numbers. You decide if it&apos;s right.</h1>
                </div>

                {/* CONTEXT */}
                <SectionCard title="Context">
                    <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">
                        <p>Fenmo is building an AI that runs a finance team&apos;s cash cycle end to end. It reads contracts, tracks the invoices we raise, matches incoming bank payments, knocks off the invoices it considers settled, and drafts collections emails to customers who still owe money.</p>
                        <p><b className="text-gray-900">Today is 25 July 2026.</b> This quarter we pointed the AI at three customers: <b className="text-gray-900">Nova Components, Kalyan Hardware, and Sterling Foods.</b> It has already done its pass, reconciling every account and queuing up its collections emails. Your job is to be the human in the loop and check whether it actually got things right before we act on its output.</p>
                        <p>The cost of a wrong number is not symmetric: trust the AI blindly and we either chase a customer who has already paid (burning the relationship) or quietly let real money go uncollected. Some of its work is right. Some of it is not.</p>
                    </div>
                    <div className="mt-5 bg-gray-100 border border-gray-200 rounded-md p-4">
                        <p className="text-sm font-bold text-gray-800 mb-1">What the AI handed you</p>
                        <p className="text-sm text-gray-700 leading-relaxed">A reconciliation of all <b>3 customers</b> (its match and status per invoice) and <b>2 drafted collections emails</b>. Treat everything the AI produced as a <b>claim to check</b> against the contracts, the bank payments, and the customers&apos; own emails, not as fact.</p>
                    </div>
                </SectionCard>

                {/* PROBLEM STATEMENT + DATA ROOM */}
                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 items-start mt-4">
                    <SectionCard title="Problem Statement">
                        <p className="text-[15px] text-gray-700 mb-4">Work through the AI&apos;s output against the source documents, then give us three things:</p>
                        <ul className="space-y-4">
                            {DELIVERABLES.map(([t, d], i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="flex-none w-6 h-6 rounded-md bg-brand text-white text-xs font-bold grid place-items-center mt-0.5">{i + 1}</span>
                                    <div>
                                        <p className="text-[15px] font-semibold text-gray-900">{t}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>

                    <SectionCard title="Data Room">
                        <div className="space-y-1.5 mb-4">
                            {DATA_ROOM.map(([name, tag], i) => (
                                <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded px-3 py-2">
                                    <span className="font-mono text-[13px] text-gray-700">{name}</span>
                                    <span className={`ml-auto text-[11px] font-semibold uppercase tracking-wide ${tag === 'AI' ? 'text-gray-500' : 'text-brand'}`}>{tag}</span>
                                </div>
                            ))}
                        </div>
                        <a href={materialsHref}
                            className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded">
                            ↓ Download all materials (.zip)
                        </a>
                        <p className="text-xs text-gray-400 text-center mt-2">One zip. Open the CSVs in Excel or Sheets, then feed the rest to your AI.</p>
                    </SectionCard>
                </div>

                {/* INSTRUCTIONS */}
                <div className="mt-4">
                    <SectionCard title="Instructions: working with AI and sending your chat log">
                        <div className="grid md:grid-cols-[1fr_1.3fr] gap-8">
                            <div>
                                <p className="font-bold text-gray-900 mb-2">1 · Use your preferred AI</p>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">Work with whichever assistant you&apos;re sharpest in. We <b>want</b> to see you lean on it: asking good questions, checking its answers, iterating. Finance background helps, but how you think <i>with</i> the tool matters more.</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['Claude', 'ChatGPT', 'Gemini', 'your call'].map((l) => (
                                        <span key={l} className="text-[13px] font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700">{l}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 mb-2">2 · Give us your chat log as one .md file</p>
                                <ol className="space-y-2.5 text-sm text-gray-700">
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">1</span><span><b>Open a brand-new chat</b> in your assistant and do <b>all</b> of your work in that single thread.</span></li>
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">2</span><span>When you&apos;re done, ask it: <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Export our entire conversation so far as one complete Markdown file, verbatim.</code></span></li>
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">3</span><span>Save it as <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">chat-log.md</code> and upload it with your other deliverables.</span></li>
                                </ol>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-sm text-gray-600"><b className="text-gray-700">Budget ~2 hours. We mean it.</b> A tighter, sharper submission beats an exhaustive one.</p>
                            <button onClick={() => setIsFinished(true)}
                                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-2.5 px-5 rounded">
                                Ready? Submit deliverables →
                            </button>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </main>
    );
}
