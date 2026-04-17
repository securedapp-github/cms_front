import React from "react";
import { Check, Minus } from 'lucide-react';

const plans = [
    {
        name: "Explorer",
        price: "Free",
        consents: "3K",
        setup: "Free",
        highlight: false,
        description: "Perfect for exploring the platform features."
    },
    {
        name: "Starter",
        price: "₹2,999",
        consents: "10K",
        setup: "₹10K – ₹25K",
        highlight: false,
        description: "Perfect for small projects and individuals."
    },
    {
        name: "Growth",
        price: "₹9,999",
        consents: "100K",
        setup: "₹25K – ₹75K",
        highlight: true,
        description: "Ideal for growing startups and businesses."
    },
    {
        name: "Scale",
        price: "₹24,999",
        consents: "500K",
        setup: "₹1L – ₹3L",
        highlight: false,
        description: "Advanced features for large-scale enterprise."
    }
];

const compareSections = [
    {
        title: "CORE PLATFORM",
        rows: [
            { label: "Multi-Tenant (Org + Apps)", values: [true, true, true, true] },
            { label: "Consent Management (OTP: Email/SMS/WhatsApp)", values: [false, true, true, true] },
            { label: "Purpose & Data Catalogue Management", values: [true, true, true, true] },
            { label: "Redirect + Embedded Consent Flow", values: [false, true, true, true] },
            { label: "Webhooks", values: [false, true, true, true] },
            { label: "API Authentication (PKI, mTLS, IP Whitelisting)", values: [false, true, true, true] },
            { label: "Google Login (Dashboard)", values: [true, true, true, true] }
        ]
    },
    {
        title: "GOVERNANCE & COMPLIANCE",
        rows: [
            { label: "Policy Versioning", values: [false, true, true, true] },
            { label: "Compliance Management", values: [false, true, true, true] },
            { label: "Audit Logs", values: ["Basic", "Standard", "Advanced", "Blockchain-based Immutable"] },
            { label: "RBAC (Role-Based Access Control)", values: ["Basic", "Standard", "Advanced", "Custom"] },
            { label: "Grievance Redressal & DPO Escalation", values: [false, true, true, true] },
            { label: "Feedback Collection", values: [false, true, true, true] }
        ]
    },
    {
        title: "ADVANCED DATA GOVERNANCE",
        rows: [
            { label: "Data Intelligence & Discovery", values: [false, false, true, true] },
            { label: "Data Subject Rights Automation", values: [false, false, true, true] },
            { label: "Real-Time Consent Enforcement (API/SDK)", values: [false, false, true, true] },
            { label: "Sensitivity & Risk Monitoring", values: [false, false, true, true] },
            { label: "Data Mapping & Lineage", values: [false, false, true, true] }
        ]
    },
    {
        title: "INTEGRATIONS",
        rows: [
            { label: "Basic API Access", values: [true, true, true, true] },
            { label: "Bank System Integrations (CBS, ESB, etc.)", values: [false, false, true, true] },
            { label: "Custom Integrations", values: [false, false, false, true] }
        ]
    },
    {
        title: "COOKIE MANAGEMENT PLATFORM",
        rows: [
            { label: "Cookie Consent Banner", values: [true, true, true, true] },
            { label: "Consent Categories (Essential, Analytics, Marketing)", values: [true, true, true, true] },
            { label: "Auto Script Blocking / Enabling", values: [false, true, true, true] },
            { label: "Multi-Language Support", values: [true, true, true, true] },
            { label: "Auto-Expiry of Consent", values: [true, true, true, true] },
            { label: "SDK + Backend Sync", values: [true, true, true, true] },
            { label: "Webhook Events", values: [false, true, true, true] }
        ]
    },
    {
        title: "ACCESS CONTROL (RBAC)",
        rows: [
            { label: "Predefined Roles (Admin, Ops, Auditor)", values: [true, true, true, true] },
            { label: "Custom Roles", values: [false, false, true, true] },
            { label: "Fine-Grained Permissions", values: [false, false, true, true] },
            { label: "Cross-Org Visibility (Super Admin)", values: [false, false, false, true] }
        ]
    },
    {
        title: "ANALYTICS & REPORTING",
        rows: [
            { label: "Basic Dashboard", values: [true, true, true, true] },
            { label: "Consent Analytics", values: [false, true, true, true] },
            { label: "Audit Reports", values: [false, true, true, true] },
            { label: "Advanced Compliance Reports", values: [false, false, true, true] }
        ]
    },
    {
        title: "SUPPORT",
        rows: [
            { label: "Email Support", values: [true, true, true, true] },
            { label: "Priority Support", values: [false, false, true, true] },
            { label: "SLA", values: [false, false, true, true] },
            { label: "Dedicated Support / Onboarding", values: [false, false, false, true] }
        ]
    }
];

