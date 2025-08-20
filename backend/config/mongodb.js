// import mongoose from "mongoose";
// import 'dotenv/config';

// const DB = async ()=>{
//     mongoose.connection.on('connected', ()=>console.log("database Connected"));

//     await mongoose.connect(`${process.env.MONGO_URI}/Invoicess`);
// }

// export default DB;


import mongoose from "mongoose";

const DB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default DB;
