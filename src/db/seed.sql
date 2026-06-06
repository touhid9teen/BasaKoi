-- BasaKoi Seed Data: Sample rental properties in Dhaka, Bangladesh
-- Run after schema migration: psql "$DATABASE_URL" < src/db/seed.sql

-- Properties in Banani (23.7925, 90.4078)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('2BHK Sublet in Banani DOHS', 25000, 23.7925, 90.4078, 'Road 11, Banani DOHS, Dhaka', true, 'natural', 2, 'Fully furnished 2-bedroom apartment with balcony. Close to Banani Market and Kemal Ataturk Avenue. Bills included.', 'available'),
('Studio Apartment near Banani Lake', 15000, 23.7950, 90.4100, 'Road 7, Banani, Dhaka', true, 'cylinder', 1, 'Cozy studio near Banani Lake. Kitchenette attached. Perfect for single professionals.', 'available'),
('3BHK Family Apartment Banani', 35000, 23.7900, 90.4050, 'Road 4, Banani, Dhaka', false, 'natural', 3, 'Spacious 3-bedroom corner apartment with 2 bathrooms. Gas, water, security included.', 'available');

-- Properties in Gulshan (23.7900, 90.4150)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('Luxury 1BHK Gulshan 1', 18000, 23.7900, 90.4150, 'Road 48, Gulshan 1, Dhaka', true, 'natural', 1, 'Premium 1-bedroom in high-rise with rooftop pool. Near Gulshan Circle 1. Fully furnished.', 'available'),
('4BHK Penthouse Gulshan 2', 65000, 23.7880, 90.4180, 'Road 74, Gulshan 2, Dhaka', false, 'natural', 4, 'Top-floor penthouse with 360-degree city view. 3 bathrooms, servant room, huge terrace.', 'rented_out'),
('Bachelor-Friendly Studio Gulshan', 16000, 23.7930, 90.4130, 'Road 132, Gulshan 1, Dhaka', true, 'cylinder', 1, 'Affordable studio for bachelors. Walking distance to Gulshan South Park. Generator backup.', 'available');

-- Properties in Dhanmondi (23.7450, 90.3800)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('2BHK Flat near Dhanmondi Lake', 22000, 23.7450, 90.3800, 'Road 6, Dhanmondi, Dhaka', false, 'natural', 2, 'Beautiful apartment with Dhanmondi Lake view. 2 bedrooms, 1 attached bath, spacious drawing room.', 'available'),
('Boys Sublet Dhanmondi 27', 12000, 23.7470, 90.3770, 'Road 5, Dhanmondi 27, Dhaka', true, 'cylinder', 2, 'Shared 2-bedroom apartment for male students. Near Dhaka College and Star Kabab. 2 sharing.', 'rented_out'),
('Girls Only Sublet Dhanmondi 15', 10000, 23.7420, 90.3830, 'Road 2, Dhanmondi 15, Dhaka', false, 'natural', 1, 'Single bedroom for female students in a family-run shared flat. Meals optional on weekdays.', 'available');

-- Properties in Mirpur (23.8100, 90.3650)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('3BHK Flat Mirpur 10', 18000, 23.8100, 90.3650, 'Mirpur 10, Block B, Dhaka', true, 'natural', 3, 'Good-sized 3-bedroom near Mirpur 10 roundabout. Close to metro station and shopping centers.', 'available'),
('Mess-style Living Mirpur 12', 8000, 23.8150, 90.3600, 'Mirpur 12, Block E, Dhaka', true, 'cylinder', 3, 'Budget-friendly mess accommodation for students/job-holders. 3 meals daily available. 3 persons sharing.', 'available'),
('1BHK near Sher-e-Bangla Stadium', 14000, 23.8050, 90.3700, 'Road 4, Mirpur 1, Dhaka', false, 'natural', 1, 'Peaceful 1-bedroom unit near the stadium. Good for couples. Water and gas included in rent.', 'available');

-- Properties in Uttara (23.8750, 90.3850)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('2BHK Uttara Sector 4', 20000, 23.8750, 90.3850, 'Road 1, Sector 4, Uttara, Dhaka', true, 'natural', 2, '2-bedroom apartment near Uttara metro station. 1 attached bathroom, parking space available.', 'available'),
('Family Apartment Uttara Sector 10', 28000, 23.8700, 90.3900, 'Road 12, Sector 10, Uttara, Dhaka', false, 'natural', 3, 'Well-maintained 3-bedroom apartment in a quiet sector. Ideal for families with children. Nearby school.', 'available'),
('Sublet Near Uttara Airport', 11000, 23.8850, 90.3950, 'House 52, Road 8, Sector 11, Uttara', true, 'cylinder', 1, 'Single room in shared apartment near Hazrat Shahjalal Airport. Ideal for airport staff/crew members.', 'rented_out');

-- Properties in Mohammadpur (23.7650, 90.3650)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('2BHK Mohammadpur Town Hall', 15000, 23.7650, 90.3650, 'Road 5, Mohammadpur, Dhaka', true, 'natural', 2, 'Affordable 2-bedroom near Mohammadpur Town Hall. 5 min walk to bus stop. All amenities nearby.', 'available'),
('Single Bedroom for Student', 7000, 23.7620, 90.3700, 'Road 4, Mohammadpur, Dhaka', true, 'natural', 1, 'Single bedroom in a family residence for a university student. Meals and WIFI included.', 'available');

-- Properties in Bashundhara (23.8100, 90.4250)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('Student Sublet Bashundhara R/A', 9500, 23.8100, 90.4250, 'Block C, Road 2, Bashundhara R/A, Dhaka', true, 'natural', 2, 'Perfect for students of North South University. Shared 2-bedroom with 3 other students. WIFI available.', 'available'),
('1BHK Near Jamuna Future Park', 17000, 23.8150, 90.4200, 'Block F, Bashundhara R/A, Dhaka', false, 'cylinder', 1, 'Compact 1-bedroom apartment close to Jamuna Future Park. Generator backup. Security guard 24/7.', 'available');

-- Properties in Old Dhaka (23.7050, 90.4100)
INSERT INTO properties (title, rent_amount, lat, lng, address, bachelor_allowed, gas_type, bedrooms, description, status) VALUES
('Family Home in Lalbagh', 12000, 23.7180, 90.3890, 'Lalbagh Road, Old Dhaka', false, 'natural', 3, 'Traditional 3-bedroom house in historical Lalbagh area. Close to Chawkbazar and Sadarghat.', 'available'),
('2BHK Shakhari Bazar Area', 10000, 23.7050, 90.4100, 'Shakhari Bazar, Old Dhaka', true, 'cylinder', 2, 'Budget-friendly 2-bedroom in the heart of Old Dhaka. A bit crowded but full of culture.', 'available');
