// 🧹 Script to remove duplicate English products from database
// Keeps only German versions

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cybsvbhhsepzfoakbqsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YnN2Ymhoc2VwemZvYWticXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2NDM0NiwiZXhwIjoyMDc0ODQwMzQ2fQ.rMAMRbCpaMytcPj5yYIXD3G9VY_xQHd0_6LBzZHowz0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Products to remove (English versions)
const productsToRemove = [
  'Cherry GENTIX Silent Mouse',
  'Cherry Stream Keyboard', 
  'Desktop Speakers',
  'Flipchart Paper',
  'Jabra Evolve2 40 (Wired)',
  'Jabra Evolve2 65 (Bluetooth)', // The English one
  'Logitech C270 HD-Webcam', // The English one
  'Logitech Lift Ergonomic Mouse',
  'ROLINE HDMI Cable High Speed',
  'Verbatim USB-C to HDMI Adapter',
  'Whiteboard' // The English one
];

async function cleanupDuplicates() {
  console.log('🧹 Starting cleanup of duplicate products...');
  
  try {
    // First, get all products
    const { data: allProducts, error: fetchError } = await supabase
      .from('Product')
      .select('*');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`📊 Found ${allProducts.length} products in database`);
    
    // Find products to remove
    const productsToDelete = allProducts.filter(product => 
      productsToRemove.includes(product.name)
    );
    
    console.log(`🗑️  Found ${productsToDelete.length} products to remove:`);
    productsToDelete.forEach(product => {
      console.log(`   - ${product.name}`);
    });
    
    if (productsToDelete.length === 0) {
      console.log('✅ No duplicate products found to remove');
      return;
    }
    
    // First, remove OrderItems that reference these products
    const productIds = productsToDelete.map(p => p.id);
    
    console.log('🗑️  Removing OrderItems that reference these products...');
    const { error: orderItemsError } = await supabase
      .from('OrderItem')
      .delete()
      .in('productId', productIds);
    
    if (orderItemsError) {
      throw orderItemsError;
    }
    
    console.log('✅ Removed OrderItems');
    
    // Now remove the products
    console.log('🗑️  Removing duplicate products...');
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .in('id', productIds);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`✅ Successfully removed ${productsToDelete.length} duplicate products`);
    
    // Verify remaining products
    const { data: remainingProducts, error: verifyError } = await supabase
      .from('Product')
      .select('name, category')
      .order('name');
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`\n📋 Remaining products (${remainingProducts.length}):`);
    remainingProducts.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${product.name} (${product.category})`);
    });
    
    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
