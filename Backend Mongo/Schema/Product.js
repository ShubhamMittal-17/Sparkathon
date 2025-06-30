import mongoose,{Schema} from "mongoose";

const productSchema = mongoose.Schema({

    product_id: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
        },
        product_img: {
            type: String,
        },
        des: {
            type: String,
            maxlength: 200
        },
        price: {
            type: Number,
            required : true
        },
        count: {
            total_stock: {
                type: Number,
                default: 0
            },
            total_sold: {
                type: Number,
                default: 0
            }
        }, 
        tags : {
            type : String
        }, 
        position : {
            x :{
                type : Number,
                default : -1
            }, 
            y : {
                type : Number,
                default : -1
            }
        }, 
        rating : {
            type: String,
            default: "0"
        }

})

export default mongoose.model("products",productSchema);