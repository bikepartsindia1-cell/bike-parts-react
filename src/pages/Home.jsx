import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Truck, Shield, Star, ShoppingBag, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import TypingAnimation from '../components/TypingAnimation';
import { useProducts } from '../context/ProductContext';

const Home = () => {
    const { products, loading } = useProducts();
    const featuredProducts = products.slice(0, 8);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="hero-bg min-h-[75vh] flex items-center relative pt-6">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-50/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left"
                        >
                            <div className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6 border border-amber-200">
                                🚀 Premium Bike Parts & Accessories
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold hero-text text-slate-900 mb-6 leading-tight tracking-tight">
                                <TypingAnimation
                                    texts={['Upgrade Your', 'Transform Your', 'Enhance Your', 'Customize Your']}
                                    speed={120}
                                    deleteSpeed={80}
                                    pauseTime={1500}
                                /> <br />
                                <span className="gradient-text">Authentic</span><br />
                                <span className="text-amber-600">Accessories</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl font-light mx-auto lg:mx-0">
                                Discover authentic motorcycle parts for all major Indian brands.
                                Experience premium quality, express delivery, and expert support.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/products" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center">
                                    <ShoppingBag className="mr-3 w-5 h-5" /> Shop Now
                                </Link>
                                <a href="#featured" className="bg-white hover:bg-gray-50 text-slate-900 font-bold py-3 px-8 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                                    <Search className="mr-3 w-5 h-5" /> Explore
                                </a>
                            </div>

                            <div className="mt-10 flex items-center justify-center lg:justify-start space-x-6 text-slate-500 text-sm">
                                <div className="flex items-center">
                                    <CheckCircle className="text-amber-500 mr-2 w-5 h-5" /> 100% Genuine
                                </div>
                                <div className="flex items-center">
                                    <Truck className="text-amber-500 mr-2 w-5 h-5" /> Fast Delivery
                                </div>
                                <div className="flex items-center">
                                    <Shield className="text-amber-500 mr-2 w-5 h-5" /> Warranty
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop" alt="Premium Bike Parts" className="w-full h-auto object-cover rounded-3xl shadow-2xl hero-image" />

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-8 -right-8 glass-panel p-5 rounded-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Star className="w-5 h-5 fill-current" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Top Rated</div>
                                            <div className="font-bold text-slate-900">4.9/5 Stars</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl font-bold hero-text text-slate-900 mb-4">Shop by Category</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">Find exactly what you need with our comprehensive category system.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { name: 'Headlights', icon: '💡', count: '25+' },
                            { name: 'Brakes', icon: '⚡', count: '18+' },
                            { name: 'Engine', icon: '🔧', count: '32+' },
                            { name: 'Body Parts', icon: '🛡️', count: '28+' },
                            { name: 'Transmission', icon: '⚙️', count: '15+' },
                            { name: 'Exhaust', icon: '🔊', count: '12+' },
                            { name: 'Handlebars', icon: '🎯', count: '22+' },
                            { name: 'Tools', icon: '🔨', count: '8+' }
                        ].map((cat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="category-card p-8 text-center cursor-pointer group"
                            >
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                                <h3 className="font-bold text-slate-900 mb-2 text-xl">{cat.name}</h3>
                                <div className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{cat.count} Products</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section id="featured" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold hero-text text-gray-900 mb-4">Featured Products</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">Handpicked selection of our best-selling and most popular items.</p>
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-12">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/products" className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                            View All Products <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">Get the latest updates on new products, exclusive deals, and maintenance tips.</p>
                        <div className="max-w-md mx-auto flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <button className="bg-amber-500 hover:bg-amber-600 px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
