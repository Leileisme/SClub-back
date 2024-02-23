export default (req, res, next) => {
  if (!req.user.IS_ADMIN) {
    res.status(403).json({
      success: false,
      message: '沒有權限'
    })
  } else {
    next()
  }
}
