import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'
import NotifyType from '../enums/NotifyType.js'
import IsAble from '../enums/IsAble.js'

// 幹部
const memberSchema = new Schema({
  // 1.使用者id
  USER: {
    type: ObjectId,
    ref: 'users'
  },
  // 2.幹部職稱
  ROLE: {
    type: String,
    maxlength: [5, '「幹部職稱」長度不符'],
    minlength: [2, '「幹部職稱」長度不符']
  },
  // 3.確認狀態(功能先不用，key先存)
  CONFIRM: {
    type: Boolean,
    default: false
  },
  // 4.確認中的使用者(功能先不用，key先存)
  CONFIRM_USER: {
    type: ObjectId,
    ref: 'users',
    default: null
  }
})

// 票券
const ticketCartSchema = new Schema({
  // 1.活動ID
  EVENT: {
    type: ObjectId,
    ref: 'events'
  },
  // 2.票券ID(從events取得票券的_id)
  TICKET: {
    type: ObjectId,
    ref: 'events'
  },
  USED: {
    type: Number
  }
})

// 通知
const notifySchema = new Schema({
  // 1.通知類別
  TYPE: {
    type: Number,
    required: [true, '缺少「通知類別」'],
    enum: {
      values: [0, 1, 2],
      message: '通知分類錯誤'
    }
  },
  // 2.追蹤的使用者
  FOLLOW_USER: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.FOLLOW
    },
    ref: 'users'
  },
  // 3.被按讚的活動
  LIKE_EVENT: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.LIKE
    },
    ref: 'events'
  },
  // 4.被按讚的貼文
  LIKE_POST: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.LIKE
    },
    ref: 'posts'
  },
  // 5.按讚的人
  LIKE_USER: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.LIKE
    },
    ref: 'users'
  },
  // 6.即將開始的活動
  EVENT_START: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.EVENT_START
    },
    ref: 'events'
  },
  // 7.待確認的社團
  CONFIRM_CLUB: {
    type: ObjectId,
    required () {
      return this.TYPE === NotifyType.EVENT_START
    },
    ref: 'users'
  },
  // 8.待確認的社 團幹部名稱
  CONFIRM_ROLE: {
    type: String,
    required () {
      return this.TYPE === NotifyType.EVENT_START
    }
  }
})

