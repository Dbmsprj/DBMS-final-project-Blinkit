const { createPool } = require('mysql');
const readline = require('readline');
const { promisify } = require('util');

const pool = createPool({
    host: "localhost",
    user: "root",
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

async function adminmenu() {
    // Implement admin menu functionality
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

async function verifycustomerlogin() {
    try {
        const customer_id = await questionAsync('Enter customer ID: ');
        const password = await questionAsync('Enter password: ');

        // Check if customer is currently blocked
        const blocked = await isCustomerBlocked(customer_id);
        if (blocked) {
            console.log("You are currently blocked. Please try again later.");
            return;
        }

        // Check customer login credentials
        const sql = `SELECT * FROM customer WHERE customer_id = ? AND password = ?`;
        const [rows, fields] = await pool.query(sql, [customer_id, password]);

        if (rows.length > 0) {
            console.log("Login successful!");
        } else {
            console.log("Invalid customer ID or password. Please try again.");
            await updateLoginAttempts(customer_id);
        }
    } catch (error) {
        console.error("Error verifying customer login:", error);
    }
}

async function isCustomerBlocked(customer_id) {
    const sql = `SELECT * FROM login_attempts WHERE customer_id = ? AND TIMESTAMPDIFF(MINUTE, last_attempt, NOW()) < 1`;
    const [rows, fields] = await pool.query(sql, [customer_id]);
    return rows.length >= 3;
}

async function updateLoginAttempts(customer_id) {
    const sql = `INSERT INTO login_attempts (customer_id) VALUES (?) ON DUPLICATE KEY UPDATE last_attempt = NOW()`;
    await pool.query(sql, [customer_id]);
}

async function customerloginmenu() {
    while (true) {
        const choice = await questionAsync(
            '\nPress 0 to get back\n' +
            '\nPress 1 to login\n' +
            '\nPress 2 to register\n' +
            '\nEnter your choice: '
        );

        if (choice === '0') {
            break;
        } else if (choice === '1') {
            await verifycustomerlogin();
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
        const choice = await questionAsync(
            `\nPress 0 to Exit\n` +
            `Press 1 to enter as admin\n` +
            `Press 2 to enter as customer\n` +
            `\nEnter your choice: `
        );

        if (choice === "0") {
            console.log("Exiting...");
            rl.close();
            break;
        } else if (choice === "1") {
            await adminmenu();
        } else if (choice === "2") {
            await customerloginmenu();
        } else {
            console.log("\nInvalid input");
            console.log("Please enter a valid choice");
        }
    }
}

enterstore();
