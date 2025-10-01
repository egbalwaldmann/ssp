import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const prices = {
  'Bürostuhl': 300,
  'Cherry GENTIX Silent': 20,
  'Cherry Stream': 30,
  'Desktop-Lautsprecher': 40,
  'Druckertoner': 120,
  'Flipchart-Papier': 15,
  'Geschäftsausdrucke': 100,
  'Home-Office Starter-Paket': 200,
  'Jabra Evolve2 40': 120,
  'Logitech Lift': 70,
  'Meeting-Raum Ausstattung': 500,
  'Pinnwand': 25,
  'ROLINE HDMI': 15,
  'Verbatim USB-C': 25,
  'Visitenkarten': 50
};

async function addPrices() {
  console.log('💶 Adding prices to products...');

  try {
    const { data: products, error: fetchError } = await supabase
      .from('Product')
      .select('id, name');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Found ${products.length} products`);

    let updated = 0;
    for (const product of products) {
      // Find matching price
      const priceKey = Object.keys(prices).find(key => 
        product.name.includes(key) || key.includes(product.name.split(' ')[0])
      );

      if (priceKey) {
        const price = prices[priceKey];
        const { error: updateError } = await supabase
          .from('Product')
          .update({ price })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Failed to update ${product.name}:`, updateError.message);
        } else {
          console.log(`✅ ${product.name}: ${price} EUR`);
          updated++;
        }
      } else {
        console.log(`⚠️  No price found for: ${product.name}`);
      }
    }

    console.log(`\n🎉 Updated ${updated} products with prices!`);

  } catch (error) {
    console.error('❌ Error adding prices:', error);
  }
}

addPrices();

