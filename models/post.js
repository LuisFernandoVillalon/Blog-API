const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String, 
        required: true
    }, 
    content: {
        type: String, 
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    }
});

PostSchema.virtual("standard_timestamp").get(function () {
    let time  = this.timestamp.getUTCHours() + ":" + this.timestamp.getUTCMinutes();
    let date = this.timestamp.getMonth()+1 + "/" + this.timestamp.getDate() + "/" + this.timestamp.getFullYear();
    return time + ' ' + date;
  });

module.exports = mongoose.model("Post", PostSchema);