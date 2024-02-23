import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'

passport.use(
  'login',
  // 建立一個 passport 的驗證策略
  new passportLocal.Strategy(
    {
      usernameField: 'EMAIL',
      passwordField: 'PASSWORD'
    },
    async (EMAIL, PASSWORD, done) => {
      try {
        // findOne({ account })  MongoDB 的語法
        // 在資料庫中查找符合特定條件的第一個文件
        const user = await users.findOne({ EMAIL })
        if (!user) {
          throw new Error('EMAIL')
        }

        if (!bcrypt.compareSync(PASSWORD, user.PASSWORD)) {
          throw new Error('PASSWORD')
        }

        // (錯誤物件, 使用者物件(失敗為 false 或 null), 傳遞關於驗證狀態的額外訊息)
        return done(null, user, null)
      } catch (error) {
        console.log(error, 'passport login')
        if (error.message === 'EMAIL') {
          return done(null, null, { message: '信箱不存在' })
        } else if (error.message === 'PASSWORD') {
          return done(null, null, { message: '密碼錯誤' })
        } else {
          return done(null, null, { message: '未知錯誤' })
        }
      }
    }
  )
)

/*
      http://localhost:4000/users/test?aaa=111&bbb=2
      req.originalUrl = /users/test?aaa=111&bbb=2
      req.baseUrl = /users
      req.path = /test
      req.query = { aaa: 111, bbb: 222 }
*/

passport.use(
  'jwt',
  new passportJWT.Strategy(

    {
      // 定義JWT來源 / JWT 密鑰 / 是否傳遞 req / 是否忽略過期(先忽略,下面再驗證)
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
      ignoreExpiration: true
    },
    // payload：解析出來的資料
    async (req, payload, done) => {
      try {
        const expired = payload.exp * 1000 < new Date().getTime()
        const url = req.baseUrl + req.path
        if (expired && url !== '/users/extend' && url !== '/users/logout') {
          throw new Error('EXPIRED')
        }
        const TOKEN = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        const user = await users.findOne({ _id: payload._id, TOKENS: TOKEN })

        if (!user) {
          throw new Error('JWT')
        }

        return done(null, { user, TOKEN }, null)
      } catch (error) {
        console.log(error, 'passport jwt')
        if (error.message === 'EXPIRED') {
          return done(null, null, { message: 'JWT 過期' })
        } else if (error.message === 'JWT') {
          return done(null, null, { message: 'JWT 無效' })
        } else {
          return done(null, null, { message: 'JWT 未知錯誤' })
        }
      }
    }
  )
)
