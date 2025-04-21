const mongoose = require('mongoose');

// **Koneksi MongoDB**
const connectDB = async () => {
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));};

    module.exports = connectDB;