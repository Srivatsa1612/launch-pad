-- Seed hardware options if not present
USE flowCUSTODIAN;
GO

-- Ensure default hardware options are seeded
IF NOT EXISTS (SELECT 1 FROM hardware_options WHERE option_type = 'device')
BEGIN
    INSERT INTO hardware_options (option_id, option_type, name, description, estimated_value)
    VALUES
        ('standard-device', 'device', 'Standard', 'Pre-configured business laptops', 0),
        ('custom-device', 'device', 'Custom', 'Specify custom hardware requirements', 0),
        ('none-device', 'device', 'None', 'Employees use their own devices', 0);
    
    PRINT '✓ Seeded device options';
END

IF NOT EXISTS (SELECT 1 FROM hardware_options WHERE option_type = 'gift')
BEGIN
    INSERT INTO hardware_options (option_id, option_type, name, description, estimated_value)
    VALUES
        ('premium-gift', 'gift', 'Premium', 'Branded merchandise bundle + tech accessories', 150),
        ('standard-gift', 'gift', 'Standard', 'Branded welcome kit', 75),
        ('minimal-gift', 'gift', 'Minimal', 'Welcome card only', 0),
        ('none-gift', 'gift', 'None', 'No welcome gift', 0);
    
    PRINT '✓ Seeded gift options';
END

-- Verify
SELECT COUNT(*) as total_options, 
       SUM(CASE WHEN option_type = 'device' THEN 1 ELSE 0 END) as devices,
       SUM(CASE WHEN option_type = 'gift' THEN 1 ELSE 0 END) as gifts
FROM hardware_options;

PRINT 'Hardware options seeded successfully!';
GO
