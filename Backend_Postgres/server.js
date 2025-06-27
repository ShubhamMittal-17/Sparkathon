import express from 'express';
import pg from 'pg';
import 'dotenv/config';
import cors from 'cors';

const app = express();
let port = 5000;

app.use(express.json());
app.use(cors());

const db = new pg.Client({
    user: process.env.PG_USER, // user is always postgres in this
    host: process.env.PG_HOST, // isko remote database ke URL se replace kardenge jab host karenge
    database: process.env.PG_DATABASE, // replace with the name of database in the remote host
    password: process.env.PG_PASSWORD, // fill the password( your pgAdmin password for now, baadme remote db server ka password daal denge)
    port: 5433, //isme fill up the port based on your pgAdmin server properties
});

db.connect();

//these are array of js objects with key as column name and value as the respective row-wise entry

const products = (await db.query("SELECT * FROM products")).rows;   //console.log(products);
const users = (await db.query("SELECT * FROM users")).rows;
const deals = (await db.query("SELECT * FROM deals")).rows;
const feedback = (await db.query("SELECT * FROM feedback")).rows;
const cart_items = (await db.query("SELECT * FROM cart_items")).rows;
const sessions = (await db.query("SELECT * FROM sessions")).rows;
const recommendations = (await db.query("SELECT * FROM recommendations")).rows;

db.end();


app.get('/all-products', (req, res) => {
        return res.status(200).json(products);
    }
)


app.listen(port, () => {
    console.log("Listening on port 5000...")
});
