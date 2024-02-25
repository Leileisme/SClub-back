import { Schema, model, ObjectId } from 'mongoose'

// 15.票券管理
const ticketManageSchema = new Schema({
  // 1.誰的票
  USER: {
    type: ObjectId,
    required: [true, '缺少「誰的票」'],
    ref: 'users'
  },
  // 2.是否用過
  USED: {
    type: Number,
    required: [true, '缺少「票是否用過」'],
    default: false
  }
})

// 20.貼文、4.留言
const eventPostMessageSchema = new Schema({
  // 1.留言的人
  USER: {
    type: ObjectId,
    required: [true, '缺少「留言的人」'],
    ref: 'users'
  },
  // 2.留言內容
  MESSAGE: {
    type: String,
    required: [true, '缺少「留言內容」'],
    minlength: [1, '「留言內容」長度不符'],
    maxlength: [100, '「留言內容」長度不符']
  }
})

// 20.貼文
const eventPostSchema = new Schema({
  // 1.貼文內容
  TEXT: {
    type: String,
    required: [true, '缺少「貼文內容」'],
    minlength: [1, '「貼文內容」長度不符'],
    maxlength: [500, '「貼文內容」長度不符']
  },
  // 2.貼文圖片
  IMAGE: {
    type: String
  },
  // 3.案讚的人
  LIKE: {
    type: [ObjectId],
    ref: 'users'
  },
  // 4.留言
  MESSAGE: {
    type: [eventPostMessageSchema]
  }
})

// events 本體
export const schema = new Schema({
  // 1.活動名稱
  TITLE: {
    type: String,
    required: [true, '缺少「活動名稱」'],
    minlength: [3, '「活動名稱」長度不符'],
    maxlength: [20, '「活動名稱」長度不符']
  },
  // 2.活動日期
  DATE: {
    type: String,
    required: [true, '缺少「活動日期」']
  },
  // 3.活動縣市
  CITY: {
    type: String,
    required: [true, '缺少「活動縣市」'],
    minlength: [3, '「活動縣市」長度不符'],
    maxlength: [3, '「活動縣市」長度不符'],
    enum: {
      values: ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣', '基隆市', '新竹市', '嘉義市'],
      message: '「活動縣市」分類錯誤'
    }
  },
  // 4.活動地址
  ADD: {
    type: String,
    required: [true, '缺少「活動地址」'],
    maxlength: [40, '「活動地址」長度不符']
  },
  // 5.活動地點備註
  ADD_REMARK: {
    type: String,
    maxlength: [30, '「活動地點備註」長度不符']
  },
  // 6.誰可參加
  IS_PUBLIC: {
    type: String,
    required: [true, '缺少「誰可參加」'],
    enum: {
      values: ['公開', '學生'],
      message: '「誰可參加」分類錯誤'
    }
  },
  // 7.活動分類
  CATEGORY: {
    type: [String],
    required: [true, '缺少「活動分類」'],
    enum: {
      values: ['音樂', '合唱', '管樂', '吉他', '熱音', '熱舞', '手語', '康輔', '桌遊', '運動', '棒球', '桌球', '籃球', '羽球', '排球', '天文', '文學', '話劇', '美術', '攝影', '校友會', '學生會', '系學會', '營隊', '學習'],
      message: '「活動分類」分類錯誤'
    }
  },
  // 8.預售人數
  PRE_SALE: {
    type: String,
    required: [true, '缺少「預售人數」'],
    maxlength: [4, '「預售人數」長度不符']
  },
  // 9.現場票
  ON_SITE_SALE: {
    type: String,
    required: [true, '缺少「現場票」'],
    maxlength: [4, '「現場票」長度不符']
  },
  // 10.取票資格(榮譽分數)
  SCORE_VALUES: {
    type: Number,
    required: [true, '缺少「取票資格」']
  },
  // 11.活動內容
  DESCRIPTION: {
    type: String,
    required: [true, '缺少「活動內容」'],
    minlength: [50, '「活動內容」長度不符'],
    maxlength: [1000, '「活動內容」長度不符']
  },
  // 12.活動banner
  IMAGE: {
    type: String,
    required: [true, '缺少「活動banner」']
  },
  // 13.主辦單位
  HOST: {
    type: ObjectId,
    required: [true, '缺少「主辦單位」'],
    ref: 'users'
  },
  // 14.協辦單位
  CO_ORGANIZER: {
    type: [ObjectId],
    ref: 'users'
  },
  // 15.票券管理
  TICKET: {
    type: [ticketManageSchema]
  },
  // 16.案讚的人
  LIKES: {
    type: [ObjectId],
    ref: 'users'
  },
  // 17.收藏的人
  KEEPS: {
    type: [ObjectId],
    ref: 'users'
  },
  // 18.觸及人數
  REACH: {
    type: Number,
    default: 0
  },
  // 19.草稿
  IS_EDIT: {
    type: Boolean,
    required: [true, '缺少「否是為草稿」'],
    default: false
  },
  // 20.貼文
  POST: {
    type: [eventPostSchema]
  },
  // 21.活動紀錄(照片)
  PHOTO: {
    type: [String]
  }
})

export default model('events', schema)
