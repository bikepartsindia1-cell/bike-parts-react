import React from 'react';
import { Package, RefreshCw, Clock, CheckCircle } from 'lucide-react';

const Returns = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns Policy</h1>
                    <p className="text-gray-600">Easy returns within 30 days</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center">
                            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">30 Days</h3>
                            <p className="text-sm text-gray-600">Return window</p>
                        </div>
                        <div className="text-center">
                            <RefreshCw className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Free Returns</h3>
                            <p className="text-sm text-gray-600">No questions asked</p>
                        </div>
                        <div className="text-center">
                            <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Full Refund</h3>
                            <p className="text-sm text-gray-600">Money back guarantee</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Conditions</h2>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Product must be unused and in original packaging</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>All tags and labels must be intact</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Return must be initiated within 30 days of delivery</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Original invoice must be included</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Return</h2>
                            <ol className="space-y-3 text-gray-600 list-decimal list-inside">
                                <li>Contact our support team at support@bikeparts.com</li>
                                <li>Receive your return authorization number</li>
                                <li>Pack the item securely in original packaging</li>
                                <li>Ship to the address provided by our team</li>
                                <li>Refund will be processed within 5-7 business days</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Returns;
