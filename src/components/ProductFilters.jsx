import React from 'react';
import { Filter, X } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import bikeData from '../data/bikes.json';

const ProductFilters = ({ filters, setFilters, priceRange, setPriceRange, clearFilters, isOpen, onClose }) => {
    const handleCheckboxChange = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const handleMakeChange = (e) => {
        const make = e.target.value;
        setFilters(prev => ({
            ...prev,
            bikeMake: make,
            bikeModel: '' // Reset model when make changes
        }));
    };

    const handleModelChange = (e) => {
        setFilters(prev => ({
            ...prev,
            bikeModel: e.target.value
        }));
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:shadow-none lg:bg-transparent ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full overflow-y-auto p-6 lg:p-0">
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-500 font-medium">
                            Clear All
                        </button>
                    </div>

                    {/* Bike Model Filter */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Select Your Bike</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Make</label>
                                <select
                                    value={filters.bikeMake || ''}
                                    onChange={handleMakeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All Makes</option>
                                    {Object.keys(bikeData).map(make => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>
                            </div>

                            {filters.bikeMake && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Model</label>
                                    <select
                                        value={filters.bikeModel || ''}
                                        onChange={handleModelChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">All Models</option>
                                        {bikeData[filters.bikeMake]?.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Brand</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(JSON.parse(localStorage.getItem('bikeparts_brands')) || ['Royal Enfield', 'Hero', 'Bajaj', 'Honda', 'TVS', 'Yamaha', 'Universal']).map(brand => (
                                <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.brand?.includes(brand) || false}
                                        onChange={() => handleCheckboxChange('brand', brand)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">{brand}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(JSON.parse(localStorage.getItem('bikeparts_categories')) || ['Headlights', 'Brakes', 'Engine', 'Body Parts', 'Transmission', 'Tools', 'Handlebars', 'Mirrors', 'Exhaust']).map(cat => (
                                <label key={cat} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.category?.includes(cat) || false}
                                        onChange={() => handleCheckboxChange('category', cat)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                        <div className="space-y-3">
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{formatPrice(priceRange[0])}</span>
                                <span>{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stock Filter */}
                    <div className="mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.inStock || false}
                                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="ml-2 text-gray-700 text-sm">In Stock Only</span>
                        </label>
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                        <div className="space-y-2">
                            {[4.5, 4.0, 3.5].map(rating => (
                                <label key={rating} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.rating?.includes(rating) || false}
                                        onChange={() => handleCheckboxChange('rating', rating)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">{rating}+ Stars</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
