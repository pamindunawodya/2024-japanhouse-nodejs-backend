import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import UserModel from "./models/user.model";
import mongoose, {Schema, Types} from "mongoose";
import ArticleModel from "./models/article.model";
import * as SchemaTypes from "./types/SchemaTypes";
import multer, { StorageEngine } from 'multer';
import {ObjectId} from "mongodb";
import customResponse from "./dtos/custom.response";
import process from "node:process";
import jwt, {Secret} from "jsonwebtoken";
import bcrypt from "bcryptjs";

import dotenv from 'dotenv'
dotenv.config();





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
    origin: '*'
}));



interface  User{
    username:string;
    fname:string;
    lname:string
    email:string
    password:string

}

let users:User[]=[];


//token generate


 const verifyToken=(req:express.Request,res:any,next:express.NextFunction)=>{

        const token = req.headers.authorization;

        //verify token
        if (!token) {
            return res.status(401).json('Invalid Token ')
        }
        try {
            const data = jwt.verify(token, process.env.SECRET as Secret);
            res.tokenData = data;
            next();
        } catch (error) {
            return res.status(401).json('Invalid Token')
        }
    }

    app.post('/users', async (req: express.Request, res: express.Response) => {

        try {
            const req_body: any = req.body;
            console.log(req_body);

            //encript password
            await bcrypt.hash(req_body.password, 8, async function (err, hash) {
                if (err) {
                    res.status(100).send(
                        new customResponse(200, "Something went wrong")
                    )

                }
                const userModel = new UserModel({
                    username: req_body.username,
                    fname: req_body.fname,
                    lname: req_body.lname,
                    email: req_body.email,
                    password: hash
                })
                // let user:Iuser|null=await  userModel.save();
                let user: SchemaTypes.IUser | null = await userModel.save();


                if (user) {
                    user.password = "";
                    res.status(200).send(
                        new customResponse(200, "User Created Sucessfully", user)
                    );
                } else {
                    res.status(100).send(
                        new customResponse(200, "Something went wrong")
                    )
                }
            })

            //db eken  value tika set krnwk


            // users.push(req_body)
        } catch (error) {
            res.status(100).send("Error")
        }

    })


//get
    app.get('/auth', async (req: express.Request, res: express.Response) => {

        //email,password
        try {
            let users = await UserModel.find();
            res.status(200).send(users);
        } catch (error) {
            res.status(100).send("Error!");
        }
    })


//update
//
// app.put('/update/users',async (req:express.Request,res:express.Response)=>{
//
// console.log("heloooooooooooo")
//     try {
//         const req_body:any = req.body;
//         const updateUser = await UserModel.findOne({email:req_body.email});
//         console.log("test")
//
//         if (updateUser) {
//             await UserModel.findByIdAndUpdate(updateUser._id, {
//                 username: req_body.username,
//                 fname: req_body.fname,
//                 lname: req_body.lname,
//                 password: req_body.password
//             });
//
//             res.status(200).send("Updated Successfully");
//         } else {
//             res.status(401).send("Access Denied");
//         }
//     } catch (error) {
//         console.error("Error updating user:", error);
//         res.status(500).send("Internal Server Error");
//     }
//
// })
    app.put('/update/users', async (req: express.Request, res: express.Response) => {
        try {
            const {username, fname, lname, password} = req.body;
            console.log({username, fname, lname, password});
            const updateUser = await UserModel.findOneAndUpdate({email: req.body.email}, {
                username,
                fname,
                lname,
                password
            });
            console.log({email: req.body.email})
            if (updateUser) {
                res.status(200).send("Updated Successfully");
            } else {
                res.status(404).send("User not found"); // Update status code to 404
            }
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).send("Internal Server Error");
        }
    });


//delete

    app.delete('/user/delete/:id', async (req: express.Request, res: express.Response) => {

        console.log("Delete ");
        try {
            const userID: string = req.params.id;
            const user = await UserModel.findById(userID);

            if (user) {
                await UserModel.deleteOne({_id: userID});
                res.status(200).send("User Deleted Successfully");
            } else {
                res.status(404).send("User Not Found");
            }
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).send("Internal Server Error");
        }
    });

