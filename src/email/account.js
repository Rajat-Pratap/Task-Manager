//sxw=+SWX2@
const sendGridAPIKey=process.env.SENDGRID_API_KEY
const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from: 'rajat789pratap@gmail.com',
        subject: 'Hello There, Thank you for joining!',
        text:`Welcome to the app, ${name}, Let me knoW about your experience.`
    })
}

const sendDeleteEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from: 'rajat789pratap@gmail.com',
        subject: 'Good Bye',
        text:`FareWell, ${name}, Please provide us your valuable feedback.`
    })
}

module.exports={
    sendWelcomeEmail,
    sendDeleteEmail
}