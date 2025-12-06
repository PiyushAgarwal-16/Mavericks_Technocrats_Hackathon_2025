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

                    {/* Recycling Partners Section */}
                    <div className="max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <Check className="text-green-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Certified Recycling Partners</h2>
                                <p className="text-gray-400 text-sm">Drop off your wiped devices at these verified locations.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Partner 1 */}
                            <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                                <h3 className="font-bold text-lg text-white mb-1">EcoCycle Solutions</h3>
                                <p className="text-cyan text-sm mb-4">E-Steward Certified</p>
                                <p className="text-gray-400 text-sm mb-2">📍 123 Green Way, Tech City</p>
                                <p className="text-gray-400 text-sm mb-4">📞 (555) 123-4567</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">Mobile</span>
                                    <span className="bg-white/5 px-2 py-1 rounded">Laptops</span>
                                </div>
                            </div>

                            {/* Partner 2 */}
                            <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                                <h3 className="font-bold text-lg text-white mb-1">GreenTech Recyclers</h3>
                                <p className="text-cyan text-sm mb-4">R2 Certified</p>
                                <p className="text-gray-400 text-sm mb-2">📍 45 Sustainable Blvd, Eco Park</p>
                                <p className="text-gray-400 text-sm mb-4">📞 (555) 987-6543</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">All Electronics</span>
                                </div>
                            </div>

                            {/* Partner 3 */}
                            <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                                <h3 className="font-bold text-lg text-white mb-1">Urban Mining Co.</h3>
                                <p className="text-cyan text-sm mb-4">ISO 14001</p>
                                <p className="text-gray-400 text-sm mb-2">📍 789 Circuit Ave, Innovation District</p>
                                <p className="text-gray-400 text-sm mb-4">📞 (555) 456-7890</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">Batteries</span>
                                    <span className="bg-white/5 px-2 py-1 rounded">Phones</span>
                                </div>
                            </div>

                            {/* Partner 4 */}
                            <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                                <h3 className="font-bold text-lg text-white mb-1">ReTEK Loop</h3>
                                <p className="text-cyan text-sm mb-4">R2 Certified</p>
                                <p className="text-gray-400 text-sm mb-2">📍 101 Silicon Valley, Digital Hub</p>
                                <p className="text-gray-400 text-sm mb-4">📞 (555) 777-8888</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">Servers</span>
                                    <span className="bg-white/5 px-2 py-1 rounded">HDDs</span>
                                </div>
                            </div>

                            {/* Partner 5 */}
                            <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                                <h3 className="font-bold text-lg text-white mb-1">Circular Tech</h3>
                                <p className="text-cyan text-sm mb-4">Zero Waste Certified</p>
                                <p className="text-gray-400 text-sm mb-2">📍 202Future Drive, Uptown</p>
                                <p className="text-gray-400 text-sm mb-4">📞 (555) 222-3333</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">Consumer Electronics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
