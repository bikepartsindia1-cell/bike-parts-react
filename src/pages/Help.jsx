import React from 'react';
import { HelpCircle, MessageCircle, Book, Phone } from 'lucide-react';

const Help = () => {
    const faqs = [
        {
            question: 'How do I track my order?',
            answer: 'You can track your order by logging into your account and viewing the order history. You will also receive tracking information via email once your order ships.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery for eligible orders.'
        },
        {
            question: 'How long does shipping take?',
            answer: 'Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery in select areas.'
        },
        {
            question: 'Do you ship internationally?',
            answer: 'Currently, we only ship within India. International shipping may be available in the future.'
        },
        {
            question: 'Are the parts genuine?',
            answer: 'Yes, all our parts are 100% genuine and sourced directly from authorized dealers and manufacturers.'
        },
        {
            question: 'What is your warranty policy?',
            answer: 'Most products come with a 1-year manufacturer warranty. Specific warranty details are mentioned on each product page.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                    <p className="text-gray-600">Find answers to common questions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                        <Phone className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-sm text-gray-600">+91 93543 09314</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                        <MessageCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                        <p className="text-sm text-gray-600">Available 9 AM - 6 PM</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                        <Book className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-sm text-gray-600">bikepartsindia1@gmail.com</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <HelpCircle className="w-6 h-6 mr-3 text-amber-500" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Still need help?</h3>
                    <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Help;
