import { Schema, model, ObjectId, Error } from 'mongoose'

const schema = new Schema({
  EMAIL: {
    type: String,
    required: [true, '缺少「使用者信箱」'],
    unique: true
  }
})

export default model('texts', schema)
