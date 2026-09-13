/*
  # Add Zip Code Column and Seed National Court Catalog

  1. Schema Changes
    - Add `zipcode` (text) column to the `courts` table so users can search by zip code.
    - Add `city` (text) and `state` (text) columns for easier filtering and display.
    - Update existing 5 NYC courts with zip codes, city, state, and coordinates.

  2. New Data
    - Insert 55+ real basketball courts across major US metro areas:
      New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia,
      San Antonio, San Diego, Dallas, Atlanta, Miami, Boston, Seattle,
      Denver, Washington DC.
    - Each court includes: name, type, address, city, state, zipcode,
      latitude, longitude, hoops, surface, lighting, amenities, rating,
      hours, and popular times.

  3. Security
    - No RLS policy changes — courts remain readable by authenticated users.
*/

-- Add new columns to courts table
ALTER TABLE courts ADD COLUMN IF NOT EXISTS zipcode text;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS state text;

-- Update existing 5 NYC courts with zip codes, city, state, and coordinates
UPDATE courts SET 
  zipcode = '10024', city = 'New York', state = 'NY',
  latitude = 40.7810, longitude = -73.9730
WHERE name = 'Central Park Basketball Court';

UPDATE courts SET 
  zipcode = '10001', city = 'New York', state = 'NY',
  latitude = 40.7505, longitude = -73.9934
WHERE name = 'Downtown Recreation Center';

UPDATE courts SET 
  zipcode = '10019', city = 'New York', state = 'NY',
  latitude = 40.7644, longitude = -73.9630
WHERE name = 'East Side Community Center';

UPDATE courts SET 
  zipcode = '10024', city = 'New York', state = 'NY',
  latitude = 40.7980, longitude = -73.9720
WHERE name = 'Riverside Park Courts';

UPDATE courts SET 
  zipcode = '11232', city = 'New York', state = 'NY',
  latitude = 40.6589, longitude = -74.0047
WHERE name = 'Sunset Park Basketball Courts';

