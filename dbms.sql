-- Active: 1711808273609@@127.0.0.1@3306@blinkit

CREATE DATABASE Blinkit;


CREATE TABLE admin
(
	admin_id INT PRIMARY KEY NOT NULL,
    passsword varchar(50)
);
INSERT INTO admin (admin_id, passsword)
VALUES (1, '123');
show DATABASES;
CREATE TABLE IF NOT EXISTS customer (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
	flat_no VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    address VARCHAR(255) AS (CONCAT(flat_no, ', ', city, ', ', state, ' ', zip_code))
);

CREATE TABLE Review
(	review_id INT AUTO_INCREMENT PRIMARY KEY,
	comments VARCHAR(200),
    rating INT,
    user_id INT,
    CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5),
    FOREIGN KEY (user_id) references customer(user_id),
	_date DATE NOT NULL
	
);

CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    stock INT,
    product_name VARCHAR(255),
    review_id INT,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    price DOUBLE,
    FOREIGN KEY (review_id) REFERENCES Review(review_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);



CREATE TABLE IF NOT EXISTS  orders (
    order_id INT auto_increment PRIMARY KEY,
    user_id INT,
    status ENUM('cart', 'on the way', 'delivered'),
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES customer(user_id)
   
);

CREATE TABLE IF NOT EXISTS PLACES(
	order_id INT ,
    quantity INT NOT NULL,
    product_id INT NOT NULL,
    foreign key(product_id) references Products(product_id),
    foreign key(order_id) references orders(order_id)
    
);



CREATE TABLE IF NOT EXISTS  payment (
    transaction_id INT auto_increment PRIMARY KEY,
    user_id INT NOT NULL,
    payment_method ENUM('cash', 'online'),
    order_id INT,
    date_of_payment datetime NOT null,
    total_amount INT,
    FOREIGN KEY (user_id) REFERENCES customer(user_id),
    foreign key(order_id) references orders(order_id)
);

