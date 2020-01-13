//sxw=+SWX2@
//CRUD: Create, Read, Update, Delete

const {MongoClient,ObjectID}= require('mongodb')
const connectionURL=process.env.MONGODB_URL
const databaseName='task-manager'


MongoClient.connect(connectionURL,{useNewUrlParser: true},(error,client)=>{
    if(error)
    {
        return console.log('Unable to connect to db')
    }

    const db= client.db(databaseName)
    db.collection('tasks').deleteOne({
        description: 'Gaming'
    }).then((result)=>{
        console.log("deleted Gaming")
    }).catch((error)=>{
        console.log(error)
    })
})