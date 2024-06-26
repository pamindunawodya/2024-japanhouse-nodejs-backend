
import mongoose, {Document, ObjectId} from "mongoose";

export interface IArticle extends Document {

    name: string;
    contactNumber: string;
    email: string;
    city: string;
    millage: string;
    price: number;
    vehicleCondition  : string;
    vehicleCompany  : string;
    vehicleModel: string;
    year: string;
    engineCapacity: string;
    description: string;
    imageUrl: {
        img1?: string;
        img2?: string;
        img3?: string;
        img4?: string;
    };
    publishdate: Date;
    user:ObjectId;
}

export interface IUser extends Document{

    username:string,
    fname:string,
    lname:string,
    email:string,
    password:string

}