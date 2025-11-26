-- Script kiểm tra và thêm các cột cần thiết cho Analytics
-- Đảm bảo database có đủ structure cho discount và payment analysis

USE CafeBeer;
GO

-- 1. Kiểm tra bảng Payments có cột DiscountPercentage chưa
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Payments' 
    AND COLUMN_NAME = 'DiscountPercentage'
)
BEGIN
    PRINT 'Adding DiscountPercentage column to Payments table...'
    
    ALTER TABLE Payments 
    ADD DiscountPercentage DECIMAL(5,2) DEFAULT 0;
    
    PRINT 'DiscountPercentage column added successfully!'
END
ELSE
BEGIN
    PRINT 'DiscountPercentage column already exists in Payments table'
END
GO

-- 2. Kiểm tra bảng Payments có cột PaymentType chưa
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Payments' 
    AND COLUMN_NAME = 'PaymentType'
)
BEGIN
    PRINT 'Adding PaymentType column to Payments table...'
    
    ALTER TABLE Payments 
    ADD PaymentType NVARCHAR(50) DEFAULT 'Cash';
    
    PRINT 'PaymentType column added successfully!'
END
ELSE
BEGIN
    PRINT 'PaymentType column already exists in Payments table'
END
GO

-- 3. Kiểm tra bảng Orders có CustomerPhone chưa (cho customer analysis)
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Orders' 
    AND COLUMN_NAME = 'CustomerPhone'
)
BEGIN
    PRINT 'Adding CustomerPhone column to Orders table...'
    
    ALTER TABLE Orders 
    ADD CustomerPhone NVARCHAR(20) NULL;
    
    PRINT 'CustomerPhone column added successfully!'
END
ELSE
BEGIN
    PRINT 'CustomerPhone column already exists in Orders table'
END
GO

-- 4. Thêm một số data mẫu cho testing (nếu tables trống)
DECLARE @OrderCount INT
SELECT @OrderCount = COUNT(*) FROM Orders WHERE Status = 'Paid'

IF @OrderCount < 5
BEGIN
    PRINT 'Adding sample data for analytics testing...'
    
    -- Thêm một vài payments mẫu với discount
    UPDATE TOP(2) Payments 
    SET DiscountPercentage = 10, 
        PaymentType = 'Card'
    WHERE DiscountPercentage = 0;
    
    UPDATE TOP(1) Payments 
    SET DiscountPercentage = 5, 
        PaymentType = 'Cash'
    WHERE DiscountPercentage = 0 AND PaymentType != 'Card';
    
    UPDATE TOP(1) Payments 
    SET PaymentType = 'E-Wallet'
    WHERE PaymentType = 'Cash';
    
    PRINT 'Sample analytics data added!'
END
GO

-- 5. Kiểm tra kết quả final
PRINT 'Final table structure check:'

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('Payments', 'Orders')
  AND COLUMN_NAME IN ('DiscountPercentage', 'PaymentType', 'CustomerPhone', 'Notes')
ORDER BY TABLE_NAME, COLUMN_NAME;
GO

-- 6. Test query để kiểm tra data
PRINT 'Testing analytics queries:'

SELECT 
    'Payment Methods' as TestType,
    PaymentType,
    COUNT(*) as Count,
    AVG(ISNULL(DiscountPercentage, 0)) as AvgDiscount
FROM Payments p
JOIN Orders o ON p.OrderID = o.OrderID
WHERE o.Status = 'Paid'
GROUP BY PaymentType;

SELECT 
    'Discount Analysis' as TestType,
    CASE 
        WHEN DiscountPercentage = 0 THEN 'No Discount'
        WHEN DiscountPercentage <= 5 THEN '1-5%'
        WHEN DiscountPercentage <= 10 THEN '6-10%'
        ELSE 'Over 10%'
    END as DiscountTier,
    COUNT(*) as OrderCount
FROM Payments p
JOIN Orders o ON p.OrderID = o.OrderID
WHERE o.Status = 'Paid'
GROUP BY 
    CASE 
        WHEN DiscountPercentage = 0 THEN 'No Discount'
        WHEN DiscountPercentage <= 5 THEN '1-5%'
        WHEN DiscountPercentage <= 10 THEN '6-10%'
        ELSE 'Over 10%'
    END;

PRINT 'Analytics setup completed successfully!'
GO
