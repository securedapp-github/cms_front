import React, { useState } from 'react';
import { 
    Mail, 
    Phone, 
    Clock, 
    HeadphonesIcon, 
    MessageSquare, 
    ShieldAlert, 
    Send,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        category: '',
        message: '',
        agreePrivacy: false,
        subscribeUpdates: false
    });
    
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const categories = [
        { id: 'technical_issue', label: 'Technical Issue' },
        { id: 'consent_issue', label: 'Consent Issue' },
        { id: 'integration_support', label: 'Integration Support' },
        { id: 'feedback', label: 'Feedback & Suggestions' },
        { id: 'other', label: 'Other' }
    ];

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.fullName.trim()) {
            errors.fullName = 'Full Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        }
        if (!formData.category) errors.category = 'Please select a category';
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.length < 20) {
            errors.message = 'Please provide more details (at least 20 characters)';
        }
        
        if (!formData.agreePrivacy) {
            errors.agreePrivacy = 'You must agree to the privacy policy';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setSubmitState('submitting');
        
        try {
            const selectedCategory = categories.find(c => c.id === formData.category)?.label || formData.category;

            const response = await fetch('https://crm-be.securedapp.io/api/public/project-inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    mobile: formData.phoneNumber,
                    email: formData.email,
                    serviceOffering: selectedCategory,
                    message: formData.message,
                    agreePrivacy: formData.agreePrivacy,
                    subscribeUpdates: formData.subscribeUpdates
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit query');
            }

            setSubmitState('success');
            setFormData({ fullName: '', phoneNumber: '', email: '', category: '', message: '', agreePrivacy: false, subscribeUpdates: false });
            setFormErrors({});
        } catch (err) {
            setSubmitState('error');
            setErrorMessage('Failed to submit your query. Please try again later.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Section: Information */}
                <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Support</h1>
                        <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                            Need help with consent management, integrations, compliance queries, or general platform issues? We're here to assist you.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Support</p>
                                <p className="text-sm font-bold text-slate-800">support@securecms.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Priority Call</p>
                                <p className="text-sm font-bold text-slate-800">+1 (800) 123-4567</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Availability</p>
                                <p className="text-sm font-bold text-slate-800">24/7 for Critical Issues</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Support Types</h3>
                        
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm flex gap-4 items-start">
                            <HeadphonesIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">Customer Support</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Assistance with platform usage, account settings, and general inquiries.</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm flex gap-4 items-start">
                            <MessageSquare className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">Feedback & Suggestions</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Share your ideas for product improvements and new feature requests.</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm flex gap-4 items-start">
                            <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">Compliance & Legal</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Guidance on data privacy regulations, DSR policies, and legal queries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Form Card */}
                <div className="w-full md:w-7/12 lg:w-2/3">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full">
                        {/* Decorative background element matching standard dashboard UI */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                        
                        <div className="relative mb-8">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Get in Touch</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Submit your query anytime and our team will get back to you shortly.</p>
                        </div>

                        {submitState === 'success' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted Successfully</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-8">
                                    Thank you for reaching out. A support ticket has been created and we will respond to you via email shortly.
                                </p>
                                <button 
                                    onClick={() => setSubmitState('idle')}
                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                >
                                    Submit Another Query
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative flex-1">
                                {submitState === 'error' && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-800">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-semibold">{errorMessage}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${formErrors.fullName ? 'border-rose-300 ring-rose-100' : 'border-slate-200'} rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium`}
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                                        }}
                                        disabled={submitState === 'submitting'}
                                    />
                                    {formErrors.fullName && <p className="text-xs text-rose-500 font-semibold mt-1 ml-1">{formErrors.fullName}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address <span className="text-rose-500">*</span></label>
                                        <input
                                            type="email"
                                            className={`w-full px-5 py-3.5 bg-slate-50 border ${formErrors.email ? 'border-rose-300 ring-rose-100' : 'border-slate-200'} rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium`}
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                            }}
                                            disabled={submitState === 'submitting'}
                                        />
                                        {formErrors.email && <p className="text-xs text-rose-500 font-semibold mt-1 ml-1">{formErrors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number <span className="text-rose-500">*</span></label>
                                        <input
                                            type="tel"
                                            className={`w-full px-5 py-3.5 bg-slate-50 border ${formErrors.phoneNumber ? 'border-rose-300 ring-rose-100' : 'border-slate-200'} rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium`}
                                            value={formData.phoneNumber}
                                            onChange={(e) => {
                                                setFormData({ ...formData, phoneNumber: e.target.value });
                                                if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' });
                                            }}
                                            disabled={submitState === 'submitting'}
                                        />
                                        {formErrors.phoneNumber && <p className="text-xs text-rose-500 font-semibold mt-1 ml-1">{formErrors.phoneNumber}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                                    <select
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${formErrors.category ? 'border-rose-300 ring-rose-100' : 'border-slate-200'} rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer`}
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, category: e.target.value });
                                            if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                                        }}
                                        disabled={submitState === 'submitting'}
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                    {formErrors.category && <p className="text-xs text-rose-500 font-semibold mt-1 ml-1">{formErrors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message <span className="text-rose-500">*</span></label>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.message.length > 1000 ? 'text-rose-500' : 'text-slate-300'}`}>
                                            {formData.message.length}/1000
                                        </span>
                                    </div>
                                    <textarea
                                        className={`w-full px-5 py-4 bg-slate-50 border ${formErrors.message ? 'border-rose-300 ring-rose-100' : 'border-slate-200'} rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium resize-none h-40`}
                                        value={formData.message}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 1000) {
                                                setFormData({ ...formData, message: e.target.value });
                                                if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                                            }
                                        }}
                                        disabled={submitState === 'submitting'}
                                    />
                                    {formErrors.message && <p className="text-xs text-rose-500 font-semibold mt-1 ml-1">{formErrors.message}</p>}
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setFormData({ ...formData, agreePrivacy: !formData.agreePrivacy })}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${formData.agreePrivacy ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'}`}>
                                            {formData.agreePrivacy && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-700 leading-tight">I agree to the privacy policy and terms of service <span className="text-rose-500">*</span></p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Your data is handled securely according to DPDP protocols.</p>
                                        </div>
                                    </div>
                                    {formErrors.agreePrivacy && <p className="text-xs text-rose-500 font-semibold ml-8">{formErrors.agreePrivacy}</p>}

                                    <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setFormData({ ...formData, subscribeUpdates: !formData.subscribeUpdates })}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${formData.subscribeUpdates ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'}`}>
                                            {formData.subscribeUpdates && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-700 leading-tight">Subscribe to product updates and newsletters</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Stay informed about new features and compliance guides (optional).</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={submitState === 'submitting'}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                                    >
                                        {submitState === 'submitting' ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Submit Request</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
