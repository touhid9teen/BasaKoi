-- Additional Seed Data: More properties across Dhaka for proper testing
-- Run: psql "$DATABASE_URL" < src/db/seed-extra.sql

-- ===== New areas and more density =====

-- Badda (23.7780, 90.4280)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Badda Near Satarkul Bridge', 12000, 500, 'June', 'bachelor_male', 23.7780, 90.4280, 'Road 1, Badda, Dhaka', true, 'natural', 1, 1, 'Budget-friendly 1-bedroom near Satarkul Bridge. 5 min walk to bus stop. Good for office goers.', '01711111101', 'Single professional preferred.', 'full_flat', false, 'available'),
('2BHK Flat Badda Link Road', 16000, 800, 'August', 'family', 23.7760, 90.4300, 'Link Road, Badda, Dhaka', false, 'cylinder', 2, 1, 'Nice 2-bedroom apartment on Link Road. Market and school within walking distance.', '01711111102', 'Family preferred. Parking available.', 'full_flat', true, 'available'),
('Sublet Room in Badda', 7000, 200, 'July', 'any', 23.7800, 90.4260, 'House 12, Badda, Dhaka', true, 'natural', 1, 1, 'Single room in a shared apartment for students or job holders.', '01711111103', 'Male only. Quiet hours after 10pm.', 'sublet_room', false, 'available');

-- Rampura (23.7650, 90.4250)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('2BHK Rampura Bazaar', 14000, 500, 'July', 'family', 23.7650, 90.4250, 'Road 2, Rampura, Dhaka', true, 'natural', 2, 1, 'Affordable 2-bedroom flat near Rampura Bazaar. Close to all amenities.', '01711111104', 'Bachelor or family okay.', 'full_flat', false, 'available'),
('Studio Near Rampura Bridge', 10000, 300, 'June', 'bachelor_male', 23.7670, 90.4230, 'Rampura Bridge Road, Dhaka', true, 'cylinder', 1, 1, 'Compact studio near Rampura Bridge. Great for single professional.', '01711111105', 'No smoking indoors.', 'full_flat', false, 'available'),
('Boys Mess Rampura', 5500, 100, 'June', 'any', 23.7630, 90.4270, 'Block C, Rampura, Dhaka', true, 'natural', 3, 2, '3-person shared mess near Rampura. Meals included. Very affordable.', '01711111106', 'Students only. Semester basis.', 'sublet_room', false, 'available');

-- Malibagh (23.7450, 90.4100)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Malibagh Railgate', 11000, 400, 'July', 'bachelor_female', 23.7450, 90.4100, 'Railgate Road, Malibagh, Dhaka', true, 'natural', 1, 1, 'Safe 1-bedroom for female professionals near Malibagh Railgate.', '01711111107', 'Female only. Security guard available.', 'full_flat', false, 'available'),
('2BHK Malibagh DIT Road', 18000, 1000, 'September', 'family', 23.7430, 90.4120, 'DIT Road, Malibagh, Dhaka', false, 'natural', 2, 2, 'Spacious 2-bedroom on DIT Road. Easy access to all parts of Dhaka.', '01711111108', 'Family only. No sublet.', 'full_flat', true, 'available'),
('Sublet Near Malibagh Market', 6500, 200, 'August', 'any', 23.7470, 90.4080, 'Road 5, Malibagh, Dhaka', true, 'cylinder', 1, 1, 'Single room near Malibagh Market. Shared kitchen and bathroom.', '01711111109', 'Male or female. Flexible timing.', 'sublet_room', false, 'rented_out');

-- Khilgaon (23.7550, 90.4200)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('2BHK Khilgaon Taltola', 15000, 700, 'June', 'family', 23.7550, 90.4200, 'Taltola, Khilgaon, Dhaka', true, 'natural', 2, 1, '2-bedroom near Khilgaon Taltola. Market, school, park within 5 min walk.', '01711111110', 'Bachelor or family welcome.', 'full_flat', false, 'available'),
('1BHK Khilgaon Railway Station', 9000, 300, 'July', 'bachelor_male', 23.7530, 90.4220, 'Railway Station Road, Khilgaon, Dhaka', true, 'cylinder', 1, 1, 'Budget room near Khilgaon Railway Station for daily commuters.', '01711111111', 'Male only. Monthly rent basis.', 'full_flat', false, 'available');

-- Shyamoli (23.7750, 90.3680)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('3BHK Shyamoli Square', 22000, 1200, 'August', 'family', 23.7750, 90.3680, 'Road 2, Shyamoli, Dhaka', false, 'natural', 3, 2, 'Beautiful 3-bedroom near Shyamoli Square. Corner flat with lots of light.', '01711111112', 'Family only. No bachelors.', 'full_flat', true, 'available'),
('Sublet in Shyamoli', 8000, 300, 'July', 'any', 23.7730, 90.3700, 'Road 5, Shyamoli, Dhaka', true, 'natural', 1, 1, 'Single bedroom in well-maintained shared apartment in Shyamoli.', '01711111113', 'Job holder preferred.', 'sublet_room', false, 'available'),
('Studio Shyamoli', 13500, 500, 'June', 'bachelor_female', 23.7770, 90.3660, 'Road 8, Shyamoli, Dhaka', true, 'cylinder', 1, 1, 'Compact studio perfect for female professionals. Near bus stops.', '01711111114', 'Female only. Generator backup.', 'full_flat', false, 'available');

