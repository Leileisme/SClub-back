import users from '../models/users.js'
import events from '../models/events.js'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { trusted } from 'mongoose'

export const create = async (req, res) => {
  try {
    // 這邊的 image 是我表單自訂的名字
    // req.body.IMAGE = req.file.path
    await users.create(req.body)
    res.status(200).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error, 'users create controller')
    // 當 models 驗證未過時，將產生一個 ValidationError 錯誤
    if (error.name === 'ValidationError') {
      // error.errors 中的錯誤是根據 models 定義中設置的驗證條件所產生的
      // EX: required: [true, '缺少「通知類別」']

      // error.errors 包含了驗證失敗時的詳細資訊，EX：哪個欄位未通過驗證...
      // error.errors[0] 取錯誤物件第一個屬性名稱
      // error.errors[key].message 取其錯誤訊息
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({
        success: false,
        message
      })
      // 錯誤代碼 11000 ： 資料重複
    } else if (error.name === 'MongoServerError' && error.code === 1100) {
      res.status(409).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(500).json({
        success: false,
        message: '註冊的未知錯誤'
      })
    }
  }
}

// 回傳的資料以後可以看看要不要增加
export const login = async (req, res) => {
  try {
    const [CLUB_CORE_MEMBER, EVENTS, joinEvent] = await Promise.all([
      users.findById(req.user._id, 'CLUB_CORE_MEMBER').populate('CLUB_CORE_MEMBER.USER', 'USER_NAME'),
      events.find({ HOST: req.user._id }, '_id'),
      users.findById(req.user._id, 'CLUB_CORE_MEMBER').populate('TICKET_CART.EVENT')
    ])

    const MAKE_EVENTS_ID = EVENTS.map(e => e._id)

    // jwt.sign 創造一個新的JWT，並接受三個參數 ( 物件、密鑰、選項 )
    const TOKEN = jwt.sign({ _id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.TOKENS.push(TOKEN)
    await req.user.save()
    res.status(200).json({
      success: true,
      message: '',
      result: {
        TOKEN,
        EMAIL: req.user.EMAIL,
        ROLE: req.user.ROLE,
        SCHOOL_NAME: req.user.SCHOOL_NAME,
        SCHOOL_CITY: req.user.SCHOOL_CITY,
        REAL_NAME: req.user.REAL_NAME,
        USER_NAME: req.user.USER_NAME,
        NICK_NAME: req.user.NICK_NAME,
        CLUB_TH: req.user.CLUB_TH,
        CLUB_CATEGORY: req.user.CLUB_CATEGORY,
        IMAGE: req.user.IMAGE,
        TICKET_CART: joinEvent.TICKET_CART,
        SCORES: req.user.SCORES,
        NOTIFY: req.user.NOTIFY,
        KEEP_POST: req.user.KEEP_POST,
        KEEP_EVENT: req.user.KEEP_EVENT,
        FANS: req.user.FANS,
        FOLLOW: req.user.FOLLOW,
        IS_STUDENT: req.user.IS_STUDENT,
        IS_ABLE: req.user.IS_ABLE,
        IS_ADMIN: req.user.IS_ADMIN,
        MAKE_EVENT: req.user.MAKE_EVENT,
        MAKE_POST: req.user.MAKE_POST,
        DESCRIBE: req.user.DESCRIBE,
        CLUB_CORE_MEMBER: CLUB_CORE_MEMBER.CLUB_CORE_MEMBER,
        _id: req.user._id,
        MAKE_EVENTS_ID
      }
    })
  } catch (error) {
    console.log(error, 'users login controller')
    res.status(500).json({
      success: false,
      message: '登入的未知錯誤'
    })
  }
}

export const logout = async (req, res) => {
  try {
    req.TOKENS = req.user.TOKENS.filter((token) => token !== req.TOKENS)
    await req.user.save()
    res.status(200).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error, 'users logout controller')
    res.status(500).json({
      success: false,
      message: '登出的未知錯誤'
    })
  }
}

export const extend = async (req, res, next) => {
  try {
    const idx = req.user.TOKENS.findIndex((token) => token === req.TOKEN)
    const TOKEN = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.TOKENS[idx] = TOKEN
    await req.user.save()
    res.status(200).json({
      success: true,
      message: '',
      result: TOKEN
    })
  } catch (error) {
    console.log(error, 'users extend controller')
    res.status(500).json({
      success: false,
      message: 'token換新的未知錯誤'
    })
  }
}

// pinai 只存 JWT ，登入後執行 getProfile 取個人資料 放本地
export const getProfile = async (req, res) => {
  try {
    // .findById( 使用者_id, 要關聯的欄位 ).populate ( 要關聯的欄位的_id且有ref , 透過ref取得ref關聯的欄位 )
    // 因為 models 裡的 CLUB_CORE_MEMBER.USER 有 ref: 'users'，所以可以直接取 USER_NAME

    const [CLUB_CORE_MEMBER, EVENTS, joinEvent] = await Promise.all([
      users.findById(req.user._id, 'CLUB_CORE_MEMBER').populate('CLUB_CORE_MEMBER.USER', 'USER_NAME'),
      events.find({ HOST: req.user._id }, '_id'),
      users.findById(req.user._id).populate({ path: 'TICKET_CART.EVENT' }).populate({ path: 'TICKET_CART.EVENT', populate: { path: 'HOST', select: 'IMAGE' } })
    ])

    const MAKE_EVENTS_ID = EVENTS.map(e => e._id)

    // 以上合併以下的寫法
    // const CLUB_CORE_MEMBER = await users.findById(req.user._id, 'CLUB_CORE_MEMBER').populate('CLUB_CORE_MEMBER.USER', 'USER_NAME')
    // const EVENTS = await events.find({ HOST: req.user._id }, '_id')
    // const MAKE_EVENTS_ID = EVENTS.map(e => e._id)
    // const joinEvent = await users.findById(req.user._id, 'CLUB_CORE_MEMBER').populate('TICKET_CART.EVENT')

    res.status(200).json({
      success: true,
      massage: '',
      result: {
        EMAIL: req.user.EMAIL,
        ROLE: req.user.ROLE,
        SCHOOL_NAME: req.user.SCHOOL_NAME,
        SCHOOL_CITY: req.user.SCHOOL_CITY,
        REAL_NAME: req.user.REAL_NAME,
        USER_NAME: req.user.USER_NAME,
        NICK_NAME: req.user.NICK_NAME,
        CLUB_TH: req.user.CLUB_TH,
        CLUB_CATEGORY: req.user.CLUB_CATEGORY,
        IMAGE: req.user.IMAGE,
        TICKET_CART: joinEvent.TICKET_CART,
        SCORES: req.user.SCORES,
        NOTIFY: req.user.NOTIFY,
        KEEP_POST: req.user.KEEP_POST,
        KEEP_EVENT: req.user.KEEP_EVENT,
        FANS: req.user.FANS,
        FOLLOW: req.user.FOLLOW,
        IS_STUDENT: req.user.IS_STUDENT,
        IS_ABLE: req.user.IS_ABLE,
        IS_ADMIN: req.user.IS_ADMIN,
        MAKE_EVENT: req.user.MAKE_EVENT,
        MAKE_POST: req.user.MAKE_POST,
        DESCRIBE: req.user.DESCRIBE,
        CLUB_CORE_MEMBER: CLUB_CORE_MEMBER.CLUB_CORE_MEMBER,
        _id: req.user._id,
        MAKE_EVENTS_ID
      }
    })
  } catch (error) {
    console.log(error, 'users getProfile controller')
    res.status(500).json({
      success: false,
      message: '取得個人資料的未知錯誤'
    })
  }
}

export const getUser = async (req, res) => {
  try {
    // i 是不分大小寫
    const regex = new RegExp(req.query.search || '', 'i')

    const role = req.query.role ? req.query.role.split(',').map(v => parseInt(v)) : [1, 2, 3]
    const data = await users.find({
      $or: [
        { USER_NAME: regex },
        { NICK_NAME: regex }
      ],
      ROLE: trusted({ $in: role })
    },
    { USER_NAME: 1, NICK_NAME: 1, IMAGE: 1, SCHOOL_NAME: 1, SCHOOL_CITY: 1, CLUB_TH: 1, CLUB_CATEGORY: 1, DESCRIBE: 1 }
    )
    // 限制回傳的數量

    res.status(200).json({
      success: true,
      message: '',
      result: {
        data
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'getUser 的未知錯誤'
    })
  }
}

// 找出一個使用者
export const getUserName = async (req, res) => {
  try {
    // .lean() 轉成純 JS 變數
    const result = await users.findOne({ USER_NAME: req.params.USER_NAME }).lean()
    if (!result) throw new Error('NOT FOUND')
    // 找使用者在哪些社團是幹部
    let clubs = await users.find(
      // CLUB_CORE_MEMBER 陣列裡的 USER 是現在要找的使用者 id
      {
        'CLUB_CORE_MEMBER.USER': result._id
      },
      // 只取 NICK_NAME 和 CLUB_CORE_MEMBER 、CLUB_TH 欄位
      'NICK_NAME CLUB_CORE_MEMBER CLUB_TH'
    ).lean()
    // 找出來的社團只取名稱和幹部職位
    clubs = clubs.map(club => {
      return {
        NICK_NAME: club.NICK_NAME,
        ROLE: club.CLUB_CORE_MEMBER.find(member => member.USER.toString() === result._id.toString()).ROLE,
        CLUB_TH: club.CLUB_TH
      }
    })

    const [CLUB_CORE_MEMBER, EVENTS, joinEvent] = await Promise.all([
      users.findById(result._id, 'CLUB_CORE_MEMBER').populate('CLUB_CORE_MEMBER.USER', 'USER_NAME'),
      // 找出使用者主辦的活動
      events.find({ HOST: result._id }, '_id'),
      // 找出使用者參加的活動所有資訊，並取得 HOST 主辦者的 IMAGE
      users.findById(result._id).populate({ path: 'TICKET_CART.EVENT' }).populate({ path: 'TICKET_CART.EVENT', populate: { path: 'HOST', select: 'IMAGE' } })
    ])
    const MAKE_EVENTS_ID = EVENTS.map(e => {
      return e._id
    })

    res.status(200).json({
      success: true,
      message: '',
      result: {
        ...result,
        IS_CORE_MEMBER: clubs,
        MAKE_EVENTS_ID,
        TICKET_CART: joinEvent.TICKET_CART,
        CLUB_CORE_MEMBER: CLUB_CORE_MEMBER.CLUB_CORE_MEMBER
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'getUserName 的未知錯誤'
    })
  }
}

export const edit = async (req, res) => {
  try {
    req.body.IMAGE = req.file?.path
    if (!req.body.IMAGE) {
      req.body.IMAGE = 'https://source.boringavatars.com/beam/120/' + req.user.EMAIL
    }

    if (req.body.CLUB_CORE_MEMBER) {
      for (const idx in req.body.CLUB_CORE_MEMBER) {
        req.body.CLUB_CORE_MEMBER[idx].CONFIRM = 'false'
        req.body.CLUB_CORE_MEMBER[idx].CONFIRM_USER = null
        const user = await users.findOne({ USER_NAME: req.body.CLUB_CORE_MEMBER[idx].USER }).orFail(new Error('NOT FOUND'))
        req.body.CLUB_CORE_MEMBER[idx].USER = user._id
      }
    }
    // findOneAndUpdate用於找到並更新 MongoDB 中的特定文件
    // 三個參數(尋找資料的key,更新的資料,選項)
    await users.findOneAndUpdate({ USER_NAME: req.body.USER_NAME }, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

    res.status(200).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(400).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(404).json({
        success: false,
        message: '查無使用者'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({
        success: false,
        message
      })
    } else {
      res.status(500).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 使用票券
export const usedTicket = async (req, res) => {
  try {
    await users.findOneAndUpdate(
      { USER_NAME: req.body.USER_NAME, 'TICKET_CART.TICKET': req.body.TICKET_CART.TICKET },
      { 'TICKET_CART.$.USED': req.body.TICKET_CART.USED },
      { runValidators: true }
    ).orFail(new Error('NOT FOUND'))

    res.status(200).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(400).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(404).json({
        success: false,
        message: '查無使用者'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({
        success: false,
        message
      })
    } else {
      res.status(500).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
