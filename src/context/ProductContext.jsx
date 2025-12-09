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
            
            // Fetch from Supabase database
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase fetch error:', error);
                throw error;
            }

            // Map DB columns to state structure
            const mappedProducts = data.map(p => ({
                ...p,
                image: p.image_url,
                inStock: p.stock_quantity,
                originalPrice: p.original_price
            }));
            
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
                rating: parseFloat(newProduct.rating) || 4.5,
                reviews: parseInt(newProduct.reviews) || 0
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

            // Map back for local state
            const newProductState = {
                ...data,
                image: data.image_url,
                inStock: data.stock_quantity,
                originalPrice: data.original_price
            };

            // Update local state and cache
            const updatedProducts = [newProductState, ...products];
            setProducts(updatedProducts);
            localStorage.setItem('bikeparts_products', JSON.stringify(updatedProducts));

            return { success: true, product: newProductState };
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
                rating: parseFloat(updatedData.rating) || 4.5,
                reviews: parseInt(updatedData.reviews) || 0
            };

            const { error } = await supabase
                .from('products')
                .update(dbData)
                .eq('id', id);

            if (error) throw error;

            // Update local state with mapped data
            const updatedProducts = products.map(p =>
                p.id === id ? { 
                    ...p, 
                    ...updatedData,
                    image: updatedData.image,
                    inStock: parseInt(updatedData.inStock),
                    originalPrice: updatedData.originalPrice || updatedData.price
                } : p
            );
            setProducts(updatedProducts);
            localStorage.setItem('bikeparts_products', JSON.stringify(updatedProducts));
            
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

            // Update local state
            const updatedProducts = products.filter(p => p.id !== id);
            setProducts(updatedProducts);
            localStorage.setItem('bikeparts_products', JSON.stringify(updatedProducts));
            
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
