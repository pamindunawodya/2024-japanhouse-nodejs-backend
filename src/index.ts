import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import UserModel from "./models/user.model";
import mongoose from "mongoose";

//create use db
mongoose.connect("mongodb://localhost/japanbikehouse")
const db=mongoose.connection
db.on('error',(error)=>{
    console.log("Db Connection Error!",error);
})
db.on('open',()=>{
    console.log("DB connected Sucessfully");
})



//invoke express
const app=express();
app.use(bodyParser.json());

app.use(cors({
    origin: "*"
}));

interface  User{
    username:string;
    fname:string;
    lname:string
    email:string
    password:string

}

let users:User[]=[];



//get
app.get('/auth',async (req:express.Request,res:express.Response)=>{



    //email,password
try{
    let users=await UserModel.find();
    res.status(200).send(users);
}catch (error){
    res.status(100).send("Error!");
}
})

//post
app.post('/user',async (req:express.Request,res:express.Response)=>{

try{
    const req_body:any=req.body;
    //   users.push(req_body);
    console.log(req_body);

    const userModel=new UserModel({
        username:req_body.username,
        fname:req_body.fname ,
        lname:req_body.lname,
        email:req_body.email,
        password:req_body.password
    })
    await userModel.save();
    res.status(200).send("create new user sucessfull!");
}catch (error){
    res.status(100).send("error!")
}
})

//update

app.put('/update/users',async (req:express.Request,res:express.Response)=>{

console.log("heloooooooooooo")
    try {
        const req_body:any = req.body;
        const updateUser = await UserModel.findOne({email:req_body.email});
        console.log("test")

        if (updateUser) {
            await UserModel.findByIdAndUpdate(updateUser._id, {
                username: req_body.username,
                fname: req_body.fname,
                lname: req_body.lname,
                password: req_body.password
            });

            res.status(200).send("Updated Successfully");
        } else {
            res.status(401).send("Access Denied");
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }

})

//delete

app.delete('/user/delete/:id',async (req:express.Request,res:express.Response)=>{

    console.log("Delete ");
    try {
        const userID: string = req.params.id;
        const user = await UserModel.findById(userID);

        if (user) {
            await UserModel.deleteOne({ _id: userID });
            res.status(200).send("User Deleted Successfully");
        } else {
            res.status(404).send("User Not Found");
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
    }
});



//start the server
app.listen(8085,()=>{
    console.log("Server started 8085")
})
