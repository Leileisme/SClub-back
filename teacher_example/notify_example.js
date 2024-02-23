;[
  {
    type: 'LIKE_EVENT',
    LIKE_EVENT: '1234',
    LIKE_USER: 'AAAA'
  },
  {
    type: 'LIKE_POST',
    LIKE_POST: '1234',
    LIKE_USER: 'VVVV'
  }
]

schema({
  TYPE: {
    type: String
  },
  LIKE_EVENT: {
    type: ObjectId,
    ref: 'events',
    required() {
      return [this.TYPE === 'LIKE_EVENT', '蘭未必填']
    }
  },
  LIKE_USER: {
    type: ObjectId,
    ref: 'users',
    required() {
      return [this.TYPE === 'LIKE_EVENT' || this.TYPE === 'LIKE_POST', '蘭未必填']
    }
  }
})

users.findById(req.user._id, 'notify').populate('notify.LIKE_EVENT').populate('notify.LIKE_USER', 'username')
