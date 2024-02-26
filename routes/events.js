import { Router } from 'express'
import { create, getEventAll, getEventById, edit, useTicket, deleteEvent, get } from '../controllers/events.js'
import fileUpload from '../middlewares/fileUpload.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.jwt, fileUpload, create)
router.get('/getEventAll', getEventAll)
router.get('/', get)
router.get('/:id', getEventById)
router.patch('/:id/useTicket', auth.jwt, useTicket)
router.patch('/:id', auth.jwt, fileUpload, edit)
router.delete('/:id', auth.jwt, deleteEvent)

export default router
