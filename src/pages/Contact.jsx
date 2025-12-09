import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Loader2, Upload } from 'lucide-react';

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target);

        // Add FormSubmit configuration
        formData.append("_subject", "New Contact Message with Attachment");
        formData.append("_template", "table");
        formData.append("_captcha", "false");

        try {
            const response = await fetch("https://formsubmit.co/ajax/bikepartsindia1@gmail.com", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                setIsSuccess(true);
                e.target.reset();
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error sending message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-gray-600">Get in touch with our team</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <Phone className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                        <p className="text-gray-600">+91 93543 09314</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <Mail className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-600">bikepartsindia1@gmail.com</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                        <p className="text-gray-600">Gurgaon, Haryana</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

                    {isSuccess ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                            <p className="text-gray-600 mb-6">Thank you for contacting us. We will get back to you shortly.</p>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input name="name" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input name="email" type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input name="subject" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea name="message" rows="5" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Image or PDF)</label>
                                <div className="relative border border-gray-300 rounded-lg p-2 hover:border-amber-500 transition-colors">
                                    <input
                                        type="file"
                                        name="attachment"
                                        accept="image/*,application/pdf"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                    />
                                    <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
