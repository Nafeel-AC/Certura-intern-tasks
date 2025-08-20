const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = model('Post', postSchema);


