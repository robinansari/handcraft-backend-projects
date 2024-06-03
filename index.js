const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express ();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const axios = require('axios');


// middleware
app.use(cookieParser());
app.use(cors({
  origin:[
    // 'http://localhost:5173',
    "https://handicraft-d48c3.web.app",
    "https://handicraft-d48c3.firebaseapp.com"
   
],
  credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@user22.kaaacfs.mongodb.net/?retryWrites=true&w=majority&appName=user22`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollections = client.db('handCraft').collection('products');
    const bookingCollections = client.db('handCraft').collection('booking');

    app.get('/services', async (req,res)=>{
      const cursor = productsCollections.find();
      const result =await cursor.toArray();
      res.send(result)
    })

    app.get('/services/:id',async (req,res)=>{
      const id =req.params.id
      const query = {_id: new ObjectId(id)}
      const options = {
        projection: {title:1, brand:1, img:1 ,price:1},
      };
      const result = await productsCollections.findOne(query,options);
      res.send(result)
    })

    app.post('/jwt', async (req,res)=>{
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn:'1h'})
      res.
      cookie('token',token, {
        httpOnly:true,
        secure: false,
        sameSite: 'none'
      })
      
      .send({success: true})
      
    })
    app.post('/booking', async (req,res)=>{
      const bookings = req.body;
      console.log(bookings)
      const result = await bookingCollections.insertOne(bookings)
      res.send(result)
    })
    app.get('/booking', async (req,res)=>{
      console.log(req.query.email)
      console.log('tok tok token aise', req.cookies.token
    )
      let query ={}
      if(req.query?.email){
        query ={email: req.query.email}
      }
      const result = await bookingCollections.find(query).toArray();
      res.send(result)
    })

    app.delete('/booking/:id', async (req,res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await bookingCollections.deleteOne(query);
      res.send(result)

    })
    app.patch('/booking/:id', async (req,res)=>{
      const id = req.params.id;
      const filter= {_id: new ObjectId(id)}
      const updateOrder = req.body;
      console.log(updateOrder)
      const updateDoc = {
        $set: {
          status:updateOrder.status
        },
      };

      const result = await bookingCollections.updateOne(filter,updateDoc)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('handcraft is running')
})

app.listen(port,()=>{
    console.log(`handcraft applications ${port}`)
})