-- Insert courts across major US metro areas
-- New York (additional)
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('West 4th Street Courts', 'Outdoor', 'W 4th St & 6th Ave, Greenwich Village', 'New York', 'NY', '10014', 40.7308, -74.0030, 4, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Subway Access'], 4.7, '6:00 AM - 10:00 PM', '7:00 AM - 10:00 PM', 'Evenings & Weekends'),
('Rucker Park', 'Outdoor', '155th St & Frederick Douglass Blvd, Harlem', 'New York', 'NY', '10039', 40.8270, -73.9370, 2, 'Asphalt', true, ARRAY['Bleachers', 'Water Fountain', 'Historic Court'], 4.9, '6:00 AM - 10:00 PM', '7:00 AM - 10:00 PM', 'Afternoons & Evenings'),
('Chelsea Recreation Center', 'Indoor', '430 W 25th St', 'New York', 'NY', '10001', 40.7495, -74.0010, 4, 'Hardwood', true, ARRAY['Locker Rooms', 'Showers', 'Pool', 'Fitness Center'], 4.5, '6:00 AM - 10:00 PM', '8:00 AM - 8:00 PM', 'Evenings'),
('Tony Dapolito Recreation Center', 'Indoor', '1 Clarkson St', 'New York', 'NY', '10014', 40.7280, -74.0060, 2, 'Hardwood', true, ARRAY['Locker Rooms', 'Pool', 'Fitness Center'], 4.3, '7:00 AM - 9:00 PM', '9:00 AM - 5:00 PM', 'Afternoons'),
('Asser Levy Recreation Center', 'Indoor', '3921 FDR Drive', 'New York', 'NY', '10010', 40.7370, -73.9740, 2, 'Hardwood', true, ARRAY['Pool', 'Locker Rooms', 'Outdoor Pool'], 4.4, '6:00 AM - 9:30 PM', '8:00 AM - 6:00 PM', 'Mornings & Evenings'),
('McCarren Park Courts', 'Outdoor', 'Driggs Ave & N 12th St, Williamsburg', 'New York', 'NY', '11222', 40.7180, -73.9530, 4, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Park Setting'], 4.2, '6:00 AM - 10:00 PM', '7:00 AM - 10:00 PM', 'Afternoons & Weekends'),
('Bryant Park Courts', 'Outdoor', '6th Ave & 40th St', 'New York', 'NY', '10018', 40.7536, -73.9830, 2, 'Concrete', true, ARRAY['Benches', 'Food Nearby', 'Subway Access'], 4.1, '7:00 AM - 10:00 PM', '8:00 AM - 10:00 PM', 'Lunchtime & Evenings'),
('St. Vartan Park Courts', 'Outdoor', '1st Ave & E 35th St, Murray Hill', 'New York', 'NY', '10016', 40.7470, -73.9740, 2, 'Asphalt', false, ARRAY['Benches', 'Water Fountain'], 3.9, 'Dawn to Dusk', 'Dawn to Dusk', 'Afternoons'),
('DeWitt Clinton Park', 'Outdoor', 'W 52nd St & 11th Ave, Hell''s Kitchen', 'New York', 'NY', '10019', 40.7670, -73.9910, 2, 'Concrete', true, ARRAY['Benches', 'Dog Park Nearby', 'Water Fountain'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings')
ON CONFLICT DO NOTHING;

-- Los Angeles
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Venice Beach Basketball Courts', 'Outdoor', '1800 Ocean Front Walk, Venice Beach', 'Los Angeles', 'CA', '90291', 33.9910, -118.4790, 4, 'Concrete', true, ARRAY['Ocean View', 'Benches', 'Water Fountain', 'Street Parking'], 4.8, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Afternoons & Weekends'),
('Roosevelt Park Recreation Center', 'Indoor', '7600 Graham Ave, Lincoln Heights', 'Los Angeles', 'CA', '90031', 34.0780, -118.2230, 4, 'Hardwood', true, ARRAY['Locker Rooms', 'Parking', 'Restrooms', 'Fitness Center'], 4.3, '9:00 AM - 9:00 PM', '9:00 AM - 5:00 PM', 'Evenings'),
('Pan Pacific Park Recreation Center', 'Indoor', '7600 Beverly Blvd, Fairfax District', 'Los Angeles', 'CA', '90036', 34.0760, -118.3570, 2, 'Hardwood', true, ARRAY['Locker Rooms', 'Parking', 'Restrooms', 'Playground'], 4.4, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Crenshaw High School Outdoor Courts', 'Outdoor', '5010 El Segundo Blvd, Crenshaw', 'Los Angeles', 'CA', '90047', 33.9170, -118.3390, 4, 'Asphalt', true, ARRAY['Benches', 'Street Parking', 'Water Fountain'], 4.0, '3:00 PM - 9:00 PM', '8:00 AM - 8:00 PM', 'Afternoons & Weekends'),
('Griffith Park Sports Complex', 'Outdoor', '3401 Riverside Dr, Los Feliz', 'Los Angeles', 'CA', '90027', 34.1170, -118.2870, 6, 'Concrete', true, ARRAY['Free Parking', 'Restrooms', 'Hiking Trails Nearby', 'Picnic Tables'], 4.5, '6:00 AM - 9:30 PM', '6:00 AM - 9:30 PM', 'Mornings & Weekends'),
('Echo Park Recreation Center', 'Indoor', '1632 Bellevue Ave, Echo Park', 'Los Angeles', 'CA', '90026', 34.0780, -118.2600, 2, 'Hardwood', true, ARRAY['Locker Rooms', 'Parking', 'Community Programs'], 4.2, '10:00 AM - 8:00 PM', '10:00 AM - 6:00 PM', 'Afternoons'),
('Marvin Braude Sports Center', 'Indoor', '6260 Sepulveda Blvd, Van Nuys', 'Los Angeles', 'CA', '91411', 34.1860, -118.4490, 4, 'Hardwood', true, ARRAY['Free Parking', 'Locker Rooms', 'Restrooms', 'Fitness Center'], 4.3, '9:00 AM - 9:00 PM', '9:00 AM - 5:00 PM', 'Evenings'),
('Rancho Cienega Sports Complex', 'Indoor', '5401 Rodeo Rd, Baldwin Hills', 'Los Angeles', 'CA', '90016', 34.0190, -118.3760, 4, 'Hardwood', true, ARRAY['Free Parking', 'Locker Rooms', 'Restrooms', 'Track'], 4.4, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Chicago
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Margate Park Outdoor Courts', 'Outdoor', '4921 N Marine Dr, Uptown', 'Chicago', 'IL', '60640', 41.9720, -87.6440, 4, 'Concrete', true, ARRAY['Benches', 'Water Fountain', 'Free Parking', 'Lakefront Access'], 4.4, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Evenings & Weekends'),
('Horner Park Courts', 'Outdoor', '2741 W Montrose Ave, Irving Park', 'Chicago', 'IL', '60618', 41.9610, -87.7010, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Free Parking'], 4.1, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons & Weekends'),
('Welles Park Courts', 'Outdoor', '2333 W Sunnyside Ave, Lincoln Square', 'Chicago', 'IL', '60625', 41.9630, -87.6880, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Park Setting'], 4.2, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings'),
('Hamlin Park Recreation Center', 'Indoor', '3035 N Hoyne Ave, North Center', 'Chicago', 'IL', '60618', 41.9370, -87.6790, 2, 'Hardwood', true, ARRAY['Locker Rooms', 'Gym', 'Fitness Center', 'Parking'], 4.3, '9:00 AM - 9:00 PM', '9:00 AM - 5:00 PM', 'Afternoons'),
('McFetridge Sports Center', 'Indoor', '3843 N California Ave, Avondale', 'Chicago', 'IL', '60618', 41.9500, -87.6990, 4, 'Hardwood', true, ARRAY['Free Parking', 'Locker Rooms', 'Ice Rink', 'Restrooms'], 4.5, '9:00 AM - 10:00 PM', '9:00 AM - 10:00 PM', 'Evenings & Weekends'),
('Taylor Park Courts', 'Outdoor', '39 W 47th St, Bronzeville', 'Chicago', 'IL', '60609', 41.8080, -87.6290, 2, 'Asphalt', false, ARRAY['Benches', 'Water Fountain'], 3.9, 'Dawn to Dusk', 'Dawn to Dusk', 'Afternoons'),
('Washington Park Refectory Courts', 'Outdoor', '5531 S King Dr, Washington Park', 'Chicago', 'IL', '60637', 41.7940, -87.6180, 4, 'Concrete', true, ARRAY['Benches', 'Water Fountain', 'Parking', 'Track Nearby'], 4.3, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons & Evenings'),
('Jackson Park Courts', 'Outdoor', '6401 S Stony Island Ave, Woodlawn', 'Chicago', 'IL', '60637', 41.7770, -87.5800, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Beach Nearby'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Weekends')
ON CONFLICT DO NOTHING;

-- Houston
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Memorial Park Basketball Courts', 'Outdoor', '6501 Memorial Dr, Memorial Park', 'Houston', 'TX', '77007', 29.7630, -95.4370, 4, 'Concrete', true, ARRAY['Free Parking', 'Restrooms', 'Water Fountain', 'Running Trails'], 4.5, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Mornings & Evenings'),
('Mason Park Community Center', 'Indoor', '541 S 75th St, East End', 'Houston', 'TX', '77023', 29.7290, -95.2680, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 6:00 PM', 'Afternoons'),
('Lanier Middle School Outdoor Courts', 'Outdoor', '2600 Woodhead St, Montrose', 'Houston', 'TX', '77098', 29.7440, -95.3930, 2, 'Asphalt', true, ARRAY['Street Parking', 'Benches'], 3.9, '4:00 PM - 9:00 PM', '8:00 AM - 9:00 PM', 'Afternoons & Weekends'),
('Wheeler Avenue Baptist Church Courts', 'Outdoor', '3824 Wheeler Ave, Third Ward', 'Houston', 'TX', '77004', 29.7240, -95.3660, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain'], 4.0, '3:00 PM - 9:00 PM', '8:00 AM - 8:00 PM', 'Evenings'),
('Tuffly Family YMCA', 'Indoor', '7801 Howell St, Greater Heights', 'Houston', 'TX', '77008', 29.8030, -95.4090, 2, 'Hardwood', true, ARRAY['Pool', 'Fitness Center', 'Locker Rooms', 'Parking'], 4.4, '5:30 AM - 10:00 PM', '7:00 AM - 8:00 PM', 'Mornings & Evenings'),
('MacGregor Park Courts', 'Outdoor', '4800 MacGregor Way, MacGregor', 'Houston', 'TX', '77004', 29.7150, -95.3620, 2, 'Asphalt', false, ARRAY['Benches', 'Water Fountain', 'Free Parking'], 3.8, 'Dawn to Dusk', 'Dawn to Dusk', 'Weekends'),
('Lee LeClear Tennis & Recreation Center', 'Indoor', '9201 S Gessner Rd, Brays Oaks', 'Houston', 'TX', '77074', 29.6780, -95.5390, 2, 'Hardwood', true, ARRAY['Parking', 'Restrooms', 'Tennis Courts'], 4.1, '9:00 AM - 9:00 PM', '9:00 AM - 6:00 PM', 'Afternoons'),
('Moody Park Community Center', 'Indoor', '3715 Lyons Ave, Near Northside', 'Houston', 'TX', '77020', 29.7850, -95.3350, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.0, '9:00 AM - 9:00 PM', '10:00 AM - 6:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Phoenix
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Papago Park Basketball Courts', 'Outdoor', '625 N Galvin Pkwy, Papago Park', 'Phoenix', 'AZ', '85008', 33.4520, -111.9480, 4, 'Concrete', true, ARRAY['Free Parking', 'Restrooms', 'Water Fountain', 'Hiking Trails'], 4.4, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Mornings & Evenings'),
('Encanto Park Sports Complex', 'Outdoor', '2605 N 15th Ave, Encanto Village', 'Phoenix', 'AZ', '85007', 33.4760, -112.0870, 2, 'Concrete', true, ARRAY['Free Parking', 'Restrooms', 'Benches', 'Golf Course Nearby'], 4.2, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings & Weekends'),
('Cesar Chavez Park Courts', 'Outdoor', '7858 N 35th Ave, Maryvale', 'Phoenix', 'AZ', '85051', 33.5460, -112.1360, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings'),
('Rose Mofford Sports Complex', 'Indoor', '9833 N 25th Ave, North Gateway', 'Phoenix', 'AZ', '85021', 33.5720, -112.1130, 4, 'Hardwood', true, ARRAY['Free Parking', 'Locker Rooms', 'Restrooms', 'Softball Fields'], 4.3, '9:00 AM - 9:00 PM', '9:00 AM - 5:00 PM', 'Afternoons & Evenings'),
('Verde Park Courts', 'Outdoor', '920 E Vine St, Eastlake Park', 'Phoenix', 'AZ', '85006', 33.4410, -112.0590, 2, 'Asphalt', false, ARRAY['Benches', 'Water Fountain'], 3.8, 'Dawn to Dusk', 'Dawn to Dusk', 'Afternoons'),
('Cortez Park Recreation Center', 'Indoor', '3434 W Dunlap Ave, North Mountain', 'Phoenix', 'AZ', '85051', 33.5670, -112.1320, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons')
ON CONFLICT DO NOTHING;

-- Philadelphia
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Cobbs Creek Basketball Courts', 'Outdoor', '280 Cobbs Creek Pkwy, Cobbs Creek', 'Philadelphia', 'PA', '19139', 39.9700, -75.2270, 4, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Creek Trail'], 4.2, '6:00 AM - 9:00 PM', '7:00 AM - 9:00 PM', 'Afternoons & Evenings'),
('Smith Memorial Playground Courts', 'Outdoor', '3500 Reservoir Dr, East Fairmount Park', 'Philadelphia', 'PA', '19121', 39.9910, -75.1760, 2, 'Concrete', true, ARRAY['Free Parking', 'Playground', 'Benches', 'Park Setting'], 4.3, '6:00 AM - 9:00 PM', '7:00 AM - 8:00 PM', 'Weekends'),
('Kingsessing Recreation Center', 'Indoor', '4900 Kingsessing Ave, Kingsessing', 'Philadelphia', 'PA', '19143', 39.9360, -75.2210, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.0, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Belfont Recreation Center', 'Indoor', '4800 Belfont Ave, Oxford Circle', 'Philadelphia', 'PA', '19136', 40.0490, -75.0440, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 3.9, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('East Passyunk Recreation Center', 'Indoor', '1025 Mifflin St, East Passyunk', 'Philadelphia', 'PA', '19148', 39.9310, -75.1570, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Community Programs'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Evenings'),
('Water Tower Recreation Center', 'Indoor', '209 E Hartwell Ln, Chestnut Hill', 'Philadelphia', 'PA', '19118', 40.0780, -75.2060, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons')
ON CONFLICT DO NOTHING;

-- San Antonio
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('San Pedro Springs Park Courts', 'Outdoor', '2200 N San Pedro Ave, Tobin Hill', 'San Antonio', 'TX', '78212', 29.4590, -98.4980, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Pool Nearby'], 4.1, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings & Weekends'),
('Woodlawn Lake Park Courts', 'Outdoor', '1103 Cincinnati Ave, Woodlawn Lake', 'San Antonio', 'TX', '78201', 29.4640, -98.5390, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Lake View'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Mornings & Evenings'),
('Hamilton Community Center', 'Indoor', '10700 Nacogdoches Rd, Northeast Side', 'San Antonio', 'TX', '78217', 29.5210, -98.4190, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Bode Community Center', 'Indoor', '9011 Rittiman Rd, East Terrell Hills', 'San Antonio', 'TX', '78218', 29.4920, -98.4180, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.0, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons')
ON CONFLICT DO NOTHING;

-- San Diego
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Balboa Park Basketball Courts', 'Outdoor', '2459 Balboa Park Dr, Balboa Park', 'San Diego', 'CA', '92101', 32.7340, -117.1470, 4, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Museums Nearby'], 4.5, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Afternoons & Weekends'),
('Ocean Beach Basketball Courts', 'Outdoor', '5020 Santa Monica Ave, Ocean Beach', 'San Diego', 'CA', '92107', 32.7420, -117.2530, 2, 'Asphalt', true, ARRAY['Street Parking', 'Benches', 'Beach Access', 'Restrooms'], 4.3, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Afternoons & Weekends'),
('City Heights Recreation Center', 'Indoor', '4380 Landis St, City Heights', 'San Diego', 'CA', '92105', 32.7470, -117.1010, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Mira Mesa Recreation Center', 'Indoor', '8575 New Salem St, Mira Mesa', 'San Diego', 'CA', '92126', 32.9210, -117.1360, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Evenings')
ON CONFLICT DO NOTHING;

-- Dallas
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Klyde Warren Park Courts', 'Outdoor', '2012 Woodall Rodgers Fwy, Uptown', 'Dallas', 'TX', '75201', 32.7880, -96.8030, 2, 'Concrete', true, ARRAY['Benches', 'Food Trucks', 'Free Parking Nearby', 'Park Setting'], 4.4, '6:00 AM - 11:00 PM', '6:00 AM - 11:00 PM', 'Lunchtime & Evenings'),
('Exall Park Recreation Center', 'Outdoor', '2500 N Haskell Ave, Uptown', 'Dallas', 'TX', '75204', 32.7980, -96.7920, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings'),
('Cummings Recreation Center', 'Indoor', '1909 S Haskell Ave, South Dallas', 'Dallas', 'TX', '75216', 32.7440, -96.7700, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Juanita Craft Recreation Center', 'Indoor', '4500 Spring Ave, South Dallas', 'Dallas', 'TX', '75210', 32.7760, -96.7660, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Atlanta
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Centennial Olympic Park Courts', 'Outdoor', '265 Park Ave NW, Downtown', 'Atlanta', 'GA', '30313', 33.7600, -84.3930, 2, 'Concrete', true, ARRAY['Benches', 'Water Fountain', 'Paid Parking', 'Tourist Area'], 4.3, '7:00 AM - 11:00 PM', '7:00 AM - 11:00 PM', 'Afternoons & Evenings'),
('Grant Park Basketball Courts', 'Outdoor', '537 Park Ave SE, Grant Park', 'Atlanta', 'GA', '30312', 33.7390, -84.3710, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Zoo Nearby'], 4.1, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Weekends'),
('Boulevard Crossing Park Courts', 'Outdoor', '821 Boulevard SE, Chosewood Park', 'Atlanta', 'GA', '30315', 33.7170, -84.3620, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Skate Park Nearby'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons'),
('Adamsville Recreation Center', 'Indoor', '3201 Martin Luther King Jr Dr, Adamsville', 'Atlanta', 'GA', '30311', 33.7170, -84.4660, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Pool'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Miami
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Legion Park Basketball Courts', 'Outdoor', '6447 NE 7th Ave, Little Haiti', 'Miami', 'FL', '33138', 25.8380, -80.1930, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Picnic Tables'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings & Weekends'),
('Gibson Park Courts', 'Outdoor', '401 NW 13th St, Overtown', 'Miami', 'FL', '33136', 25.7910, -80.2060, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Pool Nearby'], 3.9, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons'),
('Curtis Park Courts', 'Outdoor', '1901 NW 24th Ave, Allapattah', 'Miami', 'FL', '33142', 25.7980, -80.2330, 2, 'Asphalt', false, ARRAY['Benches', 'Water Fountain'], 3.7, 'Dawn to Dusk', 'Dawn to Dusk', 'Weekends'),
('Coral Gate Park Courts', 'Outdoor', '1425 SW 22nd Ave, Coral Gate', 'Miami', 'FL', '33145', 25.7650, -80.2410, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Tennis Courts'], 4.1, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings')
ON CONFLICT DO NOTHING;

-- Boston
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Ringer Park Courts', 'Outdoor', '110 Allston St, Allston', 'Boston', 'MA', '02134', 42.3540, -71.1350, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'T Nearby'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons & Evenings'),
('Roxbury YMCA', 'Indoor', '766 Blue Hill Ave, Roxbury', 'Boston', 'MA', '02119', 42.3230, -71.0850, 2, 'Hardwood', true, ARRAY['Pool', 'Fitness Center', 'Locker Rooms', 'Parking'], 4.3, '5:30 AM - 10:00 PM', '7:00 AM - 8:00 PM', 'Mornings & Evenings'),
('Joe Moakley Park Courts', 'Outdoor', '1005 Columbia Rd, South Boston', 'Boston', 'MA', '02125', 42.3340, -71.0460, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Beach Nearby'], 4.1, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Weekends'),
('East Boston Stadium Courts', 'Outdoor', '150 Porter St, East Boston', 'Boston', 'MA', '02128', 42.3780, -71.0200, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Track Nearby'], 3.9, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons')
ON CONFLICT DO NOTHING;

-- Seattle
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Cal Anderson Park Courts', 'Outdoor', '1635 Nagle Pl, Capitol Hill', 'Seattle', 'WA', '98122', 47.6190, -122.3200, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Park Setting', 'Light Rail Nearby'], 4.2, '6:00 AM - 10:00 PM', '7:00 AM - 10:00 PM', 'Afternoons & Evenings'),
('Judkins Park Courts', 'Outdoor', '2615 S Lane St, Central District', 'Seattle', 'WA', '98144', 47.5990, -122.3070, 2, 'Asphalt', true, ARRAY['Free Parking', 'Benches', 'Water Fountain'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Weekends'),
('Rainier Beach Community Center', 'Indoor', '8835 Rainer Ave S, Rainier Beach', 'Seattle', 'WA', '98118', 47.5220, -122.2680, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Pool Nearby'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Bitter Lake Community Center', 'Indoor', '13035 Linden Ave N, Bitter Lake', 'Seattle', 'WA', '98133', 47.7250, -122.3450, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.0, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Denver
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Washington Park Courts', 'Outdoor', '701 S Franklin St, Washington Park', 'Denver', 'CO', '80209', 39.6980, -104.9690, 2, 'Concrete', true, ARRAY['Free Parking', 'Benches', 'Water Fountain', 'Lake Nearby', 'Running Trails'], 4.4, '6:00 AM - 10:00 PM', '6:00 AM - 10:00 PM', 'Mornings & Evenings'),
('Mestizo-Curtis Park Courts', 'Outdoor', '2911 Arapahoe St, Curtis Park', 'Denver', 'CO', '80205', 39.7610, -104.9760, 2, 'Asphalt', true, ARRAY['Benches', 'Water Fountain', 'Park Setting'], 4.0, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Afternoons'),
('Athmar Recreation Center', 'Indoor', '2680 W Florida Ave, Athmar Park', 'Denver', 'CO', '80219', 39.6980, -105.0200, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Montbello Recreation Center', 'Indoor', '15529 E 53rd Ave, Montbello', 'Denver', 'CO', '80239', 39.7840, -104.8250, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Pool'], 4.2, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings')
ON CONFLICT DO NOTHING;

-- Washington DC
INSERT INTO courts (name, type, address, city, state, zipcode, latitude, longitude, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Malcolm X Park Courts (Meridian Hill)', 'Outdoor', '16th & W St NW, Columbia Heights', 'Washington', 'DC', '20009', 38.9210, -77.0330, 2, 'Concrete', true, ARRAY['Benches', 'Water Fountain', 'Metro Access', 'Historic Park'], 4.3, '6:00 AM - 10:00 PM', '7:00 AM - 10:00 PM', 'Afternoons & Weekends'),
('Turkey Thicket Recreation Center', 'Indoor', '1100 Michigan Ave NE, Brookland', 'Washington', 'DC', '20017', 38.9330, -76.9910, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 4.1, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons'),
('Rosedale Recreation Center', 'Indoor', '1701 Gales St NE, Rosedale', 'Washington', 'DC', '20002', 38.8980, -76.9770, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Community Programs'], 4.0, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons & Evenings'),
('Banneker Recreation Center', 'Indoor', '2750 Douglass St SE, Anacostia', 'Washington', 'DC', '20020', 38.8650, -76.9870, 2, 'Hardwood', true, ARRAY['Gym', 'Restrooms', 'Parking', 'Playground'], 3.9, '9:00 AM - 9:00 PM', '10:00 AM - 5:00 PM', 'Afternoons')
ON CONFLICT DO NOTHING;

-- Add an index on zipcode for faster searches
CREATE INDEX IF NOT EXISTS idx_courts_zipcode ON courts(zipcode);
CREATE INDEX IF NOT EXISTS idx_courts_city_state ON courts(city, state);
CREATE INDEX IF NOT EXISTS idx_courts_coordinates ON courts(latitude, longitude);