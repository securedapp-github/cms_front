import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
    const plans = [
        {
            name: "Basic",
            price: "₹499/month",
            features: [
                "Up to 100 consents",
                "Basic analytics",
                "Email support"
            ]
        },
        {
            name: "Pro",
            price: "₹1499/month",
            features: [
                "Unlimited consents",
                "Advanced analytics",
                "Priority support"
            ]
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: [
                "Dedicated infrastructure",
                "Full API access",
                "24/7 support"
            ]
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing Plans</h1>
                    <p className="text-sm text-slate-500 mt-1">Choose the right plan to manage and scale your consent infrastructure seamlessly.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
                {plans.map((plan, index) => (
                    <div key={index} className={`flex flex-col p-8 rounded-2xl shadow-sm border bg-white relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${plan.name === 'Pro' ? 'border-indigo-500 shadow-indigo-100 ring-1 ring-indigo-500' : 'border-slate-200'}`}>
                        {plan.name === 'Pro' && (
                            <span className="absolute -top-3 inset-x-0 mx-auto w-fit px-3 py-1 bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-widest rounded-full">
                                Most Popular
                            </span>
                        )}
                        <h2 className="text-xl font-bold text-slate-800">{plan.name}</h2>
                        <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
                            {plan.price}
                        </div>
                        <ul className="mt-8 space-y-4 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center text-slate-600 text-sm font-medium">
                                    <CheckCircle2 className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.name === 'Pro' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button className={`mt-8 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${plan.name === 'Pro' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                            Choose {plan.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
