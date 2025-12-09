import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! 👋 Welcome to BikeParts India! How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const quickReplies = [
        'Show me headlights',
        'Brake pads for Royal Enfield',
        'Track my order',
        'Return policy'
    ];

    const getBotResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();

        // Greetings
        if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
            return "Hello! 👋 Welcome to BikeParts India! I'm here to help you find the perfect parts for your bike. What are you looking for today?";
        }

        // Product inquiries
        if (msg.includes('headlight')) {
            return "We have premium LED headlights for all major brands! 💡\n\n✨ Popular options:\n• Royal Enfield LED Assembly - ₹2,850\n• Honda Projector Headlight - ₹3,200\n• Bajaj Pulsar LED Kit - ₹2,100\n\nWould you like me to show you our headlights collection?";
        }

        if (msg.includes('brake')) {
            return "Looking for brakes? We've got you covered! 🛑\n\n🔧 Available:\n• Disc Brake Pads (Honda, Royal Enfield, Bajaj)\n• Brake Cables\n• Brake Fluid\n• Complete Brake Kits\n\nWhich brand is your bike?";
        }

        if (msg.includes('royal enfield') || msg.includes('re ')) {
            return "Royal Enfield parts! 🏍️ We stock authentic and aftermarket parts:\n\n• Headlights & Tail lights\n• Brake Pads & Discs\n• Engine Oil Filters\n• Exhaust Systems\n• Body Panels\n\nWhat specific part do you need?";
        }

        if (msg.includes('honda')) {
            return "Honda parts available! 🏍️\n\n• Premium Disc Brake Pads - ₹1,250\n• Oil Filters\n• Chain Sprocket Kits\n• Headlight Assemblies\n\nLet me know which Honda model you have!";
        }

        if (msg.includes('bajaj') || msg.includes('pulsar')) {
            return "Bajaj/Pulsar parts in stock! ⚡\n\n• Engine Oil Filters - ₹350\n• Brake Pads\n• Headlight Assemblies\n• Body Parts\n\nWhich Pulsar model do you own?";
        }

        if (msg.includes('yamaha') || msg.includes('r15') || msg.includes('fz')) {
            return "Yamaha parts available! 🏁\n\n• Chain Sprocket Kits - ₹2,100\n• Brake Components\n• Engine Parts\n• Lighting Solutions\n\nTell me your Yamaha model!";
        }

        if (msg.includes('ktm') || msg.includes('duke')) {
            return "KTM Duke parts! 🧡\n\n• Carbon Fiber Panels - ₹4,500\n• Performance Exhaust\n• Brake Systems\n• Body Kits\n\nWhich Duke model - 200, 250, or 390?";
        }

        // Order tracking
        if (msg.includes('track') || msg.includes('order')) {
            return "To track your order:\n\n1. Go to 'Account' → 'Orders'\n2. Find your order number\n3. Click 'Track Order'\n\nOr share your order number here and I'll help you track it! 📦";
        }

        // Returns
        if (msg.includes('return') || msg.includes('refund')) {
            return "Our return policy:\n\n✅ 7-day return window\n✅ Free return shipping\n✅ Full refund on defective items\n✅ Easy exchange process\n\nNeed to return something? I can guide you through the process!";
        }

        // Shipping
        if (msg.includes('ship') || msg.includes('delivery')) {
            return "Shipping Information:\n\n🚚 Free delivery on orders above ₹500\n📦 Standard delivery: 3-5 business days\n⚡ Express delivery: 1-2 business days\n🌍 We ship pan-India!\n\nWhere should we deliver your order?";
        }

        // Price inquiries
        if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
            return "Our prices are competitive! 💰\n\nPopular items:\n• Brake Pads: ₹350 - ₹1,250\n• Headlights: ₹2,100 - ₹3,500\n• Oil Filters: ₹250 - ₹450\n• Chain Kits: ₹2,000 - ₹3,000\n\nWhat specific part are you interested in?";
        }

        // Payment
        if (msg.includes('payment') || msg.includes('pay') || msg.includes('cod')) {
            return "Payment Options:\n\n💳 Credit/Debit Cards\n📱 UPI (PhonePe, GPay, Paytm)\n💵 Cash on Delivery (COD)\n🏦 Net Banking\n\nAll payments are 100% secure! 🔒";
        }

        // Warranty
        if (msg.includes('warranty') || msg.includes('guarantee')) {
            return "Warranty Information:\n\n✅ 6-month warranty on all parts\n✅ 1-year warranty on premium items\n✅ Manufacturer warranty on branded parts\n✅ Easy claim process\n\nWhich product warranty do you want to know about?";
        }

        // Help
        if (msg.includes('help') || msg.includes('support')) {
            return "I'm here to help! 😊\n\nI can assist with:\n• Finding the right parts\n• Order tracking\n• Returns & refunds\n• Product recommendations\n• Technical specifications\n\nWhat do you need help with?";
        }

        // Default response
        return "I'd be happy to help you find the perfect bike parts! 🏍️\n\nYou can ask me about:\n• Specific parts (brakes, lights, filters)\n• Brand-specific parts (Royal Enfield, Honda, Bajaj, etc.)\n• Order tracking\n• Returns & shipping\n• Prices & warranty\n\nWhat would you like to know?";
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const botMessage = { text: getBotResponse(input), sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        }, 500);

        setInput('');
    };

    const handleQuickReply = (reply) => {
        const userMessage = { text: reply, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const botMessage = { text: getBotResponse(reply), sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        }, 500);
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* WhatsApp Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.a
                        href="https://wa.me/919354309314"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-24 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0, y: 20 }}
                    >
                        <Phone className="w-6 h-6" />
                    </motion.a>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white rounded-t-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">BikeParts Support</h3>
                                    <p className="text-xs text-amber-100">Online now</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user'
                                            ? 'bg-amber-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length === 1 && (
                            <div className="px-4 py-2 bg-white border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickReplies.map((reply, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickReply(reply)}
                                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-10 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
