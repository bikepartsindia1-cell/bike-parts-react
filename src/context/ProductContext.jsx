import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);



    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Fetch products with their review statistics using a JOIN query
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    reviews (
                        rating
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase fetch error:', error);
                throw error;
            }

            // Map DB columns to state structure and calculate dynamic ratings
            const mappedProducts = data.map(p => {
                // Calculate dynamic rating from reviews
                const reviewRatings = p.reviews || [];
                let dynamicRating = 0;
                let reviewCount = reviewRatings.length;

                if (reviewCount > 0) {
                    const totalRating = reviewRatings.reduce((sum, review) => sum + review.rating, 0);
                    dynamicRating = Math.round((totalRating / reviewCount) * 10) / 10; // Round to 1 decimal
                }

                return {
                    id: p.id,
                    name: p.name || 'Unnamed Product',
                    brand: p.brand || 'Unknown Brand',
                    category: p.category || 'Uncategorized',
                    price: p.price || 0,
                    originalPrice: p.original_price || p.price,
                    image: p.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500',
                    description: p.description || '',
                    compatibility: p.compatibility || [],
                    inStock: p.stock_quantity || 0,
                    // Use dynamic rating from reviews, fallback to 0 if no reviews
                    rating: dynamicRating,
                    reviews: reviewCount,
                    created_at: p.created_at
                };
            });
            
            setProducts(mappedProducts);
            localStorage.setItem('bikeparts_products', JSON.stringify(mappedProducts));
        } catch (error) {
            console.error('Error fetching products:', error);
            
            // Try to load from localStorage as fallback
            const localProducts = localStorage.getItem('bikeparts_products');
            if (localProducts) {
                setProducts(JSON.parse(localProducts));
            } else {
                setProducts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (newProduct) => {
        console.log('Adding product:', newProduct);
        try {
            const productData = {
                name: newProduct.name,
                brand: newProduct.brand,
                category: newProduct.category,
                price: parseFloat(newProduct.price),
                original_price: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : parseFloat(newProduct.price),
                image_url: newProduct.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500',
                description: newProduct.description || '',
                compatibility: Array.isArray(newProduct.compatibility) ? newProduct.compatibility : [],
                stock_quantity: parseInt(newProduct.inStock) || 0,
                rating: 0, // Will be calculated from reviews
                reviews: 0 // Will be calculated from reviews
            };

            console.log('Sending to Supabase:', productData);

            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Product saved to Supabase:', data);

            // Refresh all products from database to ensure consistency
            await fetchProducts();

            return { success: true, product: data };
        } catch (error) {
            console.error('Error adding product:', error);
            const errorMessage = error.message || 'Unknown error';
            return { success: false, error: errorMessage };
        }
    };

    const updateProduct = async (id, updatedData) => {
        try {
            // Map the data to database column names
            const dbData = {
                name: updatedData.name,
                brand: updatedData.brand,
                category: updatedData.category,
                price: parseFloat(updatedData.price),
                original_price: updatedData.originalPrice ? parseFloat(updatedData.originalPrice) : parseFloat(updatedData.price),
                image_url: updatedData.image,
                description: updatedData.description,
                compatibility: Array.isArray(updatedData.compatibility) ? updatedData.compatibility : [],
                stock_quantity: parseInt(updatedData.inStock),
                rating: 0, // Will be calculated from reviews
                reviews: 0 // Will be calculated from reviews
            };

            const { error } = await supabase
                .from('products')
                .update(dbData)
                .eq('id', id);

            if (error) throw error;

            // Refresh all products from database to ensure consistency
            await fetchProducts();
            
            return { success: true };
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, error: error.message };
        }
    };

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh all products from database to ensure consistency
            await fetchProducts();
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};
