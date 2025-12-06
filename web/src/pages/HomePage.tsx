import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Shield, Menu, Download, FileText, Check, Image, File,
  Lock, ShieldOff, Layers, Award, Zap, Twitter, Github, Linkedin,
  X
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-cyan selection:text-dark font-sans overflow-x-hidden">

      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 py-6">
        <div className="container mx-auto px-6">
          <div className="glass-nav rounded-full px-6 py-3 flex justify-between items-center border border-white/10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <Shield className="relative text-white w-6 h-6" />
              </div>
              <span className="text-xl font-heading font-bold tracking-wide text-white">ZeroTrace</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-white hover:text-cyan transition-colors">Home</Link>
              <Link to="/download" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Download</Link>
              <Link to="/verify" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Certificate</Link>
              <Link to="/compare" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Compare</Link>
              <Link to="/rewards" className="text-sm font-medium text-gray-400 hover:text-white transition-colors text-cyan glow-text">Rewards</Link>
              <Link to="/awareness" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Awareness</Link>

              {isAuthenticated ? (
                <Link to="/dashboard" className="erase-now-btn px-6 py-2 rounded-full btn-glow text-white font-bold text-sm tracking-wide">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="erase-now-btn px-6 py-2 rounded-full btn-glow text-white font-bold text-sm tracking-wide">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white hover:text-cyan"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-4 right-4 glass-panel rounded-2xl p-6 flex flex-col gap-4 z-50">
            <Link to="/" className="block py-2 text-white hover:text-cyan">Home</Link>
            <Link to="/download" className="block py-2 text-gray-400 hover:text-white">Download</Link>
            <Link to="/verify" className="block py-2 text-gray-400 hover:text-white">Certificate</Link>
            <Link to="/compare" className="block py-2 text-gray-400 hover:text-white">Compare</Link>
            <Link to="/rewards" className="block py-2 text-cyan font-bold">Rewards</Link>
            <Link to="/awareness" className="block py-2 text-gray-400 hover:text-white">Awareness</Link>
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="erase-now-btn w-full py-3 rounded-lg btn-glow text-white font-bold text-center">
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-xs font-bold tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
              NIST 800-88 COMPLIANT
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6">
              Delete Data <br />
              <span className="text-gradient">Beyond Recovery</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
              The only Android data erasure tool you'll ever need. Military-grade algorithms ensure your personal information is gone forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/download" className="px-8 py-4 rounded-xl bg-white text-dark font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Download size={20} /> Download App
              </Link>
              <Link to="/verify" className="px-8 py-4 rounded-xl glass-panel text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                <FileText size={20} /> Verify Certificate
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="text-cyan w-4 h-4" /> No Root Required
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-cyan w-4 h-4" /> 100% Free
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative" data-aos="fade-left">
            {/* Main Card */}
            <div className="glass-panel rounded-3xl p-8 relative animate-float z-20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs font-mono text-cyan/80">SECURE_ERASE_V2.0</div>
              </div>

              {/* Progress Visualization */}
              <div className="space-y-6">
                <div className="relative pt-2">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-white">OVERWRITING SECTORS</span>
                    <span className="text-cyan">84%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-cyan w-[84%] relative">
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <Image className="text-purple-400 mb-2" />
                    <div className="text-2xl font-heading font-bold text-white">1,240</div>
                    <div className="text-xs text-gray-500">Photos Wiped</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <File className="text-pink-400 mb-2" />
                    <div className="text-2xl font-heading font-bold text-white">856</div>
                    <div className="text-xs text-gray-500">Files Shredded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 glass-panel p-4 rounded-2xl z-10 animate-float" style={{ animationDelay: '1s' }}>
              <Lock className="text-cyan w-8 h-8" />
            </div>
            <div className="absolute -bottom-8 -left-8 glass-panel p-4 rounded-2xl z-30 animate-float" style={{ animationDelay: '2s' }}>
              <ShieldOff className="text-primary w-8 h-8" />
            </div>

            {/* Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Why Choose <span className="text-gradient">ZeroTrace</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">We don't just delete files; we destroy the digital footprint they leave behind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group" data-aos="fade-up">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 blur-[80px] rounded-full group-hover:bg-cyan/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan rounded-xl flex items-center justify-center mb-6">
                  <Layers className="text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">Multi-Pass Overwrite</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  We utilize the DoD 5220.22-M and NIST 800-88 standards to overwrite your data multiple times with random patterns, zeros, and ones.
                </p>
              </div>
            </div>

            <div className="md:row-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent opacity-50"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <Award className="text-cyan" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">Certified Proof</h3>
                <p className="text-gray-400 leading-relaxed mb-8 flex-grow">
                  Generate a cryptographically signed PDF certificate after every wipe. Perfect for compliance, audits, or resale verification.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 border border-white/10 shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                  <div className="text-center text-xs text-gray-500">Certificate Placeholder</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors" data-aos="fade-up" data-aos-delay="200">
              <Zap className="text-yellow-400 w-10 h-10 mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Optimized I/O operations for maximum speed without compromising security.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors" data-aos="fade-up" data-aos-delay="300">
              <Lock className="text-pink-400 w-10 h-10 mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">Privacy First</h3>
              <p className="text-gray-400 text-sm">No data ever leaves your device. The entire process happens locally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>

        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Simple 3-Step Process</h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan/30 to-transparent -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              <div className="text-center group" data-aos="fade-up">
                <div className="w-20 h-20 mx-auto bg-dark border border-cyan/50 rounded-2xl flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(0,209,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-heading font-bold text-cyan">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Install App</h3>
                <p className="text-gray-400 text-sm px-8">Download ZeroTrace from our website or the Play Store.</p>
              </div>

              <div className="text-center group" data-aos="fade-up" data-aos-delay="100">
                <div className="w-20 h-20 mx-auto bg-dark border border-primary/50 rounded-2xl flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(123,44,191,0.2)] group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-heading font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Select & Wipe</h3>
                <p className="text-gray-400 text-sm px-8">Choose what to delete—photos, contacts, or free space.</p>
              </div>

              <div className="text-center group" data-aos="fade-up" data-aos-delay="200">
                <div className="w-20 h-20 mx-auto bg-dark border border-pink-500/50 rounded-2xl flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(255,0,128,0.2)] group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-heading font-bold text-pink-500">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Get Certified</h3>
                <p className="text-gray-400 text-sm px-8">Receive your tamper-proof certificate of destruction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan/20 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8">Ready to Secure Your Privacy?</h2>
              <Link to="/download" className="erase-now-btn px-12 py-5 rounded-full bg-white text-dark text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)] inline-block">
                Start Wiping Now
              </Link>
              <p className="mt-6 text-gray-400 text-sm">v2.4.0 • Android 8.0+ • 15MB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-16 pb-8 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-cyan rounded-lg flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-heading font-bold tracking-wide text-white">ZeroTrace</span>
            </Link>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-cyan transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-cyan transition-colors"><Github size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-cyan transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className="text-center mt-16 text-gray-600 text-xs">
            © 2025 ZeroTrace Security Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
