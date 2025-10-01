-- Step 2: Update user roles
UPDATE "User" SET role = 'IT_SUPPORT' WHERE role = 'IT_AGENT';
UPDATE "User" SET role = 'EMPFANG' WHERE role = 'RECEPTION_AGENT';