//auth

    app.post('/user/auth', async (req: express.Request, res: express.Response) => {

        try {
            let request_body = req.body;
            // email , password

            let user: SchemaTypes.IUser | null = await UserModel.findOne({ email: request_body.email });

            if (user) {
                // Decrypt password and compare
                const isMatch = await bcrypt.compare(request_body.password, user.password);

                if (isMatch) {


                    // Remove password from user object
                    user.password = "";

                    const expiresIn = '1w';

                    jwt.sign({ user }, process.env.SECRET as string, { expiresIn }, (err: any, token: any) => {
                        if (err) {

                            res.status(500).send(
                                new customResponse(100, "Something Went Wrong")
                            );
                        } else {
                            let res_body = {
                                user: user,
                                accessToken: token
                            };
                            console.log(res_body);

                            res.status(200).send(
                                new customResponse(200, "Access", res_body)
                            );
                        }
                    });
                } else {
                    // Password is invalid
                    res.status(401).send(
                        new customResponse(401, "Invalid credentials")
                    );
                }
            } else {
                // User not found
                res.status(404).send(
                    new customResponse(404, "User not found")
                );
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send(
                new customResponse(500, "Internal Server Error")
            );
        }
    });

/////////////////////////////////article /////////////////////////////////////////////////////


// Set up multer for handling file uploads
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'src/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    const upload = multer({storage: storage});

    app.post('/article', upload.fields([{name: 'img1'}, {name: 'img2'}, {name: 'img3'}, {name: 'img4'}]), async (req, res) => {

        try {
            const req_body = req.body;
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };


            const imageUrl = {
                img1: files.img1 ? files.img1[0].path : "",
                img2: files.img2 ? files.img2[0].path : "",
                img3: files.img3 ? files.img3[0].path : "",
                img4: files.img4 ? files.img4[0].path : ""
            };


            const articleModel = new ArticleModel({
                name: req_body.name,
                contactNumber: req_body.contactNumber,
                email: req_body.email,
                city: req_body.city,
                millage: req_body.millage,
                price: req_body.price,
                vehicleCondition: req_body.vehicleCondition,
                vehicleCompany: req_body.vehicleCompany,
                vehicleModel: req_body.vehicleModel,
                year: req_body.year,
                engineCapacity: req_body.engineCapacity,
                description: req_body.description,
                imageUrl: imageUrl,
                user: new ObjectId(req_body.user)

            });
            await articleModel.save().then(r => {
                console.log("article saved")
                res.status(200).send(new customResponse(200, "Article saved successfully !")
                )
            }).catch(e => {
                console.error(e);
                res.status(500).send(new customResponse(500, e._message)
                )
            });
        } catch (e) {
            console.error(e);
            res.status(500).send('error');
        }
    });

//get all articles

    app.get('/get', async (req: express.Request, res: express.Response) => {


        try {
            let req_query: any = req.query;
            let size: number = req_query.size;
            let page: number = req_query.page;

            const articles = await ArticleModel.find().limit(size).skip(size * (page - 1));
            let documentCount = await ArticleModel.countDocuments();
            let pageCount = Math.ceil(documentCount / size);

            res.status(200).send(
                new customResponse(200, "Articles Are Found Sucessfully", articles, pageCount)
            );

        } catch (error) {
            res.status(100).send("Error")
        }

    });

    //get Article By username

    app.get('/get/article/:username',async (req:express.Request,res:express.Response) => {

        console.log("Helllloooo")

        try {
            let req_query:any=req.query;
            let size:number=req_query.size;
            let page:number=req_query.page;
            let username:string=req.params.username;

            let user= await UserModel.findOne({username:username});

            //user kenek nttm
            if (!user){
                res.status(404).send(
                    new  customResponse(404,"user are not found")
                )
            }else {
                let articles=await ArticleModel.find({user:user._id}).limit(size).skip(size*(page-1));

                let documentCount=await ArticleModel.countDocuments({user:user._id});
                let pageCount=Math.ceil(documentCount/size);

                res.status(200).send(
                    new customResponse(200,"Articles Are Found Sucessfully",articles,pageCount)
                )
            }
        }catch (error){
            res.status(100).send("Error")
        }

});

    //get my article
    app.get('/get/myarticle',verifyToken,async (req:express.Request,res:any) => {
        console.log("arttttttttttttt")

        try {

        let req_query:any=req.query;
        let size:number=req_query.size

        let page:number=req_query.page;


        let user_id=res.tokenData.user._id;

        let articles=await ArticleModel.find({user:user_id}).limit(size).skip(size*(page-1));

        let documentCount=await ArticleModel.countDocuments({user:user_id});

        let pageCount=Math.ceil(documentCount/size);

        res.status(200).send(
            new customResponse(200,'Articles Are Found Sucessfully',articles,pageCount)
        )



    }catch (error){
        res.status(100).send("Not Found")
    }


    })

















//start the server
app.listen(8085,()=>{
    console.log("Server started 8085")
})
