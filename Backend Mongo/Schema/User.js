import mongoose, {Schema} from "mongoose";

const userSchema = mongoose.Schema({

    personal_info: {
        fullname: {
            type: String,
            lowercase: true,
            required: true,
            minlength: [3,'fullname must be 3 letters long'],
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique:true
        },
        password: String,
    },
    cart: {
        type: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity:{
                type:Number,
                default:1,
                min:1
            }
        }
    ],
    default:[]
}

})

export default mongoose.model("users",userSchema);