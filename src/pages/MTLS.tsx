import React, { useState } from 'react';
import useSWR from 'swr';
import {
    Plus,
    Trash2,
    Calendar,
    Shield,
    Loader2,
    Download,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Copy,
    Terminal
} from 'lucide-react';
import { mtlsApi, Certificate } from '../api/mtlsApi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { canViewSensitiveConfig } from '../utils/rbac';
import forge from 'node-forge';

function extractCnFromCsr(csrPem: string): string {
    try {
        // Remove PEM header/footer and whitespace
        const base64 = csrPem
            .replace(/-----BEGIN CERTIFICATE REQUEST-----/g, '')
            .replace(/-----END CERTIFICATE REQUEST-----/g, '')
            .replace(/\s/g, '');

        // Base64 -> binary DER
        const der = forge.util.decode64(base64);

        // Parse DER ASN.1
        const csrAsn1 = forge.asn1.fromDer(der);

        // PKCS#10 structure:
        // CertificationRequest
        //   CertificationRequestInfo
        //     version
        //     subject
        //     subjectPKInfo
        //     attributes
        const certRequestInfo = csrAsn1.value[0];

        // Subject is the second item:
        //   [0] version
        //   [1] subject
        const subject = certRequestInfo.value[1];

        if (!subject || !Array.isArray(subject.value)) {
            return 'Unknown';
        }

        // Subject = SEQUENCE OF RDN
        for (const rdnSet of subject.value) {
            if (!Array.isArray(rdnSet.value)) continue;

            for (const attr of rdnSet.value) {
                if (!Array.isArray(attr.value) || attr.value.length < 2) {
                    continue;
                }

                const oidNode = attr.value[0];
                const valueNode = attr.value[1];

                // 2.5.4.3 = commonName
                if (
                    oidNode?.type === forge.asn1.Type.OID &&
                    forge.asn1.derToOid(oidNode.value) === '2.5.4.3'
                ) {
                    return valueNode.value || 'Unknown';
                }
            }
        }

        return 'Unknown';
    } catch (error) {
        console.error('Failed to parse CSR:', error);
        return 'Unknown';
    }
}