-- Wari (23.7150, 90.4150)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('2BHK Flat in Wari', 11000, 400, 'September', 'family', 23.7150, 90.4150, 'Road 3, Wari, Dhaka', false, 'natural', 2, 1, 'Old but spacious 2-bedroom in Wari. Close to restaurants and shops.', '01711111115', 'Family only. Traditional area.', 'full_flat', false, 'available'),
('1BHK Near Wari Police Box', 8500, 200, 'July', 'bachelor_male', 23.7130, 90.4170, 'Police Box Road, Wari, Dhaka', true, 'cylinder', 1, 1, 'Budget-friendly single room in Wari. Safe area with police box nearby.', '01711111116', 'Single male only.', 'full_flat', false, 'available');

-- Tejgaon (23.7650, 90.3950)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Tejgaon Industrial Area', 13000, 600, 'June', 'bachelor_male', 23.7650, 90.3950, 'Road 3, Tejgaon, Dhaka', true, 'natural', 1, 1, 'Nicely furnished 1-bedroom in Tejgaon. Perfect for private sector employees.', '01711111117', 'Male professional preferred.', 'full_flat', false, 'available'),
('2BHK Tejgaon Link Road', 19000, 1000, 'August', 'family', 23.7630, 90.3970, 'Link Road, Tejgaon, Dhaka', false, 'natural', 2, 2, 'Luxury 2-bedroom in Tejgaon. Gym and parking included.', '01711111118', 'Family or couple. Security deposit 2 months.', 'full_flat', true, 'available');

-- Farmgate (23.7570, 90.3850)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('Studio Farmgate', 14000, 600, 'July', 'bachelor_female', 23.7570, 90.3850, 'Road 4, Farmgate, Dhaka', true, 'natural', 1, 1, 'Great studio for female professionals near Farmgate. Close to all bus routes.', '01711111119', 'Female only. No overnight guests.', 'full_flat', true, 'available'),
('Sublet Near Farmgate Market', 7500, 200, 'June', 'any', 23.7590, 90.3830, 'Farmgate Market Road, Dhaka', true, 'cylinder', 1, 1, 'Single room in shared flat near Farmgate Market. Students welcome.', '01711111120', 'Student preferred. Flexible lease.', 'sublet_room', false, 'available');

-- Baridhara (23.7950, 90.4250)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('Luxury 2BHK Baridhara DOHS', 35000, 2000, 'September', 'family', 23.7950, 90.4250, 'Road 8, Baridhara DOHS, Dhaka', false, 'natural', 2, 2, 'Premium 2-bedroom in Baridhara DOHS. Community pool and park access.', '01711111121', 'Family only. DOHS rules apply.', 'full_flat', true, 'available'),
('1BHK Baridhara Lake View', 22000, 1200, 'August', 'bachelor_female', 23.7930, 90.4270, 'Lake Road, Baridhara, Dhaka', true, 'natural', 1, 1, 'Beautiful 1-bedroom overlooking Baridhara Lake. Calm and peaceful area.', '01711111122', 'Female only. No parties.', 'full_flat', false, 'available');

-- Motijheel (23.7320, 90.4180)
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('Studio Motijheel Dilkusha', 15500, 700, 'July', 'any', 23.7320, 90.4180, 'Dilkusha C/A, Motijheel, Dhaka', true, 'natural', 1, 1, 'Central studio in Motijheel Dilkusha. Walking distance to all major banks.', '01711111123', 'Professional preferred. 9-5 suitable.', 'full_flat', true, 'available'),
('Sublet Near Motijheel', 6000, 200, 'June', 'any', 23.7300, 90.4200, 'Road 1, Motijheel, Dhaka', true, 'cylinder', 1, 1, 'Budget sublet near Motijheel. Close to metro station.', '01711111124', 'Male or female. Short term okay.', 'sublet_room', false, 'available');

-- ===== More density in existing areas =====

-- More Banani properties
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Banani Staff Quarters', 14500, 500, 'August', 'bachelor_male', 23.7940, 90.4060, 'Staff Quarters, Banani, Dhaka', true, 'natural', 1, 1, 'Well-maintained 1-bedroom in Banani staff quarters. Security included.', '01711111125', 'Male only. Staff referred preferred.', 'full_flat', false, 'available'),
('Co-living Banani 3 Sharing', 6500, 200, 'June', 'any', 23.7910, 90.4090, 'Road 9, Banani, Dhaka', true, 'cylinder', 3, 1, 'Co-living space in Banani. 3 persons sharing. WIFI and meals included.', '01711111126', 'Students or job holders. Male.', 'sublet_room', false, 'available');

