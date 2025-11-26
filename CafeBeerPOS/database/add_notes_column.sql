-- Script để thêm cột Notes vào bảng OrderItems
-- Chạy script này để cập nhật database schema

USE CafeBeer;
GO

-- Kiểm tra xem cột Notes đã tồn tại chưa
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'OrderItems' 
    AND COLUMN_NAME = 'Notes'
)
BEGIN
    PRINT 'Adding Notes column to OrderItems table...'
    
    -- Thêm cột Notes
    ALTER TABLE OrderItems 
    ADD Notes NVARCHAR(500) NULL;
    
    PRINT 'Notes column added successfully!'
END
ELSE
BEGIN
    PRINT 'Notes column already exists in OrderItems table'
END
GO

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'OrderItems'
ORDER BY ORDINAL_POSITION;
GO

-- Test thêm một vài notes mẫu để kiểm tra
PRINT 'Testing Notes functionality...'

-- Cập nhật một vài order items có sẵn với notes
UPDATE TOP(3) OrderItems 
SET Notes = CASE 
    WHEN OrderItemID % 3 = 1 THEN N'Ít đường, không đá'
    WHEN OrderItemID % 3 = 2 THEN N'Thêm kem, nóng'
    ELSE N'Không cay, thêm rau'
END
WHERE Notes IS NULL;

-- Hiển thị kết quả test
SELECT TOP 5
    oi.OrderItemID,
    oi.OrderID,
    p.ProductName,
    oi.Quantity,
    oi.UnitPrice,
    oi.Notes
FROM OrderItems oi
JOIN Products p ON oi.ProductID = p.ProductID
WHERE oi.Notes IS NOT NULL
ORDER BY oi.OrderItemID;

PRINT 'Schema update completed successfully!'
GO
