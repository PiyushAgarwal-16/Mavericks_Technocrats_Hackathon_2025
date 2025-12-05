import React from 'react';
import { Check, X, Shield, Zap, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 py-16 relative z-10 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
                        Why Choose <span className="text-cyan">ZeroTrace</span>?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The only specialized data destruction tool designed for transparency and cryptographic verification.
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="glass-panel rounded-3xl overflow-hidden mb-16">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 border-b border-white/10">
                                    <th className="p-6 text-lg font-bold text-gray-400 w-1/3">Feature</th>
                                    <th className="p-6 text-xl font-bold text-white bg-primary/10 border-x border-primary/20 w-1/3 relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-cyan"></div>
                                        ZeroTrace
                                        <span className="block text-xs font-normal text-cyan mt-1">Recommended</span>
                                    </th>
                                    <th className="p-6 text-lg font-bold text-gray-400 w-1/3">Standard Format (Diskpart)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 flex items-center gap-3">
                                        <Shield className="text-primary w-5 h-5" /> Data Recovery Protection
                                    </td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">
                                        <span className="flex items-center gap-2 text-green-400 font-bold">
                                            <Check size={20} /> Impossible
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">Overwrites with zeros/random patterns</p>
                                    </td>
                                    <td className="p-6 text-gray-400">
                                        <span className="flex items-center gap-2 text-yellow-500 font-bold">
                                            <X size={20} /> Possible
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">Only marks space as available</p>
                                    </td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 flex items-center gap-3">
                                        <FileText className="text-cyan w-5 h-5" /> Proof of Erasure
                                    </td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">
                                        <span className="flex items-center gap-2 text-white font-bold">
                                            <Check size={20} /> Signed Certificate
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">PDF with cryptographic hash</p>
                                    </td>
                                    <td className="p-6 text-gray-400">
                                        <span className="flex items-center gap-2 text-red-500 font-bold">
                                            <X size={20} /> None
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 flex items-center gap-3">
                                        <Zap className="text-yellow-400 w-5 h-5" /> Speed & Efficiency
                                    </td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">
                                        <span className="flex items-center gap-2 text-white font-bold">
                                            <Check size={20} /> Optimized
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">Multi-threaded write operations</p>
                                    </td>
                                    <td className="p-6 text-gray-400">
                                        <span className="flex items-center gap-2 text-white font-bold">
                                            <Check size={20} /> High
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 flex items-center gap-3">
                                        <Lock className="text-purple-400 w-5 h-5" /> Verification
                                    </td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">
                                        <span className="flex items-center gap-2 text-white font-bold">
                                            <Check size={20} /> Cloud Verify
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">Online verification portal</p>
                                    </td>
                                    <td className="p-6 text-gray-400">
                                        <span className="flex items-center gap-2 text-red-500 font-bold">
                                            <X size={20} /> None
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">Ready to secure your hardware?</h2>
                    <div className="flex justify-center gap-4">
                        <Link to="/download" className="btn-glow px-8 py-3 rounded-xl font-bold text-white">
                            Get ZeroTrace
                        </Link>
                        <Link to="/" className="px-8 py-3 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-white font-medium">
                            Back to Home
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
