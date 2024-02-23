import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routerUsers from './routes/users.js'
import routerEvents from './routes/events.js'
import mongoSanitize from 'express-mongo-sanitize'
import './passport/passport.js'

// 建立網頁伺服器
const app = express()

// 防止對MongoDB 的惡意請求，將「$」或「.」開頭的欄位ley值刪除或取代
app.use(mongoSanitize())

// 設定是否允許跨域請求
app.use(
  cors({
    origin (origin, callback) {
      // origin 請求的來源
      // 後端的 origin 通常都是 undefined (除非特別設定)
      if (origin === undefined || origin.includes('github.io') || origin.includes('localhost')) {
        callback(null, true)
      } else {
        callback(new Error('CORS'), false)
      }
    }
  })
)
// 處理跨域的錯誤(都是處理上一層的錯誤)
app.use((_, req, res, next) => {
  res.status(403).json({
    success: false,
    message: 'CORS請求被拒絕'
  })
})

// 處理請求的 JSON 解析和資料格式錯誤的處理
// 是express的一個middleware ，這邊上下全部都算是它的middleware????????????
app.use(express.json())
// 處理伺服器錯誤
app.use((_, rep, res, next) => {
  res.status(400).json({
    success: false,
    message: '「express 伺服器」資料格式錯誤'
  })
})

// 所有請求路徑
app.use('/users', routerUsers)
app.use('/events', routerEvents)
// app.use('./events', routerEvents)
// 處理請求路徑錯誤
// * 代表任意路徑
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到路徑'
  })
})

// 雲端伺服器會指定 process.env.PORT 寫在.env 裡
// 連線資料庫 放到 async 為了可 log 狀態
app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  mongoose.set('sanitizeFilter', true)
  console.log('資料庫連線成功')
})
