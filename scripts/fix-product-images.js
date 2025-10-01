import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Load environment variables from .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixProductImages() {
  console.log('🖼️  Fixing product image URLs...');

  try {
    // First, let's see what image URLs we have
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('id, name, imageUrl')
      .order('name', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📊 Found ${products.length} products with image URLs:`);
    products.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${product.name}: ${product.imageUrl || 'NULL'}`);
    });

    // Update all products to remove imageUrl (set to null)
    console.log('\n🔧 Removing image URLs from all products...');
    const { error: updateError } = await supabase
      .from('Product')
      .update({ imageUrl: null })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all products

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Successfully removed image URLs from all products');

    // Verify the changes
    const { data: updatedProducts, error: verifyError } = await supabase
      .from('Product')
      .select('id, name, imageUrl')
      .order('name', { ascending: true });

    if (verifyError) {
      throw verifyError;
    }

    console.log(`\n📋 Updated products (${updatedProducts.length}):`);
    updatedProducts.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${product.name}: ${product.imageUrl || 'NULL'}`);
    });

    console.log('\n🎉 Product image URLs fixed successfully!');
    console.log('💡 The application will now use emoji fallbacks instead of broken image URLs.');

  } catch (error) {
    console.error('❌ Error fixing product images:', error);
  }
}

fixProductImages();
