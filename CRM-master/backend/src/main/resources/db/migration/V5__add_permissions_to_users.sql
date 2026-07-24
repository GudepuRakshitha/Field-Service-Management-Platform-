-- Flyway Migration V5: Add permissions column to users table for granular RBAC & tenant management

ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;

-- Set default permissions for existing seed users
UPDATE users SET permissions = 'CREATE_WORK_ORDERS,ASSIGN_TECHNICIANS,EXECUTE_FIELD_JOBS,CLOSE_WORK_ORDERS,MANAGE_INVENTORY,MANAGE_TENANTS,MANAGE_USERS' WHERE role = 'MANAGER';
UPDATE users SET permissions = 'CREATE_WORK_ORDERS,ASSIGN_TECHNICIANS,EXECUTE_FIELD_JOBS,MANAGE_TENANTS' WHERE role = 'DISPATCHER';
UPDATE users SET permissions = 'EXECUTE_FIELD_JOBS' WHERE role = 'TECHNICIAN';
UPDATE users SET permissions = 'CREATE_WORK_ORDERS' WHERE role = 'CUSTOMER';
