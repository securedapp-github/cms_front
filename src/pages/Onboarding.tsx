import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    Globe2, 
    AlertCircle, 
    ArrowRight, 
    FileText, 
    MapPin,
    Building,
    Building2,
    Loader2
} from 'lucide-react';
import { tenantApi } from '../api/tenantApi';
import { countryConfigs } from '../config/countryValidation';
import logo from '../assets/img/STRIGHT.png';

const Onboarding = () => {
    const { user, completeOnboarding } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        organizationName: (user as any)?.organization_name || '',
        industry: '',
        country: '',
        cin: '',
        gst: '',
        address: {
            line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
        }
    });

    useEffect(() => {
        if ((user as any)?.organization_name && !formData.organizationName) {
            setFormData(prev => ({ ...prev, organizationName: (user as any).organization_name }));
        }
    }, [user]);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const countryConfig = formData.country ? countryConfigs[formData.country] : null;

    const validateField = (name: string, value: any, currentCountry: string) => {
        const config = countryConfigs[currentCountry];
        if (!config) return '';

        if (name === 'postal_code') {
            if (!config.postalCode.regex.test(value)) {
                return config.postalCode.message;
            }
        }

        if (name === 'state') {
            if (!config.states.includes(value)) {
                return `Please select a valid state for ${config.name}.`;
            }
        }

        if (name === 'cin' || name === 'gst') {
            if (value && config.legal[name] && !config.legal[name].regex.test(value)) {
                return config.legal[name].message;
            }
        }

        return '';
    };

    const handleCountryChange = (countryCode: string) => {
        setFormData({
            ...formData,
            country: countryCode,
            cin: '',
            gst: '',
            address: {
                ...formData.address,
                state: '',
                postal_code: '',
                country: countryCode
            }
        });
        setFieldErrors({});
    };

    const handleFieldChange = (section: 'base' | 'address', field: string, value: string) => {
        if (section === 'base') {
            const newFormData = { ...formData, [field]: value };
            setFormData(newFormData);
            
            if (field === 'cin' || field === 'gst') {
                const err = validateField(field, value, formData.country);
                setFieldErrors(prev => ({ ...prev, [field]: err }));
            }
        } else {
            const newAddress = { ...formData.address, [field]: value };
            setFormData({ ...formData, address: newAddress });
            
            const err = validateField(field, value, formData.country);
            setFieldErrors(prev => ({ ...prev, [field]: err }));
        }
    };

    const isFormValid = () => {
        const { organizationName, country } = formData;
        const { line1, city, state, postal_code } = formData.address;

        // Strict check for all required fields
        const allFieldsFilled = 
            organizationName.trim() !== '' && 
            country !== '' && 
            line1.trim() !== '' && 
            city.trim() !== '' && 
            state !== '' && 
            postal_code.trim() !== '';

        if (!allFieldsFilled) return false;
        
        // Check for any active validation errors (e.g. postal code regex)
        const hasErrors = Object.values(fieldErrors).some(err => !!err);
        return !hasErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.organizationName || !formData.country || !formData.address.line1 || !formData.address.city || !formData.address.state || !formData.address.postal_code) {
            setError('Please fill in all required fields (Organization, Country, and Address)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await tenantApi.onboardTenant({
                organizationName: formData.organizationName,
                industry: formData.industry,
                country: formData.country,
                cin: formData.cin,
                gst: formData.gst,
                address: {
                    ...formData.address,
                    country: formData.country // Use the selected country for address as well
                }
            });

            const tenantId = response.tenant?.id || response.tenant_id;
            const clientId = response.client?.id || response.client_id;
            const fullToken = response.token;

            completeOnboarding(fullToken, tenantId, clientId, {
                organizationName: formData.organizationName,
                industry: formData.industry,
                country: formData.country
            }, response.client?.role);

            navigate('/dashboard');

        } catch (err: any) {
            console.error('Onboarding failed:', err);
            setError(err?.response?.data?.message || err?.response?.data?.error || 'An error occurred setting up your tenant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="SecureCMS" className="h-28 w-auto object-contain" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Setup your Organization
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                    Welcome, <span className="text-indigo-600 font-bold">{user?.name}</span>. Let's get your secure environment ready.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-10 px-8 shadow-xl shadow-slate-200/50 border border-slate-200 sm:rounded-3xl">
                    <form className="space-y-8" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Section 1: Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Building className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor="organizationName" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Organization Name *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g., Acme Corp"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Industry</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g., Technology"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="country" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Country *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Globe2 className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <select
                                        id="country"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={formData.country}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                    >
                                        <option value="" disabled>Select Organization Location</option>
                                        <option value="IN">India</option>
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="CA">Canada</option>
                                        <option value="AU">Australia</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Consent Flow removed */}
                        </div>

                        {/* Section 2: Legal Information (Conditional) */}
                        {countryConfig?.legal?.applicable?.length > 0 && (
                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {countryConfig.legal.applicable.includes('cin') && (
                                        <div className="space-y-1.5">
                                            <label htmlFor="cin" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">CIN (India Only)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., L12345MH2020PLC123456"
                                                className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.cin ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase`}
                                                value={formData.cin}
                                                onChange={(e) => handleFieldChange('base', 'cin', e.target.value)}
                                            />
                                            {fieldErrors.cin && <p className="text-[10px] font-bold text-red-500 pl-1">{fieldErrors.cin}</p>}
                                        </div>
                                    )}
                                    {countryConfig.legal.applicable.includes('gst') && (
                                        <div className="space-y-1.5">
                                            <label htmlFor="gst" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">GSTIN</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., 22AAAAA0000A1Z5"
                                                className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.gst ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase`}
                                                value={formData.gst}
                                                onChange={(e) => handleFieldChange('base', 'gst', e.target.value)}
                                            />
                                            {fieldErrors.gst && <p className="text-[10px] font-bold text-red-500 pl-1">{fieldErrors.gst}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Business Address */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Address</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="line1" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Street Address *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Flat, House no., Building, Company, Apartment"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.address.line1}
                                        onChange={(e) => handleFieldChange('address', 'line1', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label htmlFor="city" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">City *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.address.city}
                                            onChange={(e) => handleFieldChange('address', 'city', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="state" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">State / Province *</label>
                                        <select
                                            id="state"
                                            required
                                            className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.state ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none`}
                                            value={formData.address.state}
                                            onChange={(e) => handleFieldChange('address', 'state', e.target.value)}
                                            disabled={!formData.country}
                                        >
                                            <option value="" disabled>Select State</option>
                                            {countryConfig?.states?.map((state: string) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.state && <p className="text-[10px] font-bold text-red-500 pl-1">{fieldErrors.state}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="postal_code" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Zip / Postal Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={formData.country === 'IN' ? 'e.g., 600001' : 'e.g., 10001'}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.postal_code ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                                        value={formData.address.postal_code}
                                        onChange={(e) => handleFieldChange('address', 'postal_code', e.target.value)}
                                    />
                                    {fieldErrors.postal_code && <p className="text-[10px] font-bold text-red-500 pl-1">{fieldErrors.postal_code}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className={`w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-sm font-bold text-white transition-all active:scale-[0.98] ${loading || !isFormValid() ? 'bg-indigo-400 cursor-not-allowed grayscale' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Building2 className="w-4 h-4 mr-2 animate-pulse" />
                                        Creating Workspace...
                                    </>
                                ) : (
                                    <>
                                        Complete Onboarding
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Secure CMS - DPDP Compliant Data Management
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