const Pricing = () => {
    return (
        <div className="bg-slate-50 text-slate-900 px-4 sm:px-8 py-16 min-h-screen relative font-sans">
            <div className="max-w-7xl mx-auto space-y-24 relative z-10 animate-in fade-in duration-700">
                {/* 1. SECTION: PRICING CARDS (TOP) */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-[42px] font-extrabold tracking-tight mb-4 text-[#111827] leading-[1.1]">
                        Subscription Plans
                    </h1>
                    <p className="text-[#6b7280] text-lg font-medium">
                        Choose the plan that's right for your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] items-stretch pb-12">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            style={{
                                border: plan.highlight ? '2px solid #5b5ce2' : '1px solid #e5e7eb',
                                boxShadow: plan.highlight 
                                    ? '0 8px 24px rgba(0,0,0,0.06), 0 0 0 4px rgba(91,92,226,0.08)' 
                                    : '0 8px 24px rgba(0,0,0,0.06)'
                            }}
                            className="bg-white rounded-[16px] p-[28px] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] flex flex-col group cursor-default"
                        >
                            <div className="mb-6">
                                <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-[#6b7280]">
                                    {plan.name}
                                </h2>
                                <p className="text-[#9ca3af] text-[13px] mt-2 font-medium leading-relaxed min-h-[40px]">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-8 flex items-baseline">
                                <span className="text-[36px] font-bold text-[#111827] tracking-tight">{plan.price}</span>
                                {plan.price !== 'Free' && <span className="text-[14px] font-medium text-[#9ca3af] ml-1">/month</span>}
                            </div>

                            <div className="flex-1 space-y-[10px] mb-8">
                                <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                    <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                    <span className="font-medium">{plan.consents} Consents</span>
                                </div>
                                <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                    <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                    <span className="font-medium">{plan.setup} Setup Fee</span>
                                </div>
                                {(plan.name === "Growth" || plan.name === "Scale") && (
                                    <>
                                        <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                            <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                            <span className="font-medium">Data Subject Rights Automation</span>
                                        </div>
                                        <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                            <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                            <span className="font-medium">Real-Time Consent Enforcement</span>
                                        </div>
                                        <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                            <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                            <span className="font-medium">Data Intelligence & Discovery</span>
                                        </div>
                                    </>
                                )}
                                {plan.name === "Scale" && (
                                    <div className="flex items-center gap-[10px] text-[14px] text-[#4b5563]">
                                        <Check className="w-4 h-4 text-[#5b5ce2]" strokeWidth={3} />
                                        <span className="font-medium">Custom SLA & Support</span>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>

                {/* 2. SECTION: COMPARISON SYSTEM */}
                <div className="space-y-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-[28px] font-bold tracking-tight mb-3 text-[#111827]">
                            Compare our plans
                        </h2>
                        <p className="text-[#6b7280] font-medium text-base">
                            Everything you need to manage privacy at scale.
                        </p>
                    </div>

                    <div className="relative overflow-visible">
                        {/* STICKY PLAN SELECTOR ROW */}
                        <div className="sticky top-16 z-[20] bg-slate-50/95 backdrop-blur-md border-b border-[#e5e7eb] pt-8 pb-4">
                            <div className="flex w-full items-center">
                                <div className="w-[30%] min-w-[200px] text-[14px] font-bold text-slate-900 uppercase tracking-widest pl-8">
                                    Features
                                </div>
                                <div className="flex-1 grid grid-cols-4 gap-4 px-4">
                                    {plans.map((plan, i) => (
                                        <div key={i} className="text-center">
                                            <div className={`text-[14px] font-bold uppercase tracking-wide mb-1 ${plan.highlight ? 'text-[#5b5ce2]' : 'text-[#111827]'}`}>
                                                {plan.name}
                                            </div>
                                            <div className="text-[12px] font-semibold text-[#9ca3af]">
                                                {plan.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COMPARISON TABLE CONTENT */}
                        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
                            {compareSections.map((section, sIdx) => (
                                <div key={sIdx} className="w-full">
                                    {/* Section Heading Row */}
                                    <div className="bg-slate-50/50 border-b border-[#e5e7eb] px-8 py-4">
                                        <h3 className="text-[12px] font-bold text-[#111827] uppercase tracking-[1.5px]">
                                            {section.title}
                                        </h3>
                                    </div>

                                    {/* Row Items */}
                                    <div className="w-full">
                                        {section.rows.map((row, rIdx) => (
                                            <div 
                                                key={rIdx} 
                                                className="flex border-b border-[#e5e7eb] last:border-0 hover:bg-slate-50/30 transition-colors items-center h-[72px]"
                                            >
                                                {/* Feature Label */}
                                                <div className="w-[30%] min-w-[200px] pl-8 flex items-center h-full">
                                                    <span className="text-[14px] font-medium text-[#4b5563]">
                                                        {row.label}
                                                    </span>
                                                </div>

                                                {/* Plan Values */}
                                                <div className="flex-1 grid grid-cols-4 gap-4 px-4 h-full">
                                                    {row.values.map((val, vIdx) => (
                                                        <div key={vIdx} className="flex justify-center items-center h-full">
                                                            {typeof val === 'boolean' ? (
                                                                val ? (
                                                                    <Check className="w-5 h-5 text-[#5b5ce2]" strokeWidth={3} />
                                                                ) : (
                                                                    <Minus className="w-4 h-4 text-[#cbd5e1]" strokeWidth={2.5} />
                                                                )
                                                            ) : (
                                                                <span className={`text-[13px] font-semibold text-center ${plans[vIdx].highlight ? 'text-[#5b5ce2]' : 'text-[#4b5563]'}`}>
                                                                    {String(val)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
