import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { Search, Grid, List, Filter } from 'lucide-react';

const Products = () => {
    const { products, loading } = useProducts();
    const [view, setView] = useState('grid');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const [filters, setFilters] = useState({
        brand: [],
        category: [],
        rating: [],
        inStock: false
    });

    const [priceRange, setPriceRange] = useState([0, 10000]);

    // Handle URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        const brand = params.get('brand');

        if (category) setFilters(prev => ({ ...prev, category: [category] }));
        if (brand) setFilters(prev => ({ ...prev, brand: [brand] }));
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Brand
            if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;

            // Category
            if (filters.category.length > 0 && !filters.category.includes(product.category)) return false;

            // Price
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

            // Stock
            if (filters.inStock && product.inStock <= 0) return false;

            // Rating
            if (filters.rating.length > 0) {
                const meetsRating = filters.rating.some(r => product.rating >= r);
                if (!meetsRating) return false;
            }

            // Bike Model Compatibility
            if (filters.bikeModel) {
                // If product has no compatibility info, hide it when filter is active
                if (!product.compatibility || !Array.isArray(product.compatibility)) return false;

                // Check if the selected model is in the compatibility list
                // Also allow "Universal" products
                const isCompatible = product.compatibility.includes(filters.bikeModel) ||
                    product.compatibility.includes('Universal') ||
                    product.brand === 'Universal';

                if (!isCompatible) return false;
            } else if (filters.bikeMake) {
                // If only Make is selected, check if product is compatible with any model of that make
                // This is a bit complex without a full map, so for now we might skip or 
                // check if any of the compatible models start with the Make name (if naming convention holds)
                // Or better, just rely on Model filter for precision. 
                // Let's filter by Make if the product brand matches the bike make (OEM parts) 
                // OR if it's compatible with any model of that make.

                // For simplicity in this iteration:
                // If product brand matches bike make, show it.
                // If product is Universal, show it.
                // If product compatibility list contains any string that includes the Make name.

                const isCompatible = product.brand === filters.bikeMake ||
                    product.brand === 'Universal' ||
                    (product.compatibility && product.compatibility.some(c => c.includes(filters.bikeMake)));

                if (!isCompatible) return false;
            }

            return true;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'rating': return b.rating - a.rating;
                case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // Assuming createdAt exists or fallback
                default: return a.name.localeCompare(b.name);
            }
        });
    }, [products, searchQuery, filters, priceRange, sortBy]);

    const clearFilters = () => {
        setFilters({
            brand: [],
            category: [],
            rating: [],
            inStock: false
        });
        setPriceRange([0, 10000]);
        setSearchQuery('');
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h1>
                    <p className="text-gray-600">Discover our comprehensive collection of motorcycle parts and accessories.</p>
                </div>

                {/* Controls Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    {/* Search */}
                    <div className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto">
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                        >
                            <Filter className="w-5 h-5 mr-2" /> Filters
                        </button>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                            <option value="name">Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Rating</option>
                            <option value="newest">Newest</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <ProductFilters
                        filters={filters}
                        setFilters={setFilters}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        clearFilters={clearFilters}
                        isOpen={isMobileFiltersOpen}
                        onClose={() => setIsMobileFiltersOpen(false)}
                    />

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
