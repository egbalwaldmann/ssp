-- Step 1: Add new enum values
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'IT_SUPPORT';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EMPFANG';

-- Create ResponsibleRole enum
CREATE TYPE "ResponsibleRole" AS ENUM ('IT_SUPPORT', 'EMPFANG');
