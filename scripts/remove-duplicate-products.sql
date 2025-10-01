-- Remove duplicate products (keep older ones)
-- Delete products created by second seed (newer IDs starting with cmg8i)

DELETE FROM "Product" WHERE id IN (
  'cmg8i012u000i06cu78exz19e',  -- Bürostuhl
  'cmg8i00qt000806cuw45ymzsi',  -- Cherry GENTIX Silent Maus
  'cmg8i00so000a06cuy0jvz0pn',  -- Cherry Stream Tastatur
  'cmg8i00z5000e06cueig166f8',  -- Desktop-Lautsprecher
  'cmg8i00vi000d06cuvzfftknj',  -- Druckertoner
  'cmg8i011z000h06cui79c2qom',  -- Flipchart-Papier
  'cmg8i013r000j06cus3owqf7h',  -- Geschäftsausdrucke & Briefumschläge
  'cmg8i00px000706cua86261v7',  -- Jabra Evolve2 40
  'cmg8i00p1000606cusq8j755x',  -- Jabra Evolve2 65
  'cmg8i00n4000506cuos5drcsl',  -- Logitech C270
  'cmg8i00rr000906cuur7iil92',  -- Logitech Lift
  'cmg8i0111000g06cusm8xnoqu',  -- Pinnwand
  'cmg8i00ug000c06culcr7al79',  -- ROLINE HDMI Kabel
  'cmg8i00tk000b06cuga058cdv',  -- Verbatim USB-C Adapter
  'cmg8i0102000f06cu1s639hi3'   -- Whiteboard
);

-- Verify remaining products
SELECT COUNT(*) as "Remaining Products" FROM "Product";
