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
      result,
      ticketId: result._id
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

// 找活動
export const getEventAll = async (req, res) => {
  try {
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await events.find({
      $or: [
        { TITLE: regex },
        { CITY: regex },
        { DATE: regex },
        { IS_PUBLIC: regex },
        { CATEGORY: regex }
      ]
    })

    const result = data.map(item => ({
      TITLE: item.TITLE,
      DATE: item.DATE,
      CITY: item.CITY,
      IS_PUBLIC: item.IS_PUBLIC,
      CATEGORY: item.CATEGORY,
      PRE_SALE: item.PRE_SALE,
      DESCRIPTION: item.DESCRIPTION,
      IMAGE: item.IMAGE,
      HOST: item.HOST,
      CO_ORGANIZER: item.CO_ORGANIZER,
      _id: item._id,
      TICKET: item.TICKET
    }))

    res.status(200).json({
      success: true,
      message: '',
      result
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
    ).populate({
      path: 'TICKET.USER',
      select: 'USER_NAME IMAGE NICK_NAME'
    })

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
        message: '查無事件'
      })
    } else {
      res.status(500).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 待確認
export const get = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    const sortOrder = parseInt(req.query.sortOrder) || -1
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20
    const page = parseInt(req.query.page) || 1
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await events
      .find({
        sell: true,
        $or: [
          { TITLE: regex },
          { CITY: regex },
          { DATE: regex },
          { IS_PUBLIC: regex },
          { CATEGORY: regex }
        ]
      })
      // const text = 'a'
      // const obj = { [text]: 1 }
      // obj.a = 1
      .sort({ [sortBy]: sortOrder })
      // 如果一頁 10 筆
      // 第 1 頁 = 0 ~ 10 = 跳過 0 筆 = (1 - 1) * 10
      // 第 2 頁 = 11 ~ 20 = 跳過 10 筆 = (2 - 1) * 10
      // 第 3 頁 = 21 ~ 30 = 跳過 20 筆 = (3 - 1) * 10
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage === -1 ? undefined : itemsPerPage)

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
      message: '未知錯誤'
    })
  }
}

export const edit = async (req, res) => {
  try {
    req.body.IMAGE = req.file?.path
    // findByIdAndUpdate用於找到並更新 MongoDB 中的特定文件
    // 三個參數(尋找資料的_id,更新的資料,選項)
    // 另外還有 findOneAndUpdate
    const updatedEvent = await events.findByIdAndUpdate({ _id: req.params.id }, { $push: { TICKET: req.body.TICKET } }, { runValidators: true, new: true }).orFail(new Error('NOT FOUND'))

    res.status(200).json({
      success: true,
      message: '',
      ticketId: updatedEvent.TICKET[updatedEvent.TICKET.length - 1]._id
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

export const useTicket = async (req, res) => {
  try {
    // findByIdAndUpdate用於找到並更新 MongoDB 中的特定文件
    // 三個參數(尋找資料的_id,更新的資料,選項)
    // 另外還有 findOneAndUpdate
    const ticketId = req.body.ticketId
    const usedValue = req.body.used // 這是你要更新的值
    const event = await events.findById(req.params.id).orFail(new Error('NOT FOUND'))

    const ticket = event.TICKET.find(ticket => ticket._id.toString() === ticketId)
    if (!ticket) {
      throw new Error('TICKET NOT FOUND')
    }
    ticket.USED = usedValue

    // 儲存事件
    const updatedEvent = await event.save()

    // 關聯 events 的 TICKET.USER 欄位
    const populatedEvent = await events.findById(updatedEvent._id).populate('TICKET.USER')

    // 找到關聯的使用者名稱
    const USER_NAME = populatedEvent.TICKET.find(ticket => ticket._id.toString() === ticketId).USER.USER_NAME

    res.status(200).json({
      success: true,
      message: '',
      USER_NAME
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
        message: '查無票券'
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

export const deleteEvent = async (req, res) => {
  try {
    console.log(req.params.id, 'req.params.id')
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // findByIdAndDelete 用於找到並刪除 MongoDB 中的特定文件
    const result = await events.findByIdAndDelete(req.params.id).orFail(new Error('NOT FOUND'))

    res.status(200).json({
      success: true,
      message: '成功刪除活動',
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
        message: '查無事件'
      })
    } else {
      res.status(500).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
