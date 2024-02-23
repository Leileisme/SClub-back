import events from '../models/events.js'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    const category = req.body.CATEGORY.split(',')
    const coOrganizer = req.body.CO_ORGANIZER ? req.body.CO_ORGANIZER.split(',') : null
    const data = coOrganizer
      ? { ...req.body, IMAGE: req.file.path, CATEGORY: category, CO_ORGANIZER: coOrganizer }
      : { ...req.body, IMAGE: req.file.path, CATEGORY: category }

    const result = await events.create(data)
    res.status(200).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error, 'events controllers 的 error')
    // 使用者驗證錯誤
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({
        success: false,
        message
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'events create 未知錯誤'
      })
    }
  }
}

export const getEventAll = async (req, res) => {
  try {
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await events.find({
      $or: [
        { TITLE: regex },
        { CITY: regex },
        { DATE: regex }
      ]
    }).limit(10)

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
      message: 'getEventAll 的未知錯誤'
    })
  }
}

export const getEventById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // findById(req.params.id, 'HOST')，後面的值代表指只返回這個欄位資料
    // const HOST_USER = await events.findById(req.params.id, 'HOST').populate('HOST', 'NICK_NAME CLUB_TH IMAGE DESCRIBE')

    // 這邊把 CO_ORGANIZER 和 HOST 關聯的都查詢出來，但也會返回 events 的資料
    const result = await events.findById(req.params.id).populate(
      {
        path: 'CO_ORGANIZER',
        select: 'NICK_NAME CLUB_TH IMAGE DESCRIBE USER_NAME'
      }).populate(
      {
        path: 'HOST',
        select: 'NICK_NAME CLUB_TH IMAGE DESCRIBE USER_NAME'
      }
    )

    if (!result) throw new Error('NOT FOUND')

    res.status(200).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error, 'events controllers 的 error')
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(400).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(404).json({
        success: false,
        message: '查無商品'
      })
    } else {
      res.status(500).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const edit = async (req, res) => {
  try {
    req.body.IMAGE = req.file?.path
    // findByIdAndUpdate用於找到並更新 MongoDB 中的特定文件
    // 三個參數(尋找資料的_id,更新的資料,選項)
    // 另外還有 findOneAndUpdate
    await events.findByIdAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

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
