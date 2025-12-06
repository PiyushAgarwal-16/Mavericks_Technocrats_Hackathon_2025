import React, { useEffect } from 'react';
import { Shield, ArrowLeft, DollarSign, ShoppingBag, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const RewardsPage: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);



    return (
        <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden selection:bg-cyan selection:text-dark">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 py-6">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-cyan rounded-lg flex items-center justify-center">
                                <Shield className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-heading font-bold tracking-wide text-white">ZeroTrace</span>
                        </Link>
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                            <ArrowLeft size={20} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="min-h-screen pt-32 pb-20 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16" data-aos="fade-down">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Recycling & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-primary">Rewards</span></h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Responsibly dispose of your e-waste and get rewarded. We partner with certified recyclers to ensure zero landfill impact.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
                        {/* Reward Card 1 */}
                        <div className="glass-panel p-8 rounded-2xl text-center hover:border-cyan/50 transition-all group" data-aos="fade-up">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/20 transition-colors">
                                <DollarSign className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Cashback</h3>
                            <p className="text-gray-400 text-sm">Get up to $50 cashback when you trade in your wiped device with our partners.</p>
                        </div>

                        {/* Reward Card 2 */}
                        <div className="glass-panel p-8 rounded-2xl text-center hover:border-cyan/50 transition-all group" data-aos="fade-up" data-aos-delay="100">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan/20 transition-colors">
                                <ShoppingBag className="w-8 h-8 text-cyan" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Tech Vouchers</h3>
                            <p className="text-gray-400 text-sm">Earn discount vouchers for new tech purchases from major retailers.</p>
                        </div>

                        {/* Reward Card 3 */}
                        <div className="glass-panel p-8 rounded-2xl text-center hover:border-cyan/50 transition-all group" data-aos="fade-up" data-aos-delay="200">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500/20 transition-colors">
                                <Star className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Eco Credits</h3>
                            <p className="text-gray-400 text-sm">Accumulate credits for every device recycled and redeem for premium features.</p>
                        </div>
                    </div>

                    {/* Responsible E-Waste Disposal Section */}
                    {/* <section id="ewaste" className="py-24 relative overflow-hidden"> */}
                    {/* <div className="max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="300"> */}
                    {/* <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/5 blur-[100px] rounded-full -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full -z-10"></div> */}
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16" data-aos="fade-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold tracking-widest mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf animate-pulse" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                                ECO-FRIENDLY INITIATIVE
                            </div>
                            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Responsible <span className="text-gradient">E-Waste Disposal</span></h2>
                            <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan/5 opacity-50"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                    <div className="bg-white/5 p-4 rounded-full border border-white/10 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw text-cyan w-8 h-8" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                                    </div>
                                    <p className="text-gray-300 text-lg leading-relaxed text-left">ZeroTrace encourages responsible E-waste disposal. After securely wiping your data, connect with India’s top certified E-waste recyclers to ensure your device is processed sustainably.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                            {/* RecycleKaro */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="0">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">RecycleKaro</h3>
                                    <a href="https://recyclekaro.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://recyclekaro.com" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">recyclekaro.com</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">90% recovery rate from Lithium-ion batteries</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – AI-powered plant, Li-ion recovery</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Free Pickup / App Scheduling</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ecoreco */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">Eco Recycling Ltd (Ecoreco)</h3>
                                    <a href="https://ecoreco.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://ecoreco.com" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">ecoreco.com</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">Scientific disposal compliant with CPCB norms</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – Proprietary PCB/Battery recycling</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Pickup or Drop-off Centers (Pan-India)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Karo Sambhav */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">Karo Sambhav</h3>
                                    <a href="https://karosambhav.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://karosambhav.com" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">karosambhav.com</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">Tracking waste from collection to recovery</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – EPR-compliant circular economy</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Bulk van pickups + drop-off points</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Namo eWaste */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="300">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">Namo eWaste</h3>
                                    <a href="https://namoewaste.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://namoewaste.com" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">namoewaste.com</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">End-to-end sustainable e-waste management</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – 4 certified facilities</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Direct doorstep pickups</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ecoverva */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="400">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">Ecoverva</h3>
                                    <a href="https://ecoverva.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://ecoverva.com" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">ecoverva.com</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">Zero landfill policy implementation</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – Sorting/dismantling/recovery</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Pickup scheduling (Delhi/Gurgaon/Mumbai)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rashi Peripherals */}
                            <div className="glass-panel p-6 rounded-2xl group hover:border-cyan/30 transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="500">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-heading text-white">Rashi Peripherals (via Hulladek)</h3>
                                    <a href="https://rptechindia.com/ewastemanagement" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-cyan/20 hover:text-cyan transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                    </a>
                                </div>
                                <a href="https://rptechindia.com/ewastemanagement" target="_blank" rel="noopener noreferrer" className="text-cyan text-sm mb-6 block hover:underline truncate">rptechindia.com/ewastemanagement</a>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Technology</div>
                                            <div className="text-sm text-gray-300">Authorized PRO for safe e-waste handling</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big text-green-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Recycling</div>
                                            <div className="text-sm text-gray-300">Yes – Certified processing</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck text-yellow-400 w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Method</div>
                                            <div className="text-sm text-gray-300">Collection bins, buyback, drop-off centers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-20">
                            <h3 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">Why <span className="text-cyan">Recycle</span> With Them?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-t-2 border-t-green-500/50" data-aos="fade-up">
                                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign w-10 h-10 text-green-400 mb-4" aria-hidden="true"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    <h4 className="text-lg font-bold mb-2">Cashback Rewards</h4>
                                    <p className="text-sm text-gray-400">Get ₹100–₹2000 cash back depending on your device type and condition.</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-t-2 border-t-purple-500/50" data-aos="fade-up" data-aos-delay="100">
                                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gift w-10 h-10 text-purple-400 mb-4" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                                    <h4 className="text-lg font-bold mb-2">Vouchers & Discounts</h4>
                                    <p className="text-sm text-gray-400">Receive shopping vouchers worth up to ₹1000 from partners like Rashi Peripherals.</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-t-2 border-t-cyan-500/50" data-aos="fade-up" data-aos-delay="200">
                                    <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf w-10 h-10 text-cyan mb-4" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                                    <h4 className="text-lg font-bold mb-2">Green Points</h4>
                                    <p className="text-sm text-gray-400">Earn Eco Credits for every device recycled, redeemable for sustainable products.</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-t-2 border-t-yellow-500/50" data-aos="fade-up" data-aos-delay="300">
                                    <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-10 h-10 text-yellow-400 mb-4" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                                    <h4 className="text-lg font-bold mb-2">EPR Credits</h4>
                                    <p className="text-sm text-gray-400">Businesses can reduce compliance costs by 15–20% through certified recycling.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-20">
                            <a href="https://recyclekaro.com/blogs" target="_blank" rel="noopener noreferrer" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors relative overflow-hidden" data-aos="fade-right">
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-heading font-bold text-2xl mb-2 group-hover:text-cyan transition-colors">RecycleKaro Blog</h4>
                                    <p className="text-gray-400 mb-6 max-w-sm">Deep dive into recycling incentives, community drives, and circular economy case studies.</p>
                                    <span className="inline-flex items-center gap-2 text-sm font-bold text-cyan">Read Articles <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
                                </div>
                            </a>
                            <a href="https://spasrecycling.com/top-10-e-waste-recycling-companies-in-india" target="_blank" rel="noopener noreferrer" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors relative overflow-hidden" data-aos="fade-left">
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-heading font-bold text-2xl mb-2 group-hover:text-green-400 transition-colors">SPAS Recycling Insights</h4>
                                    <p className="text-gray-400 mb-6 max-w-sm">Comprehensive list of top firms, detailed reward programs, and compliance insights.</p>
                                    <span className="inline-flex items-center gap-2 text-sm font-bold text-green-400">View Guide <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
                                </div>
                            </a>
                        </div>

                        <div className="glass-panel rounded-3xl p-10 text-center relative overflow-hidden border border-cyan/20">
                            <div className="absolute inset-0 bg-gradient-to-b from-dark to-cyan/10 opacity-80"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,209,255,0.4)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check text-white w-8 h-8" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">Erase Before You Recycle</h2>
                                <p className="text-gray-300 max-w-2xl mb-8">Don't hand over your personal data with your device. Use ZeroTrace to permanently wipe all data and generate a destruction certificate before recycling.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/download" className="px-8 py-3 rounded-xl bg-white text-dark font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download" aria-hidden="true"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg>
                                        Download ZeroTrace
                                    </Link>
                                    <Link to="/verify" className="px-8 py-3 rounded-xl glass-panel border-cyan/30 text-cyan font-bold hover:bg-cyan/10 transition-colors flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                                        Get Erasure Certificate
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                    {/* </section> */}
                </div>
            </section>
        </div>
    );
};
