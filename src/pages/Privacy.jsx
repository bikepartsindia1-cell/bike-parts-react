import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Your privacy is important to us</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-start space-x-4">
                            <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                                <p className="text-sm text-gray-600">Your data is encrypted and secure</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Lock className="w-8 h-8 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Secure Transactions</h3>
                                <p className="text-sm text-gray-600">SSL encrypted payment processing</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-600">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                            <p className="mb-3">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Name and contact information</li>
                                <li>Billing and shipping addresses</li>
                                <li>Payment information</li>
                                <li>Order history and preferences</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Process and fulfill your orders</li>
                                <li>Send order confirmations and updates</li>
                                <li>Respond to your inquiries and support requests</li>
                                <li>Send promotional communications (with your consent)</li>
                                <li>Improve our services and user experience</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                            <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All payment transactions are processed through secure, encrypted connections.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                            <p className="mb-3">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
                            <p className="text-sm mt-2">For questions about this policy, contact us at privacy@bikeparts.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
