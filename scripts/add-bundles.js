import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBundles() {
  console.log('📦 Adding product bundles...');

  try {
    // 1. Create Bundle Products
    const bundles = [
      {
        id: `bundle_homeoffice_${Date.now()}`,
        name: 'Home-Office Starter-Paket',
        description: 'Komplettes Set für produktives Arbeiten von zuhause: Webcam, Headset, Maus und Tastatur',
        category: 'OFFICE_MISC',
        isBundle: true,
        requiresApproval: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `bundle_meeting_${Date.now()}`,
        name: 'Meeting-Raum Ausstattung',
        description: 'Professionelle Meeting-Ausstattung: Webcam, Lautsprecher, HDMI-Kabel und Adapter',
        category: 'OFFICE_MISC',
        isBundle: true,
        requiresApproval: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    console.log(`📦 Creating ${bundles.length} bundle products...`);
    const { data: createdBundles, error: bundleError } = await supabase
      .from('Product')
      .insert(bundles)
      .select();

    if (bundleError) {
      throw bundleError;
    }

    console.log(`✅ Created ${createdBundles.length} bundles`);

    // 2. Get existing products for bundle composition
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, name, category')
      .eq('isActive', true)
      .eq('isBundle', false);

    if (productsError) {
      throw productsError;
    }

    console.log(`📋 Found ${products.length} products to use in bundles`);

    // Find specific products by category
    const webcam = products.find(p => p.category === 'WEBCAM');
    const headset = products.find(p => p.category === 'HEADSET' && p.name.includes('Bluetooth'));
    const mouse = products.find(p => p.category === 'MOUSE');
    const keyboard = products.find(p => p.category === 'KEYBOARD');
    const cable = products.find(p => p.category === 'CABLE');
    const adapter = products.find(p => p.category === 'ADAPTER');

    // 3. Create bundle items
    const bundleItems = [];

    // Home-Office Bundle
    if (createdBundles[0] && webcam && headset && mouse && keyboard) {
      bundleItems.push(
        {
          id: `bundleitem_${Date.now()}_1`,
          bundleId: createdBundles[0].id,
          productId: webcam.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: `bundleitem_${Date.now()}_2`,
          bundleId: createdBundles[0].id,
          productId: headset.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: `bundleitem_${Date.now()}_3`,
          bundleId: createdBundles[0].id,
          productId: mouse.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: `bundleitem_${Date.now()}_4`,
          bundleId: createdBundles[0].id,
          productId: keyboard.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        }
      );
    }

    // Meeting-Room Bundle
    if (createdBundles[1] && webcam && cable && adapter) {
      bundleItems.push(
        {
          id: `bundleitem_${Date.now()}_5`,
          bundleId: createdBundles[1].id,
          productId: webcam.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: `bundleitem_${Date.now()}_6`,
          bundleId: createdBundles[1].id,
          productId: cable.id,
          quantity: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: `bundleitem_${Date.now()}_7`,
          bundleId: createdBundles[1].id,
          productId: adapter.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        }
      );
    }

    if (bundleItems.length > 0) {
      console.log(`📦 Creating ${bundleItems.length} bundle items...`);
      const { error: bundleItemsError } = await supabase
        .from('ProductBundle')
        .insert(bundleItems);

      if (bundleItemsError) {
        throw bundleItemsError;
      }

      console.log(`✅ Created ${bundleItems.length} bundle items`);
    }

    console.log('\n🎉 Bundles successfully created!');
    console.log(`\n📋 Summary:`);
    console.log(`   - Home-Office Starter-Paket: ${createdBundles[0]?.name}`);
    console.log(`   - Meeting-Raum Ausstattung: ${createdBundles[1]?.name}`);

  } catch (error) {
    console.error('❌ Error creating bundles:', error);
  }
}

addBundles();

