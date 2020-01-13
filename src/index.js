const express=require('express')
require('./db/mongoose')
const User= require('./models/user')
const Task=require('./models/task')
const userRouter= require('./routers/user')
const taskRouter= require('./routers/task')
const multer=require('multer')
//sxw=+SWX2@
const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up and running on port: '+ port)
})