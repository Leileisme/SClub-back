import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'

export const login = (req, res, next) => {
  passport.authenticate('login', { session: false }, (error, user, info) => {
    if (!user || error) {
      if (info.message === 'Missing credentials') {
        res.status(400).json({
          success: false,
          message: '欄位錯誤'
        })
        return
      } else if (info.message === '未知錯誤') {
        // 前面passport已經有未知錯誤了，這邊為何還要再寫一次
        res.status(500).json({
          success: false,
          message: '未知錯誤'
        })
        return
      } else {
        res.status(401).json({
          success: false,
          message: info.message
        })
        return
      }
    }
    // passport 從資料庫找到的USER資料
    req.user = user
    next()
  })(req, res, next)
}

export const jwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, data, info) => {
    if (error || !data) {
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'JWT 無效'
        })
        return
      } else if (info.message === '未知錯誤') {
        res.status(500).json({
          success: false,
          message: '未知錯誤'
        })
        return
      } else {
        res.status(401).json({
          success: false,
          message: info.message
        })
        return
      }
    }
    req.user = data.user
    req.TOKEN = data.TOKEN

    next()
  })(req, res, next)
}
