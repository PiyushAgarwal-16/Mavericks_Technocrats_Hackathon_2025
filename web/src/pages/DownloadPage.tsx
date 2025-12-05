import React from 'react';
import { Download, Shield, HardDrive, Zap, CheckCircle, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Hero */}
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-in slide-in-from-bottom-8 duration-700">
                        Secure Erase <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-primary">Anywhere.</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-700 delay-100">
                        ZeroTrace Portable requires no installation. Carry it on a USB drive and sanitize any Windows machine instantly.
                    </p>

                    {/* Download Card */}
                    <div className="glass-panel p-1 rounded-3xl inline-block mb-16 animate-in zoom-in duration-500 delay-200">
                        <div className="bg-black/40 rounded-[22px] p-8 md:p-12 border border-white/5">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-primary to-cyan rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.3)]">
                                    <Package className="text-white w-16 h-16" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-2xl font-bold text-white mb-2">ZeroTrace Portable (v1.0.0)</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10">
                                            {/* <Windows size={14} />  Windows Icon not in all sets, confirm availability or use text */}
                                            <span className="font-bold">Windows 10/11</span>
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10">
                                            <HardDrive size={14} /> 64-bit
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10">
                                            <Zap size={14} /> Instant Run
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <a
                                            href="/downloads/ZeroTrace_Portable.zip"
                                            download
                                            className="btn-glow flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
                                        >
                                            <Download size={20} /> Download .ZIP
                                        </a>
                                        <Link to="/compare" className="px-6 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-gray-300 font-medium">
                                            Release Notes
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="text-primary w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Military-Grade</h3>
                            <p className="text-gray-400 text-sm">DoD 5220.22-M and NIST 800-88 compliant algorithms built-in.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="text-cyan w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Plug & Purge</h3>
                            <p className="text-gray-400 text-sm">No admin installation required. Runs directly from USB or local storage.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Auto-Certificate</h3>
                            <p className="text-gray-400 text-sm">Generates cryptographically signed PDFs for every wipe session.</p>
                        </div>
                    </div>

                    <div className="mt-20">
                        <Link to="/" className="text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                            Back to Home <ArrowRight size={16} />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};
