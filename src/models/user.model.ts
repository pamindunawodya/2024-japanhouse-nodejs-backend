import {Document,Schema,model} from "mongoose";
import * as SchemaTypes from "../types/SchemaTypes";
import {IUser} from "../types/SchemaTypes";



//type safe Ts
// interface Iuser extends Document{
//     username:string,
//     fname:string,
//     lname:string,
//     email:string,
//     password:string
//
// }

//create mongoose Schema
const userSchema=new Schema<SchemaTypes.IUser>({
    username:{type:String,required:true},
    fname:{type:String,required:true},
    lname:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})

const UserModel=model("user",userSchema);

export default UserModel;