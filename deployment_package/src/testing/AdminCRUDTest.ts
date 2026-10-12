import { api } from '../api/client';

export const runAdminCRUDTests = async () => {
  console.log('Starting Admin CRUD tests...');
  
  // Test Products
  try {
    const products = await api.getProducts();
    console.log('Products fetched:', products.length);
    
    // Test Create Product
    const newProduct = await api.adminCreateProduct({
      name: 'Test Product ' + Date.now(),
      description: 'Test Description',
      cashPrice: 100,
      inventory: 10,
      status: 'DRAFT',
      images: []
    });
    console.log('Product created:', newProduct);
    
    // Test Update Product
    await api.adminUpdateProduct(newProduct.id, { name: 'Updated Product ' + Date.now() });
    console.log('Product updated');
    
    // Test Delete Product
    await api.adminDeleteProduct(newProduct.id);
    console.log('Product deleted');
    
  } catch (e) {
    console.error('Product test failed', e);
  }

  // Test Businesses
  try {
    const businesses = await api.getAllBusinesses();
    console.log('Businesses fetched:', businesses.length);
  } catch (e) {
    console.error('Business test failed', e);
  }

  console.log('Admin CRUD tests completed.');
};
