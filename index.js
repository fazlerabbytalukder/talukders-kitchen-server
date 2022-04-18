const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const fileUpload = require('express-fileupload');

//when order found error request entity too large then i use this to solve this problem
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnnr8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
    try {
        await client.connect();
        // console.log('database connect successfully');
        const database = client.db("talukdersKitchen");
        const foodCollection = database.collection("foods");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const bookTableCollection = database.collection("booktable");


        //GET ALL FOOD DATA
        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find({});
            const foods = await cursor.toArray();
            res.send(foods);
        })
        //GET API WITH ID
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const foods = await foodCollection.findOne(query);
            res.json(foods);
        })

        //POST FOOD DATA
        app.post('/foods', async (req, res) => {
            const foods = req.body;
            // console.log(foods);
            const result = await foodCollection.insertOne(foods);
            res.json(result)
        })
        // app.post('/foods', async (req, res) => {
        //     const foodName = req.body.foodName;
        //     const category = req.body.category;
        //     const price = req.body.price;
        //     const star = req.body.star;
        //     const pic = req.files.img;

        //     const picData = pic.data;
        //     const encodedPic = picData.toString('base64');
        //     const imgBuffer = Buffer.from(encodedPic, 'base64');

        //     const foods = {
        //         foodName,
        //         category,
        //         price,
        //         star,
        //         img: imgBuffer
        //     }

        //     const result = await foodCollection.insertOne(foods);
        //     res.json(result)

        //     // console.log('body', req.body);
        //     // console.log('files', req.files);
        //     // res.json({ success: true });
        // })


         //DELETE FOODS
         app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await foodCollection.deleteOne(query);
            res.json(result);
        })








        //POST ORDER DATA
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            // console.log(result);
            res.json(result)
        })
        //GET ORDER DATA
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });
        //GET ALL USER ORDER DATA
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });
        //UPDATE ORDER DATA
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        //DELETE ORDER DATA
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })





        //POST BOOK TABLE DATA
        app.post('/booktable', async (req, res) => {
            const bookTable = req.body;
            const result = await bookTableCollection.insertOne(bookTable);
            // console.log(result);
            res.json(result)
        })
        //GET ALL RESERVATION DATA
        app.get('/booktable', async (req, res) => {
            const cursor = bookTableCollection.find({});
            const reservation = await cursor.toArray();
            res.json(reservation);
        });
        //DELETE ORDER DATA
        app.delete('/booktable/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookTableCollection.deleteOne(query);
            res.json(result);
        })






        //USER INFO POST TO THE DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })
        //USER PUT FOR GOOGLE SIGN IN METHOD(upsert)
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //MAKE ADMIN OR NORMAL USERS
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //DIFFERENTIATE ADMIN CAN ONLY ADD ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user) {
                if (user.role === 'admin') {
                    isAdmin = true;
                }
                res.json({ admin: isAdmin });
            }
            else {
                res.json({ admin: isAdmin });
            }
            // res.json('dd');
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('i am from talukders kitchen server');
})

app.listen(port, () => {
    console.log('running server on port', port);
})