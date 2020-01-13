const express=require('express')
const Task=require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.delete('tasks/:id', auth, async (req,res)=>{
    try{
        const task= await Task.findOneAndDelete({_id:req.params.id, author:req.user._id})

        if(!task)
            return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

//get/tasks?completed=false
//get/tasks?limit=10&skip=30 for 4th page 
//get/tasks?sortBy=createdAt:a or:d
router.get('/tasks',auth,async (req,res)=>{
    const match ={}
    const sort={}

    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='d'?-1:1
    }

    try{
        // tasks=await Task.find({author: req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth,async (req,res)=>{
    const _id= req.params.id

    try{
        const task=await Task.findOne({ _id,author: req.user._id })

        if(!task)
            return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id',auth, async (req,res)=>{

    const updates= Object.keys(req.body)
    const allowedUpdates=['description','completed']
    const isValidUpdate=updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({eror: "Invalid Updates!"})
    }

    try{
        const task= await Task.findOne({_id:req.params.id, author: req.user._id})

        if(!task)
            return res.status(404).send()

        updates.forEach((update)=>task[update]= req.body[update])
        await task.save()
        
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})



router.post('/tasks',auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        author: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports=router