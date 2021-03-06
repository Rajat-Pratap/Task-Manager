const express=require('express')
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const router = new express.Router()
const sharp=require('sharp')
const { sendWelcomeEmail,sendDeleteEmail }=require('../email/account')

router.delete('/users/me', auth ,async (req,res)=>{
    try{
        // const user=await User.findOneAndDelete(req.user._id)

        await req.user.remove()
        sendDeleteEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar', auth ,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
})

router.get('/users/:id/avatar' ,async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)

        if(!user||!user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.patch('/users/me', auth ,async (req, res)=>{
    const updates= Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidUpdate=updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({eror: "Invalid Updates!"})
    }

    try{
        // const user= await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})

        updates.forEach((update)=>req.user[update]= req.body[update])
        await req.user.save()

        
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
        console.log(e)
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
        console.log(e)
    }
})

router.post('/users',async (req,res)=>{
    const user= new User(req.body)
    
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch(e){
        res.status(400).send(e)
    }
})

const upload=multer({
    limits:{
        fileSize: 1034*1034
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/))
            return cb(new Error('Not a valid image upload.!'))

        cb(undefined,true)
    }
})
router.post('/users/me/avatar', auth , upload.single('upload') ,async(req,res)=>{
    req.user.avatar=await sharp(req.file.buffer).resize({width:300, height: 300}).png().toBuffer()
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

module.exports= router