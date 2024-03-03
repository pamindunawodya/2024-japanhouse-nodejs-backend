import{Document,Schema,model} from "mongoose";


//type safe Ts
interface Iuser extends Document{
    username:string,
    fname:string,
    lname:string,
    email:string,
    password:string

}

//create mongoose Schema
const userSchema=new Schema({
    username:{type:String,required:true},
    fname:{type:String,required:true},
    lname:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})

const UserModel=model<Iuser>("user",userSchema);

export default UserModel;