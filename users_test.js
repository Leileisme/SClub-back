import 'dotenv/config'
import users from './models/users.js'
import mongoose from 'mongoose'

// console.log(process.env.DB_URL)
mongoose.connect(process.env.DB_URL)

// 非學生
const data = [
  {
    EMAIL: '2222@gmail.com',
    PASSWORD: '222222',
    SCHOOL_NAME: '科技大學',
    SCHOOL_CITY: '臺北市',
    REAL_NAME: '老王先生',
    USER_NAME: '2222',
    NICK_NAME: '老王先生',
    BDAY: '2010/1/1',
    GENDER: '生理女',
    MOBILE: '12345578',
    STUDENT_GRADE: '高一',
    EMAIL_UB: '',
    ROLE: 2,
    SCORES: 80,
    IS_STUDENT: true
  }]

// export const test = async () => {
//   console.log('start')
//   await users.create(data)
//   console.log('end')
// }
// const data2 = [
//   {
//     EMAIL: '1111@gmail.com'
//   }]

// const test = async () => {
//   try {
//     console.log('Starting texts.create')
//     await texts.create(data2)
//     console.log('Finished texts.create')
//   } catch (error) {
//     console.error('Error in texts.create:', error)
//   }
// }

// test().catch(err => console.error(err))

const test = async () => {
  const aaa = await users.find({
    'CLUB_CORE_MEMBER.USER': '65cedc0264587b4fbab6205c'
  })
  console.log(aaa)
}
test()
