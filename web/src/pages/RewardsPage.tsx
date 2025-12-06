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

    const [claimed, setClaimed] = React.useState(false);

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setClaimed(true);
        }, 1000);
    };

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
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Eco <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-primary">Rewards</span></h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Get rewarded for responsible e-waste management. Securely wipe your device and earn perks.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
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

                    {/* Claim Form */}
                    <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="300">
                        <h3 className="text-2xl font-bold mb-6 text-center text-white">Claim Your Reward</h3>

                        {!claimed ? (
                            <form onSubmit={handleClaim} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Certificate ID</label>
                                    <input type="text" placeholder="Enter your erasure certificate ID" required className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input type="email" placeholder="Where to send the reward" required className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan focus:outline-none transition-colors" />
                                </div>
                                <button type="submit" className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-cyan text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-cyan/20">
                                    Claim Reward
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Claim Submitted!</h4>
                                <p className="text-gray-400 text-sm">We've sent a confirmation email. Your reward will be processed within 24 hours.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