-- More Gulshan properties
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('2BHK Gulshan Avenue', 45000, 2500, 'July', 'family', 23.7880, 90.4140, 'Gulshan Avenue, Dhaka', false, 'natural', 2, 2, 'High-end 2-bedroom on Gulshan Avenue. Serviced apartment with cleaning.', '01711111127', 'Family or diplomatic staff.', 'full_flat', true, 'available'),
('Bachelor Room Gulshan 2', 18000, 800, 'July', 'bachelor_male', 23.7860, 90.4160, 'Road 56, Gulshan 2, Dhaka', true, 'natural', 1, 1, 'Single room for bachelors near Gulshan 2. Premium location.', '01711111128', 'Bachelor male. No smoking.', 'full_flat', false, 'rented_out');

-- More Dhanmondi properties
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Dhanmondi 32', 16000, 700, 'September', 'bachelor_female', 23.7430, 90.3780, 'Road 4, Dhanmondi 32, Dhaka', true, 'natural', 1, 1, 'Safe 1-bedroom for female in Dhanmondi 32. Near bus stand and market.', '01711111129', 'Female students only.', 'full_flat', false, 'available'),
('2BHK Dhanmondi Staff Quarter', 19000, 900, 'June', 'family', 23.7480, 90.3820, 'Staff Quarter, Dhanmondi 27, Dhaka', false, 'cylinder', 2, 1, 'Affordable 2-bedroom Dhanmondi staff quarter. Prime location.', '01711111130', 'Family. No bachelors.', 'full_flat', true, 'available'),
('Girls Sublet Dhanmondi 6', 9000, 300, 'August', 'any', 23.7400, 90.3850, 'Road 6A, Dhanmondi 6, Dhaka', false, 'natural', 1, 1, 'Single room for female in Dhanmondi 6. Family environment. Meals optional.', '01711111131', 'Female students preferred.', 'sublet_room', false, 'available');

-- More Mirpur properties
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('1BHK Mirpur 1', 11000, 400, 'July', 'bachelor_male', 23.8080, 90.3680, 'Block A, Mirpur 1, Dhaka', true, 'cylinder', 1, 1, 'Budget 1-bedroom in Mirpur 1. Near the stadium and transport hub.', '01711111132', 'Male only.', 'full_flat', false, 'available'),
('3BHK Mirpur 6', 20000, 1000, 'August', 'family', 23.8120, 90.3620, 'Block C, Mirpur 6, Dhaka', false, 'natural', 3, 2, 'Family apartment in Mirpur 6. Corner flat, lots of ventilation.', '01711111133', 'Family with kids welcome.', 'full_flat', true, 'available'),
('Sublet Mirpur 11', 5500, 150, 'June', 'any', 23.8180, 90.3580, 'Block F, Mirpur 11, Dhaka', true, 'natural', 1, 1, 'Cheapest single room in Mirpur. Near Dhaka Zoo. Ideal for students.', '01711111134', 'Student. Very flexible.', 'sublet_room', false, 'available');

-- ===== Extreme budget options =====
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('Super Budget Sublet Kamrangirchar', 3500, 100, 'June', 'any', 23.7000, 90.3950, 'Kamrangirchar, Dhaka', true, 'none', 1, 0, 'Very basic accommodation in Kamrangirchar. Shared toilet. Lowest price in Dhaka.', '01711111135', 'Extreme budget. Cash only.', 'sublet_room', false, 'available'),
('Tin Shed Shared Room', 4000, 0, 'July', 'any', 23.7200, 90.4000, 'Jhiltola, Dhaka', true, 'none', 2, 0, 'Tin shed accommodation. Shared bathroom in compound. For day laborers.', '01711111136', 'Laborers preferred. Weekly payment.', 'sublet_room', false, 'available');

-- ===== Premium/Luxury options =====
INSERT INTO properties (title, rent_amount, service_charge, available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type, bedrooms, bathroom, description, phone, special_instructions, accommodation_type, lift_available, status) VALUES
('Penthouse Gulshan 1', 95000, 5000, 'October', 'family', 23.7850, 90.4120, 'Road 126, Gulshan 1, Dhaka', false, 'natural', 4, 4, 'Ultra-luxury penthouse with rooftop pool, gym, and 360-degree Dhaka skyline view. 2 car parking.', '01711111137', 'Diplomats or business executives. 6-month advance required.', 'full_flat', true, 'available'),
('Luxury Sublet Banani', 25000, 1000, 'August', 'bachelor_male', 23.7900, 90.4080, 'Banani DOHS Road 1, Dhaka', true, 'natural', 1, 1, 'High-end single room in Banani DOHS. Access to gym, pool, and tennis court.', '01711111138', 'Bachelor executive. No parties.', 'sublet_room', true, 'available'),
('Duplex Uttara Sector 7', 55000, 3000, 'September', 'family', 23.8780, 90.3830, 'Sector 7, Uttara, Dhaka', false, 'natural', 5, 4, 'Premium duplex apartment in Uttara Sector 7. 2 floors, rooftop garden, servant room.', '01711111139', 'Family. Foreign nationals welcome.', 'full_flat', true, 'rented_out');
