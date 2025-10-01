-- Update user roles from old to new enum values
UPDATE "User" SET role = 'IT_SUPPORT' WHERE role = 'IT_AGENT';
UPDATE "User" SET role = 'EMPFANG' WHERE role = 'RECEPTION_AGENT';

-- Add responsibleRole column to Product table if it doesn't exist
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "responsibleRole" "ResponsibleRole" DEFAULT 'IT_SUPPORT';

-- Update existing products with appropriate responsible roles
UPDATE "Product" SET "responsibleRole" = 'IT_SUPPORT' WHERE category IN ('WEBCAM', 'HEADSET', 'MOUSE', 'KEYBOARD', 'ADAPTER', 'CABLE', 'PRINTER_TONER', 'SPEAKERS');
UPDATE "Product" SET "responsibleRole" = 'EMPFANG' WHERE category IN ('WHITEBOARD', 'PINBOARD', 'FLIPCHART', 'CHAIR', 'BUSINESS_PRINTS', 'OFFICE_MISC');