const MTLS = () => {
    const { user } = useAuthStore();
    const { data: certificates = [], error, isLoading, mutate } = useSWR('mtls-certs', () => mtlsApi.listCertificates());

    // CA Certificate SWR
    const { data: caCert } = useSWR('mtls-ca', () => mtlsApi.getCaCertificate());

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

    // Modals & form state
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [csrInput, setCsrInput] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [signedCertData, setSignedCertData] = useState<Certificate | null>(null);
    const [copiedCert, setCopiedCert] = useState(false);

    // OpenSSL Command Generator state
    const [certCN, setCertCN] = useState('tenant-client');
    const [certOrg, setCertOrg] = useState('My Company');
    const [certCountry, setCertCountry] = useState('US');
    const [copiedCommand, setCopiedCommand] = useState(false);

    // Deactivation state
    const [certToDeactivate, setCertToDeactivate] = useState<string | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const handleSignCsr = async () => {
        if (!csrInput.trim()) {
            toast.error('Please paste a valid CSR PEM string');
            return;
        }

        if (!csrInput.includes('-----BEGIN CERTIFICATE REQUEST-----') || !csrInput.includes('-----END CERTIFICATE REQUEST-----')) {
            toast.error('Invalid CSR format. Make sure it contains BEGIN and END CERTIFICATE REQUEST lines.');
            return;
        }

        setIsSigning(true);
        try {
            const data = await mtlsApi.signCsr(csrInput.trim());
            setSignedCertData(data);
            toast.success('Certificate signed successfully!');
            mutate();
            setCsrInput('');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to sign CSR';
            toast.error(msg);
        } finally {
            setIsSigning(false);
        }
    };

    const handleDeactivate = async () => {
        if (!certToDeactivate) return;
        setIsDeactivating(true);
        try {
            await mtlsApi.deactivateCertificate(certToDeactivate);
            toast.success('Certificate deactivated successfully');
            mutate();
            setCertToDeactivate(null);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to deactivate certificate';
            toast.error(msg);
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDownloadPEM = (filename: string, content: string) => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
    };

    // Filter logic — uses safe access with fallback empty strings
    const filteredCerts = certificates.filter((cert: Certificate) => {
        const cn = extractCnFromCsr(cert.csr || '');
        const serial = cert.serial_number || '';

        const matchesSearch =
            cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            serial.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'active' ? cert.active :
                    !cert.active;

        return matchesSearch && matchesStatus;
    });

    const openSslCommand = `openssl req -new -newkey rsa:2048 -nodes -keyout client.key -out client.csr -subj "/CN=${certCN}/O=${certOrg}/C=${certCountry}"`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">mTLS Configurations</h2>
                    <p className="text-slate-500 font-medium text-sm">Manage client certificates for secure Mutual TLS authentication.</p>
                </div>
                <div className="flex items-center gap-3">
                    {caCert && (
                        <button
                            onClick={() => handleDownloadPEM('ca-certificate.pem', caCert)}
                            className="inline-flex items-center px-4 py-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl transition-all active:scale-95"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download CA Cert
                        </button>
                    )}
                    {canViewSensitiveConfig(user?.role) && (
                        <button
                            onClick={() => {
                                setSignedCertData(null);
                                setIsSignModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Sign New Certificate
                        </button>
                    )}
                </div>
            </div>

            {/* Security Banner */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                {/* <div>
                    <p className="text-sm font-bold text-indigo-900">mTLS Authentication</p>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                        To connect with our APIs securely via Mutual TLS, request a certificate by submitting a CSR (Certificate Signing Request). Use the signed certificate alongside the CA Certificate when initiating requests.
                    </p>
                </div> */}
                <div>
                    <p className="text-sm font-bold text-indigo-900">
                        mTLS Authentication
                    </p>

                    <p className="text-xs text-indigo-700 font-medium leading-relaxed mb-3">
                        To connect with our APIs securely via Mutual TLS, generate a key pair
                        and CSR locally. Submit the CSR for signing. Never share your private
                        key with us. After signing, use the signed client certificate together
                        with the CA Certificate when initiating API requests.
                    </p>

                    <div className="bg-white/70 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900 space-y-3">
                        <div>
                            <p className="font-bold mb-1">1. Generate key pair</p>
                            <pre className="font-mono whitespace-pre-wrap text-[11px]">
                                {`openssl ecparam -name prime256v1 -genkey -noout -out client.key`}
                            </pre>
                        </div>

                        <div>
                            <p className="font-bold mb-1">2. Generate CSR</p>
                            <pre className="font-mono whitespace-pre-wrap text-[11px]">
                                {`openssl req -new \\
-key client.key \\
-out client.csr \\
-subj "/C=IN/O=Tenant Name/CN=Tenant Workspace Identity"`}
                            </pre>
                        </div>

                        <div>
                            <p className="font-bold mb-1">3. Check CSR</p>
                            <pre className="font-mono whitespace-pre-wrap text-[11px]">
                                {`openssl req -in client.csr -text -noout`}
                            </pre>
                        </div>

                        <div className="pt-1 border-t border-indigo-100">
                            <p>
                                Submit <code className="font-mono">client.csr</code> for getting new certificate.
                                Keep <code className="font-mono">client.key</code> private and
                                never upload or share it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Common Name or Serial..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                            <Filter className="w-3.5 h-3.5" /> Status:
                        </div>
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                            {(['all', 'active', 'deactivated'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1 text-xs font-bold capitalize rounded-md transition-all ${statusFilter === status
                                        ? 'bg-slate-100 text-slate-800'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Common Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expires</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading Certificates...
                                    </td>
                                </tr>
                            ) : filteredCerts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                        No certificates found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredCerts.map((cert: Certificate) => {
                                    const cn = extractCnFromCsr(cert.csr || '');
                                    return (
                                        <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 text-sm">{cn}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-600">
                                                {cert.serial_number || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-xs text-slate-600 gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {cert.created_at ? new Date(cert.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {cert.active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Deactivated
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownloadPEM(`client-cert-${(cert.serial_number || cert.id).substring(0, 8)}.pem`, cert.certificate)}
                                                        title="Download Signed Certificate"
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    {cert.active && canViewSensitiveConfig(user?.role) && (
                                                        <button
                                                            onClick={() => setCertToDeactivate(cert.id)}
                                                            title="Deactivate Certificate"
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deactivation Modal */}
            {certToDeactivate && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-xl animate-in scale-in duration-200">
                        <h3 className="text-lg font-bold text-slate-900">Deactivate Client Certificate?</h3>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                            This action will immediately revoke/deactivate the certificate. Client connections using this certificate will fail mTLS authentication. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setCertToDeactivate(null)}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeactivate}
                                disabled={isDeactivating}
                                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isDeactivating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deactivating...
                                    </>
                                ) : (
                                    'Confirm Deactivation'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSR Sign Modal */}
            {isSignModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-100 shadow-xl mx-4 my-auto animate-in scale-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Sign Certificate Signing Request (CSR)</h3>
                            <button
                                onClick={() => setIsSignModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {!signedCertData ? (
                            <div className="space-y-4">
                                {/* OpenSSL helper */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <Terminal className="w-4 h-4 text-indigo-500" />
                                        Generate Key & CSR locally
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Common Name</label>
                                            <input
                                                type="text"
                                                value={certCN}
                                                onChange={(e) => setCertCN(e.target.value)}
                                                className="w-full text-xs border border-slate-200 rounded-lg p-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Org Name</label>
                                            <input
                                                type="text"
                                                value={certOrg}
                                                onChange={(e) => setCertOrg(e.target.value)}
                                                className="w-full text-xs border border-slate-200 rounded-lg p-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Country</label>
                                            <input
                                                type="text"
                                                value={certCountry}
                                                onChange={(e) => setCertCountry(e.target.value)}
                                                className="w-full text-xs border border-slate-200 rounded-lg p-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="flex-1 text-[10px] font-mono bg-white border border-slate-200 rounded-lg p-2 text-slate-700 overflow-x-auto select-all">
                                            {openSslCommand}
                                        </code>
                                        <button
                                            onClick={() => handleCopyText(openSslCommand, setCopiedCommand)}
                                            className="px-2.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg shrink-0 text-slate-600"
                                            title="Copy OpenSSL command"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Paste CSR PEM</label>
                                    <textarea
                                        placeholder={"-----BEGIN CERTIFICATE REQUEST-----\n...\n-----END CERTIFICATE REQUEST-----"}
                                        value={csrInput}
                                        onChange={(e) => setCsrInput(e.target.value)}
                                        rows={8}
                                        className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setIsSignModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSignCsr}
                                        disabled={isSigning}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {isSigning ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Signing...
                                            </>
                                        ) : (
                                            'Sign CSR'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-950">Certificate Generated Successfully</p>
                                        <p className="text-xs text-emerald-700 font-medium">
                                            Your client certificate has been signed by the CA. Copy or download it below.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <div>
                                        <span className="font-bold text-slate-500 uppercase block text-[10px]">Common Name</span>
                                        <span className="text-slate-800 font-semibold">{extractCnFromCsr(signedCertData.csr || '')}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-500 uppercase block text-[10px]">Serial Number</span>
                                        <span className="text-slate-800 font-mono">{signedCertData.serial_number || '—'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Certificate PEM</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCopyText(signedCertData.certificate, setCopiedCert)}
                                                className="inline-flex items-center px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                {copiedCert ? 'Copied' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPEM(`client-cert-${(signedCertData.serial_number || signedCertData.id).substring(0, 8)}.pem`, signedCertData.certificate)}
                                                className="inline-flex items-center px-2.5 py-1 text-xs bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg text-indigo-700 font-bold"
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        readOnly
                                        value={signedCertData.certificate}
                                        rows={8}
                                        className="w-full font-mono text-[10px] p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 select-all"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => setIsSignModalOpen(false)}
                                        className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MTLS;
