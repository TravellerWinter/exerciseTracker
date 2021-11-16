const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require("mongodb")
const { ObjectId } = require("mongodb")
const { json } = require('express')


let collection;
let db;
const mongoClient = new MongoClient("mongodb+srv://andrea:123@cluster0.lw596.mongodb.net/freeCodeCamp?retryWrites=true&w=majority")

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended:true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async (req, res) => {
  const obj = {
    username: req.body.username,
    log: []
  }
  const ris = await collection.insertOne(obj)
  res.json({username: req.body.username,  _id: ris.insertedId })
})

app.get("/api/users", async (req, res) => {
  const ris =  await collection.find({}).toArray()
  res.json(ris)
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id
  let { description, duration, date } = req.body
  
  if (!date){
    date = new Date().toDateString()
  }
  date = new Date(date).toDateString()
  const arr = {
    description,
    duration: +duration,
    date
  }
  const update = await collection.updateOne({ _id: ObjectId(id) }, { $push: { log: arr } })
  const user = await collection.findOne({ _id: ObjectId(id) })
  const json = {...{username: user.username, _id: user._id}, ...arr}
  res.json(json)
  
})

app.get("/api/users/:id/logs", async (req, res) => {
  const id = req.params.id
  let { from, to, limit } = req.query
  const log = await collection.findOne({_id: ObjectId(id)})
  if (typeof from == "undefined" && typeof to == "undefined"){
    if(typeof limit !== "undefined"){
      log.log = log.log.slice(0, limit)
    }
    log.count = log.log.length
    res.json(log)
    return
  }
  from = new Date(from)
  to = new Date(to)
  let arr = []
  if (from != "Invalid Date" && to != "Invalid Date"){
    for (i of log.log){
      date = new Date(i.date)
      if (date >= from && date <= to){
        arr.push(i)
      }
    }
  }else if (from != "Invalid Date"){
    for (i of log.log){
      date = new Date(i.date)
      if (date >= from){
        arr.push(i)
      }
    }
  }else if (to != "Invalid Date"){
    for (i of log.log){
      date = new Date(i.date)
      if (date <= to){
        arr.push(i)
      }
    }
  }
  if (limit){
    arr = arr.slice(0, limit)
  }
  log.log = arr
  log.count = log.log.length
  res.json(log)
})


async function connect(){
  await mongoClient.connect()
  db = mongoClient.db("freeCodeCamp")
  collection = db.collection("users")
  console.log("connesso a database")
  app.listen(process.env.PORT || 3000, () => console.log("server in ascolto"))
}

connect()
