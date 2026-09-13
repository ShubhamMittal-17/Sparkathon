import mongoose from "mongoose";

// A store layout authored in the in-browser editor.
//  - grid: 2D array of cell types, 0 = aisle (walkable), 1 = shelf (obstacle).
//  - entrance: the cell the route starts from, as {x: row, y: col}.
// Product positions (in the products collection) reference shelf cells of the
// active layout, so the navigation route is computed over this exact grid.
const layoutSchema = mongoose.Schema({
    name: {
        type: String,
        default: "My Store",
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    entrance: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
    },
    // grid[row][col] -> 0 (aisle) | 1 (shelf)
    grid: {
        type: [[Number]],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model("layouts", layoutSchema);
