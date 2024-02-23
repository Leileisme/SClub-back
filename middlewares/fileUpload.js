import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const fileUpload = multer({
  // 將檔案直接上傳到雲端
  storage: new CloudinaryStorage({ cloudinary }),
  // 檔案過濾器
  fileFilter (req, file, callback) {
    // file.mimetype(檔案類型) 是Multer提供的檔案屬性
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      // callback(錯誤訊息, 是否通過)
      callback(null, true)
    } else {
      callback(new multer.MulterError('LIMIT_FILE_FORMAT'), false)
    }
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

export default (req, res, next) => {
  fileUpload.single('IMAGE')(req, res, (error) => {
    // instanceof： 是JS運算子，用於測試一個物件是否是另一個物件的實例
    if (error instanceof multer.MulterError) {
      console.log(error, 'fileUpload上傳錯誤')
      let message = '上傳錯誤'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FILE_FORMAT') {
        message = '檔案格式錯誤'
      }
      res.status(400).json({
        success: false,
        message
      })
    } else if (error) {
      console.log(error, 'fileUpload未知錯誤')
      res.status(500).json({
        success: false,
        message: 'fileUpload未知錯誤'
      })
      // 這裡有動 2/15
    } else if (req.file && req.file.path.includes('https://source.boringavatars.com/beam/120/')) {
      next()
    } else {
      next()
    }
  })
}
