const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const cookieparser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middlere

app.use(express.json())
app.use(cors({origin:"http://localhost:5173" , credentials:true}))
app.use(cookieparser())



// token jwt.verify

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token; // ✅ 
  if (!token) {
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
    if (error) return res.status(403).send({ success: false, message: "Forbidden" });

    req.decode = decode;
    next();
  });
};



// hostelmanagement


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f4ofb.mongodb.net/?appName=Cluster0`;

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


    // database of greenstay 

    const greenstayUsers = client.db("greenstay").collection('users')


    // save user in database 
    
app.post('/users', async(req, res) => {
const users= req.body;
const result = await greenstayUsers.insertOne(users)
res.send(result)
})


// get user 

app.get("/users",verifyToken,async(req,res)=>{

const users= await greenstayUsers.find().toArray()
res.send({users})

})




    // create token
    app.post('/jwt',async(req,res)=>{

      const user = req.body;
      const token = jwt.sign(user,process.env.JWT_SECRET,{expiresIn:"1h"})
      res.cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'lax'
      }).send({success: true})


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






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
