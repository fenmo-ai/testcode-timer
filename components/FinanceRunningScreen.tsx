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
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <div>
                        <p className="text-sm font-semibold text-brand mb-1">Take-home · Finance Operations Fellow</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">The AI already ran the numbers. You decide if it&apos;s right.</h1>
                    </div>
                    <span className="text-sm font-medium border border-gray-300 bg-white rounded-md px-3 py-1.5">
                        &ldquo;Today&rdquo; = <b className="text-gray-900">25 Jul 2026</b>
                    </span>
                </div>

                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 items-stretch">
                    {/* LEFT: the problem */}
                    <SectionCard title="The situation">
                        <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">
                            <p>This quarter, Fenmo&apos;s AI ran the entire cash cycle for three customers — <b className="text-gray-900">Nova Components, Kalyan Hardware, and Sterling Foods.</b> It read each signed contract, matched every payment that hit our bank against the invoices we raised, marked off what it believes is settled, and has <b className="text-gray-900">two collections emails queued to send tomorrow</b> to whoever it still thinks owes us money.</p>
                            <p>Tomorrow morning those emails go out and the finance team acts on the AI&apos;s numbers — <b className="text-gray-900">unless someone checks them first.</b> Some of its work is right. Some of it isn&apos;t.</p>
                            <p>And the cost of a wrong number isn&apos;t symmetric: <b className="text-gray-900">trust the AI blindly and we either chase a customer who has already paid — burning the relationship — or quietly let real money go uncollected.</b></p>
                        </div>
                        <div className="mt-5 bg-gray-100 border border-gray-200 rounded-md p-4">
                            <p className="text-sm font-bold text-gray-800 mb-1">What the AI handed you</p>
                            <p className="text-sm text-gray-700 leading-relaxed">A reconciliation of all <b>3 customers</b> (its match &amp; status per invoice) and <b>2 drafted collections emails</b>. Treat everything the AI produced as a <b>claim to check</b> against the contracts, the bank payments, and the customers&apos; own emails — not as fact.</p>
                        </div>
                    </SectionCard>

                    {/* RIGHT: expectation + materials */}
                    <div className="grid grid-rows-[auto_1fr] gap-4">
                        <SectionCard title="What we need back">
                            <p className="text-[15px] text-gray-700 mb-3">Before we chase anyone, give us the <b className="text-gray-900">true position for each customer:</b></p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 text-xs uppercase tracking-wide">
                                        <th className="text-left font-semibold pb-2">Customer</th>
                                        <th className="text-right font-semibold pb-2">Contracted</th>
                                        <th className="text-right font-semibold pb-2">Collected</th>
                                        <th className="text-right font-semibold pb-2">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-brand">
                                    {['Nova', 'Kalyan', 'Sterling'].map((c) => (
                                        <tr key={c} className="border-t border-gray-100">
                                            <td className="text-left py-2 font-sans font-semibold text-gray-900">{c}</td>
                                            <td className="text-right py-2">?</td>
                                            <td className="text-right py-2">?</td>
                                            <td className="text-right py-2">?</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="mt-4 bg-brand-light border border-brand/20 rounded-md px-3 py-2.5 text-sm text-brand-dark">
                                <b>Then decide:</b> which of the AI&apos;s two queued emails should actually go out — and what you&apos;d change.
                            </p>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    ['Findings', 'your numbers above, plus every issue in the AI’s work and, above all, why each one happened.'],
                                    ['One customer email', 'the one you’d actually send, to whoever most needs it.'],
                                    ['Your AI chat log (.md)', 'the full conversation (see “How to work”).'],
                                ].map(([t, d], i) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <span className="flex-none w-6 h-6 rounded-md bg-brand text-white text-xs font-bold grid place-items-center mt-0.5">{i + 1}</span>
                                        <span className="text-sm"><b className="text-gray-900">{t}</b> <span className="text-gray-500">— {d}</span></span>
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>

                        <SectionCard title="Your materials">
                            <div className="space-y-1.5 mb-4">
                                {[
                                    ['contracts/', 'Source'],
                                    ['invoices.csv · payments.csv', 'Source'],
                                    ['remittance_emails/', 'Source'],
                                    ['ai_reconciliation.csv', 'AI'],
                                    ['ai_collections_emails.txt', 'AI'],
                                ].map(([name, tag], i) => (
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
                            <p className="text-xs text-gray-400 text-center mt-2">One zip — open the CSVs in Excel/Sheets, feed the rest to your AI.</p>
                        </SectionCard>
                    </div>
                </div>

                {/* HOW TO WORK */}
                <div className="mt-4">
                    <SectionCard title="How to work — and how to hand us your chat log">
                        <div className="grid md:grid-cols-[1fr_1.3fr] gap-8">
                            <div>
                                <p className="font-bold text-gray-900 mb-2">1 · Use your preferred AI</p>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">Work with whichever assistant you&apos;re sharpest in. We <b>want</b> to see you lean on it — asking good questions, checking its answers, iterating. Finance background helps, but how you think <i>with</i> the tool matters more.</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['Claude', 'ChatGPT', 'Gemini', '…your call'].map((l) => (
                                        <span key={l} className="text-[13px] font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700">{l}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 mb-2">2 · Give us your chat log as one .md file</p>
                                <ol className="space-y-2.5 text-sm text-gray-700">
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">1</span><span><b>Open a brand-new chat</b> in your assistant and do <b>all</b> of your work in that single thread.</span></li>
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">2</span><span>When you&apos;re done, ask it: <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Export our entire conversation so far as one complete Markdown file, verbatim.</code></span></li>
                                    <li className="flex gap-3"><span className="flex-none w-5 h-5 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center mt-0.5">3</span><span>Save it as <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">chat-log.md</code> and upload it as deliverable 3.</span></li>
                                </ol>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-sm text-gray-600"><b className="text-gray-700">Budget ~2 hours — we mean it.</b> A tighter, sharper submission beats an exhaustive one.</p>
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
