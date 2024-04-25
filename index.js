const mysql = require('mysql2');
// print hello word


// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'aditya',
  password: '12345678',
  database: 'blinkit',
  connectionLimit: 10 // Set the maximum number of connections
});
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function questionAsync(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}
// Promisify rl.question


// Promisify pool.query for async/await support


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


async function addCustomer() {
    try {
        const phone_number = await questionAsync('Enter phone number: ');
        const password = await questionAsync('Enter password: ');
        const first_name = await questionAsync('Enter first name: ');
        const last_name = await questionAsync('Enter last name: ');
        const flat_no = await questionAsync('Enter flat number: ');
        const city = await questionAsync('Enter city: ');
        const state = await questionAsync('Enter state: ');
        const zip_code = await questionAsync('Enter zip code: ');

        const sql = `INSERT INTO customer (phone_number, password, first_name, last_name, flat_no, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [phone_number, password, first_name, last_name, flat_no, city, state, zip_code];
        await pool.query(sql, values);

        console.log("Customer added successfully!");
    } catch (error) {
        console.error("Error adding customer:", error);
    }
}


// Function to view product categories
async function viewProductCategories() {
  try {
    const [result, fields] = await pool.promise().query(
      'SELECT Distinct category from Products'
    );

    console.log('Product Categories:');
    result.forEach((row) => {
      console.log(row.category);
    }); 
    const choice = await questionAsync('enter the category to view those category else press 0 .');
    if(choice==='0'){
     return;
     }
    else{
     const [result1, fields1] = await pool.promise().query(
        'SELECT * from Products where category = ?',
         [choice]
      );
       console.log('Products in this category:');
      result1.forEach((row) => {
        console.log(row.product_id,row.product_name, row.price);
      });
      
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } 
}
  
  async function viewProducts(cy) {
    try {
      const [result, fields] = await pool.promise().query(
        'SELECT * FROM Products'
      );
  
      console.log('Products:');
      result.forEach((row) => {
        console.log(row.product_id, row.product_name, row.price);
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  async function addProductToCart(customer_id) {
    // get the order id of the cart
    const response = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT order_id FROM orders WHERE user_id = ? AND status = ?',
        [customer_id, 'cart'],
        (error, result, fields) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    } );
    
    // if cart is not present then create a cart
    
    if (response.length === 0) {
      console.log("Empty cart ")
      const response1 = await new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO orders (user_id, status,total_amount) VALUES (?, ?,0)',
          [customer_id, 'cart'],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
        
      });
  
      
      // set the order id
      const response2 = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT order_id FROM orders WHERE user_id = ? AND status = ?',
          [customer_id, 'cart'],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
      order_id = response2[0].order_id;
    }
    else{
      order_id = response[0].order_id;
    }
   
    while(true){
      const ch1 = await questionAsync('Press 1 to add product to cart, 0 to exit: ');
      if(ch1 === '0'){
        break;
      }
      const product_id = await questionAsync('Enter the product ID: ');
      const quantity = await questionAsync('Enter the quantity: ');
      // check if the product is in stock
      const response3 = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT stock FROM Products WHERE product_id = ?',
          [product_id],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
      if(response3[0].stock < quantity){
        console.log('Insufficient stock.');
        break;
      }
      
      
        // insert the product into places table
        const response5 = await new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO places (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [order_id, product_id, quantity],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
      // update the total amount in orders table
      const response4 = await new Promise((resolve, reject) => {
        pool.query(
          'UPDATE orders SET total_amount = total_amount + (SELECT price FROM Products WHERE product_id = ?) * ? WHERE order_id = ?',
          [product_id, quantity, order_id],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
  
      // update the stock of the product
      const response6 = await new Promise((resolve, reject) => {
        pool.query(
          'UPDATE Products SET stock = stock - ? WHERE product_id = ?',
          [quantity, product_id],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
  
    }
  }
  
  
  
  async function viewCart(customer_id) {
    try {
      const response = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM orders WHERE user_id = ? AND status = ?',
          [customer_id, 'cart'],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
  
      if (response.length > 0) {
        console.log('Your cart:');
        console.table(response);
  
        const order_id = response[0].order_id;
  
        const response1 = await new Promise((resolve, reject) => {
          pool.query(
            'SELECT * FROM places WHERE order_id = ?',
            [order_id],
            (error, result, fields) => {
              if (error) {
                reject(error);
              }
              resolve(result);
            }
          );
        });
  
        console.log('Items in your cart:', response1);
        while(true){
        const ch1 = await questionAsync('Press 1 to remove a product from the cart, 0 to exit: ');
        if(ch1 === '0'){
          break;
        }
  
        if (ch1 === '1') {
          const product_id = await questionAsync('Enter the product ID to remove: ');
          // check if the product is in the cart
          const response2 = await new Promise((resolve, reject) => {
            pool.query(
              'SELECT * FROM places WHERE order_id = ? AND product_id = ?',
              [order_id, product_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
          if(response2.length === 0){
            console.log('Product not found in the cart.');
            break;
            
          }
  
          // Remove product from places table
          await new Promise((resolve, reject) => {
            pool.query(
              'DELETE FROM places WHERE order_id = ? AND product_id = ?',
              [order_id, product_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
  
          // Update product stock
          await new Promise((resolve, reject) => {
            pool.query(
              'UPDATE Products SET stock = stock + (SELECT quantity FROM places WHERE order_id = ? AND product_id = ?) WHERE product_id = ?',
              [order_id, product_id, product_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
  
          // Update total amount in orders
          const price= await new Promise((resolve, reject) => {
            pool.query(
              'SELECT price FROM Products WHERE product_id = ?',
              [product_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          }
          );
          await new Promise((resolve, reject) => {
            pool.query(
              'UPDATE orders SET total_amount = total_amount - (SELECT quantity *?  FROM places WHERE order_id = ? AND product_id = ?) WHERE order_id = ?',
              [price[0].price, order_id, product_id, order_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
          // if no product id is found for that order in places table invalid 
          
  
          console.log('Product removed from cart.');
        }
        }
      } else {
        console.log('Your cart is empty.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  async function orderCart(customer_id) {
    try {
      const response = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM orders WHERE user_id = ? AND status = ?',
          [customer_id, 'cart'],
          (error, result, fields) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );
      });
  
      if (response.length > 0) {
        console.log('Your cart:');
        console.table(response);
  
        const order_id = response[0].order_id;
  
        const response1 = await new Promise((resolve, reject) => {
          pool.query(
            'SELECT * FROM places WHERE order_id = ?',
            [order_id],
            (error, result, fields) => {
              if (error) {
                reject(error);
              }
              resolve(result);
            }
          );
        });
  
        console.log('Items in your cart:', response1);
  
        const ch1 = await questionAsync('Press 1 to order the cart, 0 to exit: ');
  
        if (ch1 === '1') {
          // Update order status
          await new Promise((resolve, reject) => {
            pool.query(
              'UPDATE orders SET status = ? WHERE order_id = ?',
              ['delivered', order_id],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
          // update the payment talble
          await updatePaymentTable(customer_id,order_id,response[0].total_amount);
  
          console.log('Cart ordered successfully.');
        }
      } else {
        console.log('Your cart is empty.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  async function updatePaymentTable(user_id,order_id,totalamt)
  {
    const payment_method = await questionAsync("Enter the payment method: ");
    const date_of_payment = new Date();
    const response = await new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO payment (user_id, payment_method, order_id, date_of_payment, total_amount) VALUES (?, ?, ?, ?, ?)',
        [user_id, payment_method, order_id, date_of_payment, totalamt],
        (error, result, fields) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  }


  
  async function customerorder(user_id) {
    try {
      const productsINorder = new Map();
      let totalamt = 0;
  
  
      while (true) {
        const choice = await questionAsync("Press 1 to add more products, 0 to discard order, or 2 to finalize order:");
  
        if (choice === "0") {
          // Discard the order
          // increment the stock of the products in the order
          for (let i = 0; i < productsINorder.length; i++) {
            let [productid, quantity] = productsINorder[i];
            let [result, fields] = await pool.promise().query(
              'SELECT stock FROM Products WHERE product_id = ?', [productid]
            );
            let stock = result[0].stock;
            stock += quantity;
            await pool.promise().query(
              'UPDATE Products SET stock = ? WHERE product_id = ?',
              [stock, productid]
            );
          }
          console.log("Order discarded.");
          break;
        } else if (choice === "2") {
          console.log("Finalizing order...");
          // check if quantity is available or not
          for(let [key,value] of productsINorder){
            let [result, fields] = await pool.promise().query(
              'SELECT stock FROM Products WHERE product_id = ?', [key]
            );
            let stock = result[0].stock;
            if (stock < value) {
              console.log(`Insufficient stock for product ${key}. Order not placed.`);
              return;
            }
          }
          // Insert order details into 'orders' table
          const res1 = await new Promise((resolve, reject) => {
            pool.query(
              'INSERT INTO orders (user_id, status, total_amount) VALUES (?, ?, ?)',
              [user_id, 'delivered', totalamt],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
          console.log('Retrieving next order ID...');
          let [result, fields] = await pool.promise().query(
            'SELECT MAX(order_id) AS max_order_id FROM orders where user_id = ?', [user_id]
          );
          let  maxOrderId = result[0].max_order_id;
          let  nextorderid = maxOrderId;
         // console.log('Next order ID:', nextorderid);
  
          // Insert products into 'places' table
          for(let [key,value] of productsINorder){
            let [result, fields] = await pool.promise().query(
              'INSERT INTO places (order_id, product_id, quantity) VALUES (?, ?, ?)',
              [nextorderid, key, value]
            );
          }
          
          // update the payment talble 
          await updatePaymentTable(user_id,nextorderid,totalamt);
  
          console.log("Order placed successfully. and paid ",totalamt);
          break;
        } else if (choice === "1") {
          const productid = await questionAsync("Enter the product_id: ");
          const qnt = await questionAsync("Enter the quantity: ");
  
          // Retrieve product details from 'Products' table
          const response = await new Promise((resolve, reject) => {
            pool.query(
              'SELECT stock, price FROM Products WHERE product_id = ?',
              [productid],
              (error, result, fields) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            );
          });
  
          if (response.length > 0) {
            const { stock, price } = response[0];
            if (stock - qnt >= 0) {
              productsINorder[productid] = qnt;
              totalamt += qnt * price;
              console.log(`Added ${qnt} units of product ${productid} to the order.`);
              // decrease  the stock of the product
             let [result, fields] = await pool.promise().query(
            'UPDATE Products SET stock = stock - ? WHERE product_id = ?',
            [qnt, productid]
          );
            } else {
              console.log("Insufficient stock for this product.");
            }
          } else {
            console.log('Invalid product ID. Please try again.');
          }
          
  
  
        } else {
          console.log('Invalid choice. Please try again.');
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  
let isCustomerLoggedIn = false;
async function customermenu(customer_id) {
  while (true) {
    const choice = await questionAsync(
      '\npress 1 to view product categories' +
      '\npress 2 to view products' +
      '\npress 3 to view cart' +
      '\npress 4 to add product to cart' +
      '\npress 5 to order cart' +
      '\npress 6 to order' +
      '\npress 7 to view past orders' + 
      '\npress 8 to review a product' +
      '\npress 9 to view feedback' +
      '\npress 0 to get back '
    );

    if (choice === '0') {
      break;
    } else if (choice === '1') {
     await viewProductCategories();
    } else if (choice === '2') {
     await viewProducts();
    } else if (choice === '3') {
     await viewCart(customer_id);
    } else if (choice === '4') {
      await addProductToCart(customer_id);
    } else if (choice === '5') {
      await orderCart(customer_id);
    } else if (choice === '6') {
      await customerorder(customer_id);
    } else if (choice =='7') {
      await viewPastOrders(customer_id);
      
    } else if(choice === '8') {
      const product_id = await questionAsync('Enter the product ID to review: ');
      await reviewProduct(customer_id, product_id);
     
    } 
    else if(choice === '9') {
      await viewProductFeedback();
    }
    else {
      console.log("Enter a valid choice");
    }
  }
}
// //review
// Columns:
// review_id int AI PK 
// comments varchar(200) 
// rating int 
// user_id int 
// _date date 
// product_id int
async function viewProductFeedback() {
  const prod_id = await questionAsync('Enter the product ID: ');
  const response = await new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM review WHERE product_id = ?',
      [prod_id],
      (error, result, fields) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      }
    );
  });
  console.log('Reviews:');
  console.table(response);

}

async function reviewProduct(customer_id) {
  const product_id = await questionAsync('Enter the product ID: ');
  const comments = await questionAsync('Enter your comments: ');
  const rating = await questionAsync('Enter your rating: ');
  date = new Date();
  const response = await new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO review (comments, rating, user_id, _date, product_id) VALUES (?, ?, ?, ?, ?)',
      [comments, rating, customer_id, date, product_id],
      (error, result, fields) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      }
    );
  });
  console.log('Review added successfully!');

}

async function viewPastOrders(user_id) {
  try {
      await pool.beginTransaction();

      const ordersSql = 'SELECT order_id, status, total_amount FROM orders WHERE user_id = ?';
      const [orders] = await pool.query(ordersSql, [user_id]);

      if (orders.length === 0) {
          console.log("No past orders found.");
          await pool.commit(); 
          return;
      }

      console.log("Past Orders:");
      for (const order of orders) {
          console.log('Order ID: ${order.order_id}, Status: ${order.status}, Total Amount: ${order.total_amount}');

          const placesSql = `
              SELECT p.product_name, pl.quantity
              FROM PLACES pl
              JOIN Products p ON p.product_id = pl.product_id
              WHERE pl.order_id = ?`;

          const [orderItems] = await pool.query(placesSql, [order.order_id]);
          if (orderItems.length > 0) {
              console.log('Products in this order:');
              orderItems.forEach(item => {
                  console.log(' ${item.product_name}, Quantity: ${item.quantity}');
              });
          } else {
              console.log('- No products details found for this order.');
          }
      }

      await pool.commit(); 
  } catch (error) {
      await pool.rollback();
      console.error("Error retrieving past orders and their products:", error);
  }
}
async function verifyCustomerLogin() {
  try {
    const user_id = await questionAsync('Enter phone_no: ');
    const password = await questionAsync('Enter password: ');

    const response = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT user_id FROM customer WHERE phone_number = ? AND password = ?',
        [user_id, password],
        (error, result, fields) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });

    console.table(response);

    if (response.length > 0) {
      console.log('Login successful! Your ID is: ', response[0].user_id);
      isCustomerLoggedIn = true;

      await customermenu(response[0].user_id);

      // After returning from the customermenu, reset the flag
      isCustomerLoggedIn = false;

      return;
    } else {
      console.log('Invalid customer ID or password. Please try again.');
    }
  } catch (error) {
    console.error('Error verifying customer login:', error);
  }
}

async function customerloginmenu() {
  while (true) {
    const choice = await questionAsync(
      '\nPress 0 to exit' +
      '\nPress 1 to login' +
      '\nPress 2 to register' +
      '\nEnter your choice: '
    );

    if (choice === '0') {
      break;
    } else if (choice === '1') {
      await verifyCustomerLogin();

      if (isCustomerLoggedIn) {
        break;
      }
    } else if (choice === '2') {
      await addCustomer();
    } else {
      console.log("\nInvalid input");
      console.log("Please enter a valid choice");
    }
  }
}


async function enterstore() {
    while (true) {
      const choice = await questionAsync("Press 1 to login as customer, 0 to exit: ");
      if(choice === '0'){
        break;
      }
      else if(choice === '1'){
        await customerloginmenu();
      }
      else{
        console.log('Enter a valid choice');
      }
    }
}


enterstore();
