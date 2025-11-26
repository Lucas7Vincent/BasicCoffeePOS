-- Script thêm cột Total_Amount vào bảng Orders
USE CafeBeer;
GO

-- Thêm cột Total_Amount
ALTER TABLE Orders
ADD Total_Amount DECIMAL(10,2) NOT NULL DEFAULT 0;
GO

-- Cập nhật giá trị Total_Amount cho các order hiện có
UPDATE Orders 
SET Total_Amount = (
    SELECT ISNULL(SUM(Quantity * UnitPrice), 0)
    FROM OrderItems 
    WHERE OrderItems.OrderID = Orders.OrderID
);
GO

-- Kiểm tra kết quả
SELECT 
    OrderID,
    TableID,
    UserID,
    OrderDate,
    Status,
    Total_Amount
FROM Orders;
GO