CREATE TABLE IF NOT EXISTS delivery_worker (
    delivery_partner_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) AS (CONCAT(first_name, ' ', last_name)) STORED,
    address VARCHAR(255) NOT NULL,
    phone_no VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS  delivery (
    delivery_id INT PRIMARY KEY,
    user_id INT,
    duration INT,
    order_id INT NOT NULL,
    delivery_partner_id INT,
    FOREIGN KEY (user_id) REFERENCES customer(user_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_worker(delivery_partner_id)
);

-- Populating data for customer table
INSERT INTO customer (phone_number, password, first_name, last_name, flat_no, city, state, zip_code)
VALUES 
('12345678901', 'password1', 'John', 'Doe', 'Apt 101', 'New York', 'NY', '10001'),
('9876543210', 'password2', 'Jane', 'Smith', 'Apt 202', 'Los Angeles', 'CA', '90001'),
('1112223333', 'password3', 'Michael', 'Johnson', 'Apt 303', 'Chicago', 'IL', '60601'),
('4445556666', 'password4', 'Emily', 'Williams', 'Apt 404', 'Houston', 'TX', '77001'),
('7778889999', 'password5', 'David', 'Brown', 'Apt 505', 'Miami', 'FL', '33101'),
('9998887777', 'password6', 'Sarah', 'Jones', 'Apt 606', 'Seattle', 'WA', '98101'),
('3332221111', 'password7', 'Matthew', 'Martinez', 'Apt 707', 'Boston', 'MA', '02101'),
('6665554444', 'password8', 'Jessica', 'Garcia', 'Apt 808', 'San Francisco', 'CA', '94101'),
('2223334444', 'password9', 'Daniel', 'Hernandez', 'Apt 909', 'Dallas', 'TX', '75201'),
('5554443333', 'password10', 'Lauren', 'Lopez', 'Apt 1010', 'Philadelphia', 'PA', '19101');

-- Populating data for Review table
INSERT INTO Review (review_id, comments, rating, user_id, _date)
VALUES 
(4, 'Great product!', 5, 1, '2024-02-12'),
(5, 'Fast delivery, good service.', 4, 2, '2024-02-11'),
(6, 'Average product quality.', 3, 3, '2024-02-10'),
(7, 'Product didn\'t match description.', 2, 4, '2024-02-09'),
(8, 'Excellent customer support.', 5, 5, '2024-02-08'),
(9, 'Highly recommended!', 5, 6, '2024-02-07'),
(10, 'Item arrived damaged.', 1, 7, '2024-02-06'),
(11, 'Good value for money.', 4, 8, '2024-02-05'),
(12, 'Could be better.', 3, 9, '2024-02-04'),
(13, 'Very satisfied with my purchase.', 5, 10, '2024-02-03');

-- Populating data for Products table
INSERT INTO Products (stock, product_name, review_id, category, subcategory, description, price) 
VALUES 
(15, 'Laptop', 4, 'Electronics', 'Computers', 'High-performance laptop', 1000),
(25, 'Banana', 5, 'Fresh-Goods', 'Fruits', 'Fresh and ripe bananas', 1),
(10, 'Shampoo', 6, 'FMCG', 'Personal care', 'Nourishing shampoo', 5),
(30, 'LED TV', 7, 'Electronics', 'Television', 'Smart LED TV with HD display', 700),
(50, 'Tomato', 8, 'Fresh-Goods', 'Vegetables', 'Organic tomatoes', 0.5),
(20, 'Toilet Paper', 9, 'FMCG', 'Cleaning supplies', 'Soft and absorbent toilet paper', 2),
(5, 'Headphones', 10, 'Electronics', 'Audio', 'Wireless headphones with noise cancellation', 50),
(40, 'Milk', 11, 'Fresh-Goods', 'Dairy', 'Fresh milk from local farms', 1.5),
(8, 'Toothbrush', 12, 'FMCG', 'Personal care', 'Soft-bristled toothbrush', 3),
(12, 'Rice Cooker', 13, 'Electronics', 'Kitchen Appliances', 'Multi-functional rice cooker', 80);





-- Populating data for delivery_worker table
INSERT INTO delivery_worker (first_name, last_name, address, phone_no)
VALUES 
('John', 'Doe', '123 Main St, New York, NY 10001', '123-456-7890'),
('Jane', 'Smith', '456 Elm St, Los Angeles, CA 90001', '987-654-3210'),
('Michael', 'Johnson', '789 Oak St, Chicago, IL 60601', '111-222-3333'),
('Emily', 'Williams', '101 Pine St, Houston, TX 77001', '444-555-6666'),
('David', 'Brown', '202 Maple St, Miami, FL 33101', '777-888-9999'),
('Sarah', 'Jones', '303 Cedar St, Seattle, WA 98101', '999-888-7777'),
('Matthew', 'Martinez', '404 Birch St, Boston, MA 02101', '333-222-1111'),
('Jessica', 'Garcia', '505 Walnut St, San Francisco, CA 94101', '666-555-4444'),
('Daniel', 'Hernandez', '606 Spruce St, Dallas, TX 75201', '222-333-4444'),
('Lauren', 'Lopez', '707 Cherry St, Philadelphia, PA 19101', '555-444-3333');

-- Populating data for delivery table
INSERT INTO delivery (delivery_id, user_id, duration, order_id, delivery_partner_id)
VALUES 
(1, 1, 3, 1, 1),
(2, 2, 4, 2, 2),
(3, 3, 2, 3, 3),
(4, 4, 5, 4, 4),
(5, 5, 3, 5, 5),
(6, 6, 4, 6, 6),
(7, 7, 2, 7, 7),
(8, 8, 5, 8, 8),
(9, 9, 3, 9, 10),
(10, 10, 4, 10, 10);

-- queries
-- av value of order of each customer
SELECT c.user_id, AVG(p.total_amount) AS average_order_value
FROM customer c
LEFT JOIN payment p ON c.user_id = p.user_id
GROUP BY c.user_id;

-- total revenue of store in march 2024
SELECT SUM(total_amount) AS total_revenue
FROM payment
WHERE DATE_FORMAT(date_of_payment, '%Y-%m') = '2024-03';


-- workers that have done atleast one delievry
SELECT DISTINCT dw.*
FROM delivery d
JOIN delivery_worker dw ON d.delivery_partner_id = dw.delivery_partner_id;


-- 5 highest rated product
SELECT p.product_id, p.product_name, AVG(r.rating) AS average_rating
FROM Products p
JOIN Review r ON p.review_id = r.review_id
GROUP BY p.product_id, p.product_name
ORDER BY AVG(r.rating) DESC
LIMIT 5;


-- out of stock items
SELECT product_id, product_name
FROM Products
WHERE stock <= 0;

-- total registered customers
SELECT COUNT(*) AS total_customers
FROM customer;

-- name of cutomer with highest payment
 SELECT c.name AS customer_name
FROM customer c
JOIN payment p ON c.user_id = p.user_id
WHERE p.total_amount = (
    SELECT MAX(total_amount)
    FROM payment
);


-- phone no of delivery worker of order-id 2
SELECT dw.phone_no
FROM delivery d
JOIN delivery_worker dw ON d.delivery_partner_id = dw.delivery_partner_id
WHERE d.order_id = 2;

-- no of customers with no orders
SELECT COUNT(c.user_id) AS customers_with_no_orders
FROM customer c
LEFT JOIN orders o ON c.user_id = o.user_id
WHERE o.order_id IS NULL;

-- most ordered item
 
SELECT
    product_id,
    SUM(quantity) AS total_ordered
FROM
    (
        SELECT
            o.order_id,
            p.product_id,
            pl.quantity
        FROM
            orders o
            JOIN PLACES pl ON o.places_id = pl.places_id
            JOIN Products p ON pl.product_id = p.product_id
    ) AS order_details
GROUP BY
    product_id
ORDER BY
    total_ordered DESC
LIMIT 1;

-- Products that received a rating below 3 more than 5 times
ALTER TABLE Products DROP FOREIGN KEY products_ibfk_1;

ALTER TABLE Products DROP COLUMN review_id;

ALTER TABLE Review ADD COLUMN product_id INT;

ALTER TABLE Review
ADD CONSTRAINT fk_product_id
FOREIGN KEY (product_id)
REFERENCES Products(product_id);

INSERT INTO Products (stock, product_name, category, subcategory, description, price) 
VALUES 
(15, 'Laptop', 'Electronics', 'Computers', 'High-performance laptop', 1000),
(25, 'Banana', 'Fresh-Goods', 'Fruits', 'Fresh and ripe bananas', 1),
(10, 'Shampoo', 'FMCG', 'Personal care', 'Nourishing shampoo', 5),
(30, 'LED TV', 'Electronics', 'Television', 'Smart LED TV with HD display', 700),
(50, 'Tomato', 'Fresh-Goods', 'Vegetables', 'Organic tomatoes', 0.5),
(20, 'Toilet Paper', 'FMCG', 'Cleaning supplies', 'Soft and absorbent toilet paper', 2),
(5, 'Headphones', 'Electronics', 'Audio', 'Wireless headphones with noise cancellation', 50),
(40, 'Milk', 'Fresh-Goods', 'Dairy', 'Fresh milk from local farms', 1.5),
(8, 'Toothbrush', 'FMCG', 'Personal care', 'Soft-bristled toothbrush', 3),
(12, 'Rice Cooker', 'Electronics', 'Kitchen Appliances', 'Multi-functional rice cooker', 80);

SELECT user_id FROM customer;


INSERT INTO Review (comments, rating, user_id, _date, product_id)
VALUES 
('Poor performance', 2, 1, '2024-02-17', 1),
('Very slow', 1, 2, '2024-02-18', 1),
('Disappointing battery', 2, 3, '2024-02-19', 1),
('Screen issues', 1, 4, '2024-02-20', 1),
('Not user-friendly', 2, 5, '2024-02-21', 1),
('Overheats', 1, 6, '2024-02-22', 1);



-- Trigger : Update stock level after placing an order
DELIMITER $$

CREATE TRIGGER check_inventory_before_update
BEFORE UPDATE ON Products
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock cannot be less than zero.';
    END IF;
END$$

DELIMITER ;

-- Create trigger to prevent ordering out-of-stock items
DELIMITER //

CREATE TRIGGER before_places_insert
BEFORE INSERT ON PLACES
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    -- Get the current stock of the product being ordered
    SELECT stock INTO current_stock
    FROM Products
    WHERE product_id = NEW.product_id;
    
    -- Check if the ordered quantity exceeds the current stock
    IF NEW.quantity > current_stock THEN
        -- Raise an error and prevent the insertion
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'tries to ordermore than available stock';
    END IF;
END//

DELIMITER ;

-- -----------------
DELIMITER //

CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message_text VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES customer(user_id)
);

DELIMITER $$

CREATE TRIGGER after_customer_creation
AFTER INSERT ON customer
FOR EACH ROW
BEGIN
    INSERT INTO messages (user_id, message_text)
    VALUES (NEW.user_id, CONCAT('Welcome ', NEW.first_name, ' ', NEW.last_name, '! Thank you for creating an account with us.'));
END$$

DELIMITER ;


-- ---
-- Create a trigger to prevent negative quantity in PLACES table
DELIMITER //

CREATE TRIGGER before_places_insert_update
BEFORE INSERT  ON PLACES
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Quantity cannot be negative';
    END IF;
END //

DELIMITER ;

-- --
-- Create a trigger to allow negative total_amount in payment table
DELIMITER //

CREATE TRIGGER before_payment_insert_update
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.total_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Total amount cannot be negative';
    END IF;
END //

DELIMITER ;

insert into places(order_id,quantity,product_id) values
(2,-4,4);
