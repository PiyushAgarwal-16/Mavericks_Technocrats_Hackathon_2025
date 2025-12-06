import React, { useEffect, useState } from 'react';
import { Shield, ChevronDown, HelpCircle, Menu, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const AwarenessPage: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const modules = [
        {
            title: "Why Factory Reset Isn't Enough",
            content: "Factory resets often only remove the file pointers, leaving the actual data intact on the storage drive until it is overwritten. Sophisticated recovery tools can easily retrieve photos, messages, and credentials from a \"reset\" device."
        },
        {
            title: "The E-Waste Crisis",
            content: "Millions of devices are discarded annually. Proper data erasure encourages recycling by removing the fear of data theft, keeping toxic components out of landfills and recovering valuable materials."
        },
        {
            title: "Understanding NIST 800-88",
            content: "NIST 800-88 is the US government standard for media sanitization. It defines methods for Clear, Purge, and Destroy. ZeroTrace uses the Purge method, which renders data unrecoverable even with state-of-the-art laboratory techniques."
        }
    ];

    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: boolean | null }>({});

    const handleQuizAnswer = (qIndex: number, isCorrect: boolean) => {
        setQuizAnswers(prev => ({ ...prev, [qIndex]: isCorrect }));
    };

    return (
        <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden selection:bg-cyan selection:text-dark">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>

            {/* Navbar (Simplified for subpage) */}
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
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-primary">Awareness</span></h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Learn why data erasure is critical for your privacy and the environment.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Modules Accordion */}
                        <div className="space-y-4" data-aos="fade-right">
                            <h2 className="text-2xl font-bold mb-6 text-white">Learning Modules</h2>

                            {modules.map((module, index) => (
                                <div key={index} className="glass-panel rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-bold text-lg text-white">{module.title}</span>
                                        <ChevronDown
                                            className={`transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {activeAccordion === index && (
                                        <div className="p-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 animate-in slide-in-from-top-2">
                                            {module.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Interactive Quiz */}
                        <div className="glass-panel p-8 rounded-2xl h-fit" data-aos="fade-left">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                                <HelpCircle className="text-cyan" /> Quick Quiz
                            </h2>

                            <div className="space-y-8">
                                {/* Question 1 */}
                                <div>
                                    <p className="font-bold mb-4 text-white">1. Does a factory reset permanently delete all data?</p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleQuizAnswer(1, false)}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${quizAnswers[1] === false ? 'bg-red-500/20 border-red-500 text-red-200' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                        >
                                            Yes, absolutely.
                                        </button>
                                        <button
                                            onClick={() => handleQuizAnswer(1, true)}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${quizAnswers[1] === true ? 'bg-green-500/20 border-green-500 text-green-200' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                        >
                                            No, data can often be recovered.
                                        </button>
                                    </div>
                                    {quizAnswers[1] !== undefined && (
                                        <p className={`text-sm mt-2 ${quizAnswers[1] ? 'text-green-400' : 'text-red-400'}`}>
                                            {quizAnswers[1] ? 'Correct! Factory resets leave data recoverable.' : 'Incorrect. Try again.'}
                                        </p>
                                    )}
                                </div>

                                {/* Question 2 */}
                                <div>
                                    <p className="font-bold mb-4 text-white">2. What standard does ZeroTrace use?</p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleQuizAnswer(2, true)}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${quizAnswers[2] === true ? 'bg-green-500/20 border-green-500 text-green-200' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                        >
                                            NIST 800-88
                                        </button>
                                        <button
                                            onClick={() => handleQuizAnswer(2, false)}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${quizAnswers[2] === false ? 'bg-red-500/20 border-red-500 text-red-200' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                        >
                                            ISO 9001
                                        </button>
                                    </div>
                                    {quizAnswers[2] !== undefined && (
                                        <p className={`text-sm mt-2 ${quizAnswers[2] ? 'text-green-400' : 'text-red-400'}`}>
                                            {quizAnswers[2] ? 'Correct! NIST 800-88 is the gold standard.' : 'Incorrect. Try again.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
