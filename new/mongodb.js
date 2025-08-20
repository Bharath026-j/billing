import mongoose from "mongoose";
import PurchaseModel from "../backend/models/purchaseModel";

const DB =()=> mongoose.connect(process.env.MONGO_URI ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB successfully.");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
})

export default DB;



