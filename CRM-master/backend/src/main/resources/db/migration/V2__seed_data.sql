-- Seed Data for Project KEYSTONE

-- 1. Customers
INSERT INTO customers (id, name, contact_email, created_at, updated_at) VALUES
(1, 'Apex Commercial Properties', 'contact@apex.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Metro Retail Group', 'info@metro.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE customers ALTER COLUMN id RESTART WITH 100;
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 100;

-- 2. Sites
INSERT INTO sites (id, customer_id, name, address, created_at, updated_at) VALUES
(1, 1, 'Apex HQ Tower', '100 Plaza Way, Suite 400, New York, NY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Apex Warehouse North', '45 Industrial Pkwy, Newark, NJ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Metro Mall Flagship', '800 Grand Ave, Chicago, IL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'Metro Distribution Hub', '12 Logistics Way, Joliet, IL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE sites ALTER COLUMN id RESTART WITH 100;
ALTER SEQUENCE IF EXISTS sites_id_seq RESTART WITH 100;

-- 3. Users (Password for all seed accounts is "password123", BCrypt hashed below)
INSERT INTO users (id, name, email, password_hash, role, customer_id, created_at, updated_at) VALUES
(1, 'Morgan Manager', 'admin@meridian.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'MANAGER', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Dan Dispatcher', 'dispatcher@meridian.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'DISPATCHER', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Alex Tech', 'tech1@meridian.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'TECHNICIAN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Bob Technician', 'tech2@meridian.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'TECHNICIAN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Alice Apex Rep', 'customer1@apex.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'CUSTOMER', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Charlie Metro Rep', 'customer2@metro.com', '$2a$10$P3P/U/DoH32J7iGX/5LNhO/suEcMoj7DLanCv8viSu8L9r0sFbVuq', 'CUSTOMER', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 100;

-- 4. Parts
INSERT INTO parts (id, name, sku, unit_cost, stock_qty, created_at, updated_at) VALUES
(1, 'HVAC Compressor 5HP', 'PRT-HVAC-001', 450.00, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Heavy Duty Circuit Breaker 100A', 'PRT-ELEC-002', 85.50, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Commercial Water Filter Cartridge', 'PRT-PLUM-003', 32.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Copper Pipe Joint 2-inch', 'PRT-PLUM-004', 14.25, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Digital Thermostat Controller', 'PRT-HVAC-005', 120.00, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE parts ALTER COLUMN id RESTART WITH 100;
ALTER SEQUENCE IF EXISTS parts_id_seq RESTART WITH 100;

-- 5. Initial Work Orders
-- SLA rules: CRITICAL = 4h, HIGH = 24h, MEDIUM = 72h, LOW = 120h
INSERT INTO work_orders (id, code, title, description, priority, status, sla_due_at, customer_id, site_id, assigned_to_user_id, created_at, updated_at) VALUES
(1, 'WO-2026-000001', 'HVAC Chiller Unit Overheating', 'Rooftop unit 3 in HQ Tower throwing high thermal alert. Requires urgent inspection.', 'CRITICAL', 'IN_PROGRESS', CURRENT_TIMESTAMP + INTERVAL '4' HOUR, 1, 1, 3, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, CURRENT_TIMESTAMP),
(2, 'WO-2026-000002', 'Main Floor Water Leak', 'Water leaking near restrooms in Metro Mall. Main valve shut down.', 'HIGH', 'ASSIGNED', CURRENT_TIMESTAMP + INTERVAL '20' HOUR, 2, 3, 4, CURRENT_TIMESTAMP - INTERVAL '4' HOUR, CURRENT_TIMESTAMP),
(3, 'WO-2026-000003', 'Quarterly Electrical Panel Maintenance', 'Routine preventive maintenance on distribution panel B2.', 'MEDIUM', 'NEW', CURRENT_TIMESTAMP + INTERVAL '72' HOUR, 1, 2, NULL, CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP),
(4, 'WO-2026-000004', 'Thermostat Calibration', 'Calibrate digital thermostats in Metro Distribution office.', 'LOW', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10' HOUR, 2, 4, 3, CURRENT_TIMESTAMP - INTERVAL '48' HOUR, CURRENT_TIMESTAMP - INTERVAL '10' HOUR);

ALTER TABLE work_orders ALTER COLUMN id RESTART WITH 100;
ALTER SEQUENCE IF EXISTS work_orders_id_seq RESTART WITH 100;

-- 6. Initial Work Order Status History
INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_user_id, changed_at, note) VALUES
(1, NULL, 'NEW', 2, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, 'Work order created by Dispatcher'),
(1, 'NEW', 'ASSIGNED', 2, CURRENT_TIMESTAMP - INTERVAL '50' MINUTE, 'Assigned to Alex Tech'),
(1, 'ASSIGNED', 'IN_PROGRESS', 3, CURRENT_TIMESTAMP - INTERVAL '40' MINUTE, 'Started diagnostic on rooftop unit'),

(2, NULL, 'NEW', 6, CURRENT_TIMESTAMP - INTERVAL '4' HOUR, 'Raised via Customer Portal'),
(2, 'NEW', 'ASSIGNED', 2, CURRENT_TIMESTAMP - INTERVAL '3' HOUR, 'Assigned to Bob Technician'),

(3, NULL, 'NEW', 2, CURRENT_TIMESTAMP - INTERVAL '2' HOUR, 'Scheduled PM work order created'),

(4, NULL, 'NEW', 2, CURRENT_TIMESTAMP - INTERVAL '48' HOUR, 'Work order created'),
(4, 'NEW', 'ASSIGNED', 2, CURRENT_TIMESTAMP - INTERVAL '40' HOUR, 'Assigned to Alex Tech'),
(4, 'ASSIGNED', 'IN_PROGRESS', 3, CURRENT_TIMESTAMP - INTERVAL '24' HOUR, 'Work started'),
(4, 'IN_PROGRESS', 'COMPLETED', 3, CURRENT_TIMESTAMP - INTERVAL '10' HOUR, 'Calibration finished successfully');

-- 7. Seed Part Usage & Time Logs for WO-4
INSERT INTO part_usages (work_order_id, part_id, qty_used, unit_cost_at_time, created_at) VALUES
(4, 5, 1, 120.00, CURRENT_TIMESTAMP - INTERVAL '10' HOUR);

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, created_at) VALUES
(4, 3, 90, 'Replaced thermostat sensor and recalibrated firmware', CURRENT_TIMESTAMP - INTERVAL '10' HOUR);

