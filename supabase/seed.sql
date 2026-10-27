-- ==============================================================================
-- Sadqah Jariyah Monthly Fund (সদকায়ে জারিয়া মাসিক ফান্ড)
-- Seed Data: Exactly 25 Members (1 Admin + 4 Committee + 20 General)
-- All monthly_contribution set to 0 initially as specified in requirements.
-- ==============================================================================

-- 1. Insert/Upsert Admin (Md Samiul Islam)
INSERT INTO profiles (full_name, email, role, monthly_contribution, member_status)
VALUES 
('Md Samiul Islam', 'admin@sadqahfund.org', 'admin', 0.00, 'active')
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 2. Insert 4 Committee Members (Member Dashboard access, NO Admin permissions)
INSERT INTO profiles (full_name, email, role, monthly_contribution, member_status)
VALUES 
('Arkan Samim', 'arkan.samim@sadqahfund.org', 'committee', 0.00, 'active'),
('Md Abdur Razzak', 'abdur.razzak@sadqahfund.org', 'committee', 0.00, 'active'),
('Riaz Razu', 'riaz.razu@sadqahfund.org', 'committee', 0.00, 'active'),
('Azijul Asif', 'azijul.asif@sadqahfund.org', 'committee', 0.00, 'active')
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 3. Insert 20 General Members
INSERT INTO profiles (full_name, email, role, monthly_contribution, member_status)
VALUES 
('Abu Sayed', 'abu.sayed@sadqahfund.org', 'member', 0.00, 'active'),
('Md.Monjurul Islam', 'monjurul.islam@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Saju Islam', 'saju.islam@sadqahfund.org', 'member', 0.00, 'active'),
('Shintaj Jaman Shin', 'shintaj.jaman@sadqahfund.org', 'member', 0.00, 'active'),
('Rifat Khandaker', 'rifat.khandaker@sadqahfund.org', 'member', 0.00, 'active'),
('Md.Rokon Mia', 'rokon.mia@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Rabby Islam', 'rabby.islam@sadqahfund.org', 'member', 0.00, 'active'),
('Md.Tanvir Zaman Ratul', 'tanvir.ratul@sadqahfund.org', 'member', 0.00, 'active'),
('MD ABDUR ROSHID', 'abdur.roshid@sadqahfund.org', 'member', 0.00, 'active'),
('MD. Rakibuzzaman', 'rakibuzzaman@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Mostafizer (Mithu)', 'mostafizer.mithu@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Hamidul Islam', 'hamidul.islam@sadqahfund.org', 'member', 0.00, 'active'),
('সুমি হাসান', 'sumi.hasan@sadqahfund.org', 'member', 0.00, 'active'),
('MD Shakib Khandoker', 'shakib.khandoker@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Motiur Rahman', 'motiur.rahman@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Arif khan', 'arif.khan@sadqahfund.org', 'member', 0.00, 'active'),
('Md. Mehedi hasan', 'mehedi.hasan@sadqahfund.org', 'member', 0.00, 'active'),
('মো জাকির হোসেন জামিল', 'zakir.jamil@sadqahfund.org', 'member', 0.00, 'active'),
('মোঃ রাসেল মিয়া', 'rasel.mia@sadqahfund.org', 'member', 0.00, 'active'),
('Abdul Auwal', 'abdul.auwal@sadqahfund.org', 'member', 0.00, 'active')
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