// users 本體
const schema = new Schema({
  // 1.信箱(學校信箱)
  EMAIL: {
    type: String,
    required: [true, '缺少「使用者信箱」'],
    unique: true,
    maxlength: [40, '「使用者信箱」長度不符'],
    validator: {
      validator (value) {
        return validator.isEmail(value) && (this.ROLE === UserRole.STUDENT ? value.includes('edu') : true)
      },
      message: '「使用者信箱」格式錯誤'
    }
  },
  // 2.密碼，長度下方驗證後加密
  PASSWORD: {
    type: String,
    required: [true, '缺少「使用者密碼」']
  },
  // 3.學號
  STUDENT_NO: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.STUDENT
      }, '缺少「使用者學號」'
    ],
    validator: {
      validator (value) {
        return validator.isAlphanumeric(value)
      }
    }
  },
  // 4.學校名字
  SCHOOL_NAME: {
    type: String,
    required: [true, '缺少「使用者學校」'],
    maxlength: [20, '「使用者學校」長度不符']
  },
  // 5.學校縣市
  SCHOOL_CITY: {
    type: String,
    required: [true, '缺少「使用者學校縣市」'],
    minlength: [3, '「使用者學校縣市」長度不符'],
    maxlength: [3, '「使用者學校縣市」長度不符'],
    enum: {
      values: ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣', '基隆市', '新竹市', '嘉義市'],
      message: '「使用者學校縣市」分類錯誤'
    }
  },
  // 6.姓名/社團名
  REAL_NAME: {
    type: String,
    required: [true, '缺少「使用者姓名/社團名」'],
    maxlength: [6, '「使用者姓名/社團名」長度不符']
  },
  // 7.用戶名稱
  USER_NAME: {
    type: String,
    required: [true, '缺少「使用者用戶名稱」'],
    unique: true,
    maxlength: [12, '「使用者用戶名稱」長度不符']
  },
  // 8.檔案暱稱
  NICK_NAME: {
    type: String,
    required: [true, '缺少「使用者檔案暱稱」'],
    maxlength: [6, '「使用者檔案暱稱」長度不符']
  },
  // 9.出生日期
  BDAY: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.STUDENT || this.ROLE === UserRole.NOT_STUDENT
      }, '缺少「使用者出生日期」']
  },
  // 10.性別
  GENDER: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.STUDENT || this.ROLE === UserRole.NOT_STUDENT
      }, '缺少「使用者性別」'],
    minlength: [3, '「使用者性別」長度不符'],
    maxlength: [3, '「使用者性別」長度不符']
  },
  // 11.手機
  MOBILE: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.STUDENT || this.ROLE === UserRole.NOT_STUDENT
      }, '缺少「使用者手機」'],
    minlength: [8, '「使用者手機」長度不符'],
    maxlength: [8, '「使用者手機」長度不符'],
    validator: {
      validator (value) {
        return validator.isMobilePhone(value, 'zh-TW')
      }
    }
  },
  // 12.年級
  STUDENT_GRADE: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.STUDENT
      }, '缺少「使用者年級」'
    ],
    minlength: [2, '「使用者年級」長度不符'],
    maxlength: [2, '「使用者年級」長度不符'],
    enum: {
      values: ['高一', '高二', '高三', '大一', '大二', '大三', '大四', '碩士'],
      message: '「使用者年級」分類錯誤'
    },
    validator: {
      validator (value) {
        return validator.isAlphanumeric(value)
      }
    }
  },
  // 13.備用信箱
  EMAIL_UB: {
    type: String,
    maxlength: [40, '「使用者備用信箱」長度不符'],
    validator: {
      validator (value) {
        return validator.isEmail(value)
      }
    }
  },
  // 14.社團屆數
  CLUB_TH: {
    type: Number,
    required: [
      function () {
        return this.ROLE === UserRole.CLUB
      }, '缺少「社團屆數」'
    ]
  },
  // 15.幹部
  CLUB_CORE_MEMBER: {
    type: [memberSchema],
    default: function () {
      if (this.ROLE === UserRole.CLUB) {
        return [{ USER: null, ROLE: '社長', CONFIRM: 'false', CONFIRM_USER: null }, { USER: null, ROLE: '副社長', CONFIRM: 'false', CONFIRM_USER: null }]
      } else return []
    }
  },
  // 16.社團類別
  CLUB_CATEGORY: {
    type: String,
    required: [
      function () {
        return this.ROLE === UserRole.CLUB
      }, '缺少「社團類別」'
    ],
    maxlength: [3, '「社團類別」長度不符'],
    enum: {
      values: ['學術', '學藝', '音樂', '康樂', '服務', '體育', '康輔', '聯誼', '其他'],
      message: '「社團類別」分類錯誤'
    }
  },
  // 17.大頭貼
  IMAGE: {
    type: String,
    required: [true, '缺少「使用者大頭貼」'],
    default: function () {
      return 'https://source.boringavatars.com/beam/120/' + this.EMAIL
    }
  },
  // 18.使用者角色
  ROLE: {
    type: Number,
    required: [true, '缺少「使用者角色」']
  },
  // 19.TOKENS
  TOKENS: {
    type: [String]
  },
  // 20.票券
  TICKET_CART: {
    type: [ticketCartSchema]
  },
  // 21.榮譽分數
  SCORES: {
    type: Number,
    required: [true, '缺少「使用者榮譽分數」'],
    default: 80
  },
  // 22.是否畢業
  IS_STUDENT: {
    type: Boolean,
    required: [true, '缺少「使用者是否畢業」']
  },
  // 23.通知
  NOTIFY: {
    type: [notifySchema]
  },
  // 24.收藏貼文
  KEEP_POST: {
    type: [ObjectId],
    ref: 'posts'
  },
  // 25.收藏活動(活動頁暫時沒做，先存key)
  KEEP_EVENT: {
    type: [ObjectId],
    ref: 'events'
  },
  // 26.帳號狀態
  IS_ABLE: {
    type: Number,
    required: [true, '缺少「帳號狀態」'],
    default () {
      if (this.ROLE === UserRole.CLUB) {
        return IsAble.CONFIRM_N
      } else {
        return IsAble.Y
      }
    }
  },
  // 27.管理員狀態
  IS_ADMIN: {
    type: Boolean,
    required: [true, '缺少「管理員狀態」'],
    default: false
  },
  // 28.粉絲
  FANS: {
    type: [ObjectId],
    ref: 'users'
  },
  // 29.追蹤人數
  FOLLOW: {
    type: [ObjectId],
    ref: 'users'
  },
  // 30.舉辦活動
  MAKE_EVENT: {
    type: [ObjectId],
    ref: 'events'
  },
  // 31.貼文
  MAKE_POST: {
    type: [ObjectId],
    ref: 'posts'
  },
  // 32.參與活動
  GO_EVENT: {
    type: [ObjectId],
    ref: 'events'
  },
  // 33.被標記
  BE_MARK: {
    type: [ObjectId],
    ref: 'users'
  },
  // 34.描述
  DESCRIBE: {
    type: String,
    maxlength: [50, '「使用者描述」長度不符']
  },
  // 35.限時動態
  MAKE_TIME_POST: {
    type: [ObjectId],
    ref: 'timePosts'
  }
},
{
  // 最後更新時間
  timestamps: true,
  // 修改幾次
  versionKey: false
}
)

// 這邊也可放虛擬欄位 virtual
// https://mongoosejs.com/docs/tutorials/virtuals.html

// 密碼存檔前驗證
schema.pre('save', function (next) {
  // 如果有修改
  if (this.isModified('PASSWORD')) {
    if (this.PASSWORD.length < 6 || this.PASSWORD.length > 20) {
      // ValidationError() r建構函示，接受一個參數，用於指定錯誤的訊息或原因
      // 用 null 代表未指定任何特定錯誤訊息

      // addError() 將錯誤加到 error 物件中
      // addError('錯誤所涉及的屬性或名稱',建立一個新的 ValidatorError() 錯誤物件)
      // ValidatorError 是 Mongoose 提供的一種錯誤類型，表示驗證相關的錯誤
      const error = new Error.ValidationError(null)
      error.addError('PASSWORD', new Error.ValidatorError({ message: '「使用者密碼」長度不符' }))
      next(error)
    } else {
      // 加鹽 10 次
      // bcrypt.compareSync('值','值') 判斷加密的值 是否匹配 -> 之後會用
      this.PASSWORD = bcrypt.hashSync(this.PASSWORD, 10)
    }
  }
  next()
})

export default model('users', schema)
