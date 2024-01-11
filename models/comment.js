const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    comment: {
        type: String, 
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    user_ref: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    post_ref: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
});

CommentSchema.virtual("standard_timestamp").get(function () {
    let time  = this.timestamp.getUTCHours() + ":" + this.timestamp.getUTCMinutes();
    let date = this.timestamp.getMonth()+1 + "/" + this.timestamp.getDate() + "/" + this.timestamp.getFullYear();
    return time + ' ' + date;
  });

module.exports = mongoose.model("Comment", CommentSchema);