// 🧹 Script to remove remaining duplicate products
// Remove English versions: Office Chair, Business Prints & Envelopes, Printer Toner, Pinboard

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cybsvbhhsepzfoakbqsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YnN2Ymhoc2VwemZvYWticXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2NDM0NiwiZXhwIjoyMDc0ODQwMzQ2fQ.rMAMRbCpaMytcPj5yYIXD3G9VY_xQHd0_6LBzZHowz0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Remaining English products to remove
const productsToRemove = [
  'Office Chair',
  'Business Prints & Envelopes', 
  'Printer Toner',
  'Pinboard'
];

async function cleanupRemainingDuplicates() {
  console.log('🧹 Removing remaining duplicate products...');
  
  try {
    // Get all products
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
      console.log('✅ No remaining duplicate products found to remove');
      return;
    }
    
    // Remove OrderItems first
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
    
    // Remove the products
    console.log('🗑️  Removing remaining duplicate products...');
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .in('id', productIds);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`✅ Successfully removed ${productsToDelete.length} remaining duplicate products`);
    
    // Verify final products
    const { data: finalProducts, error: verifyError } = await supabase
      .from('Product')
      .select('name, category')
      .order('name');
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`\n📋 Final products (${finalProducts.length}):`);
    finalProducts.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${product.name} (${product.category})`);
    });
    
    console.log('\n🎉 All duplicates removed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupRemainingDuplicates();
