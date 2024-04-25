const { createPool } = require('mysql');
const readline = require('readline');
const { promisify } = require('util');

const pool = createPool({
    host: 'localhost',
    port:3306,
    user: 'aditya',
    password: "12345678",
    database: "blinkit",
    connectionLimit: 10
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify rl.question
const questionAsync = promisify(rl.question).bind(rl);


// Promisify pool.query for async/await support
const query = promisify(pool.query).bind(pool);

// Function to begin a transaction
async function startTransaction() {
    await query('START TRANSACTION');
}

// Function to commit a transaction
async function commitTransaction() {
    await query('COMMIT');
}

// Function to rollback a transaction
async function rollbackTransaction() {
    await query('ROLLBACK');
}
async function adminmenu() {
    while (true) {
        const choice = await questionAsync(
            '\nAdmin Menu:' +
            '\nPress 0 to Exit' +
            '\nPress 1 to Assign delivery' +
            '\nPress 2 to view customerAnalysis' +
            '\nPress 3 to Manage Products' +
            '\nPress 4 to View Sales Reports' +
            '\nPress 5 to View Feedback ' +
    
            '\nEnter your choice: '
        );

        switch (choice) {
            case '0':
                console.log("Exiting Admin Menu...");
                return;
            case '1':
                await assignDelivery();
                break;
            case '2':
                await customerAnalysis();
                break;
            case '3':
                await manageProducts();
                break;
            case '4':
                await viewSalesReports();
                break;
            case '5':
                await viewFeedback();
                break;
            
            default:
                console.log("\nInvalid input");
                console.log("Please enter a valid choice");
        }
    }
}



async function assignDelivery() {
    const delivery_partner_id = await questionAsync('Enter the delivery partner ID: ');
    const order_id = await questionAsync('Enter the order ID: ');
    const duration = await questionAsync('Enter the duration: ');

    const response = await new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO delivery (delivery_partner_id, order_id, duration) VALUES (?, ?, ?)',
            [delivery_partner_id, order_id, duration],
            (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }
        );
    });

    console.log('Delivery assigned successfully');
}


async function customerAnalysis() {
        // total no of customers
        const response1 = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT COUNT(*) FROM customer',
                (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                }
            );
        });
        console.log('Total number of customers: ', response1[0]['COUNT(*)']);
        // total no of customers who have placed orders
        const response2 = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT COUNT(DISTINCT user_id) FROM orders',
                (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                }
            );
        });
        console.log('Total number of customers who have placed orders: ', response2[0]['COUNT(DISTINCT user_id)']);
        // av cost of an order
        const response3 = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT AVG(total_amount) FROM orders',
                (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                }
            );
        });
        console.log('Average cost of an order: ', response3[0]['AVG(total_amount)']);

}
// Function to manage products
async function manageProducts() {
    while (true) {
        const choice = await questionAsync(
            '\nProduct Management:' +
            '\nPress 0 to Exit' +
            '\nPress 1 to Add Product' +
            '\nPress 2 to Update Product' +
            '\nPress 3 to Delete Product' +
            '\nEnter your choice: '
        );

        switch (choice) {
            case '0':
                console.log("Exiting Product Management...");
                return;
            case '1':
                await addProduct();
                break;
            case '2':
                await updateProduct();
                break;
            case '3':
                await deleteProduct();
                break;
            default:
                console.log("\nInvalid input");
                console.log("Please enter a valid choice");
        }
    }
}

// Function to add a new product
async function addProduct() {
    try {
        await startTransaction();

        const productName = await questionAsync("Enter product name: ");
        const stock = parseInt(await questionAsync("Enter stock quantity: "));
        const category = await questionAsync("Enter category: ");
        const subcategory = await questionAsync("Enter subcategory: ");
        const description = await questionAsync("Enter description: ");
        const price = parseFloat(await questionAsync("Enter price: "));

        // Insert product details into the database within the transaction
        const insertQuery = `
            INSERT INTO Products (product_name, stock, category, subcategory, description, price)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await query(insertQuery, [productName, stock, category, subcategory, description, price]);

        await commitTransaction();
        console.log("Product added successfully.");
    } catch (error) {
        await rollbackTransaction();
        console.error("Error adding product:", error);
    }
}

// Function to update an existing product
async function updateProduct() {
    try {
        await startTransaction();

        const productId = parseInt(await questionAsync("Enter product ID to update: "));
        const newStock = parseInt(await questionAsync("Enter new stock quantity: "));
        const newPrice = parseFloat(await questionAsync("Enter new price: "));

        // Update product details in the database within the transaction
        const updateQuery = `
            UPDATE Products
            SET stock = ?, price = ?
            WHERE product_id = ?
        `;
        await query(updateQuery, [newStock, newPrice, productId]);

        await commitTransaction();
        console.log("Product updated successfully.");
    } catch (error) {
        await rollbackTransaction();
        console.error("Error updating product:", error);
    }
}

// Function to delete an existing product
async function deleteProduct() {
    try {
        await startTransaction();

        const productId = parseInt(await questionAsync("Enter product ID to delete: "));

        // Delete the product from the database within the transaction
        const deleteQuery = `
            DELETE FROM Products
            WHERE product_id = ?
        `;
        await query(deleteQuery, [productId]);

        await commitTransaction();
        console.log("Product deleted successfully.");
    } catch (error) {
        await rollbackTransaction();
        console.error("Error deleting product:", error);
    }
}



async function viewSalesReports() {
    // total sales
    const response1 = await new Promise((resolve, reject) =>
        pool.query(
            'SELECT SUM(total_amount) FROM payment',
            (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }
        )
    );
    console.log('Total sales: ', response1[0]['SUM(total_amount)']);
    // out of stock products
    const response2 = await new Promise((resolve, reject) =>
        pool.query(
            'SELECT product_name FROM Products WHERE stock = 0',
            (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }
        )
    );
    console.log('Out of stock products: ');
    response2.forEach((product) => {
        console.log(product['product_name']);
    });

    

}
// review_id int AI PK 
// comments varchar(200) 
// rating int 
// user_id int 
// _date date 
// product_id int 
// Related Tables:
// Target products (product_id → product_id) 
// On Update RESTRICT 
// On Delete RESTRICT 
// Target customer (user_id → user_id) 
// On Update RESTRICT 
// On Delete RESTRICT
async function viewFeedback() {
    // average rating
    const response1 = await new Promise((resolve, reject) =>
        pool.query(
            'SELECT AVG(rating) FROM review',
            (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }
        )
    );
    console.log('Average rating: ', response1[0]['AVG(rating)']);
    while(true){
        const choice = await questionAsync("Press 1 to view all feedbacks, 0 to exit: ");
        if(choice === '0'){
            break;
        }
        else if(choice === '1'){
            const response2 = await new Promise((resolve, reject) =>
                pool.query(
                    'SELECT * FROM review',
                    (error, result, fields) => {
                        if (error) {
                            reject(error);
                        }
                        resolve(result);
                    }
                )
            );
            console.log('All feedbacks: ');
            response2.forEach((feedback) => {
                console.log('Review ID: ', feedback['review_id']);
                console.log('Comments: ', feedback['comments']);
                console.log('Rating: ', feedback['rating']);
                console.log('User ID: ', feedback['user_id']);
                console.log('Date: ', feedback['_date']);
                console.log('Product ID: ', feedback['product_id']);
            });
        }
        else{
            console.log("Enter a valid choice");
        }
    }

}

adminmenu();
