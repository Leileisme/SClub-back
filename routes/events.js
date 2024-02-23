import { Router } from 'express'
import { create, getEventAll, getEventById, edit } from '../controllers/events.js'
import fileUpload from '../middlewares/fileUpload.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.jwt, fileUpload, create)
router.get('/getEventAll', getEventAll)
router.get('/:id', getEventById)
router.patch('/:id', auth.jwt, fileUpload, edit)

export default router
