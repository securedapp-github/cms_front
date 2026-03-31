import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
    text: string;
    className?: string;
    iconSize?: number;
}

export function CopyButton({ text, className = '', iconSize = 14 }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const el = document.createElement('textarea');
            el.value = text;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // If all else fails, show nothing
            }
            document.body.removeChild(el);
        }
    };

    return (
        <div className={`relative group/copy inline-flex ${className}`}>
            <button
                onClick={handleCopy}
                aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
                className={`
                    inline-flex items-center justify-center
                    w-6 h-6 rounded-md
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1
                    ${copied
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                    }
                `}
            >
                {copied
                    ? <Check style={{ width: iconSize, height: iconSize }} strokeWidth={2.5} />
                    : <Copy style={{ width: iconSize, height: iconSize }} />
                }
            </button>

            {/* Tooltip */}
            <span
                className={`
                    pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                    px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap
                    transition-all duration-150
                    ${copied
                        ? 'bg-emerald-600 text-white opacity-100 translate-y-0'
                        : 'bg-slate-800 text-white opacity-0 translate-y-1 group-hover/copy:opacity-100 group-hover/copy:translate-y-0'
                    }
                `}
                role="tooltip"
            >
                {copied ? 'Copied! ✅' : 'Copy'}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
            </span>
        </div>
    );
}
