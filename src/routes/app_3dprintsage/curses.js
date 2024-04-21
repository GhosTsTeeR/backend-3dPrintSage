const express = require('express');
const router = express.Router();
const cursesController = require('../../controllers/app_3dprintsage/curses');
const verifyToken = require('../../config/middleware/veryfyTk3dPrintSage');

router.post('/add-curse-to-bd/:uid', verifyToken, cursesController.addCurseToBD);
router.get('/data-curse/:id', verifyToken, cursesController.getDataCurses);
router.get('/data-curse-all', verifyToken, cursesController.getDataCursesAll);
router.get('/data-curse-user/:id', verifyToken, cursesController.getDataCursesUser);
router.post('/add-data-curse-user/:uid', verifyToken, cursesController.addDataCurseUser);
router.post('/modify-data-curse-user/:uid', verifyToken, cursesController.modifyDataCurseUser);
router.get('/get-curse-info-user/:uid', verifyToken, cursesController.getCurseInfoUser);
router.post('/add-finalizate-curse-user/:uid', verifyToken, cursesController.addFinalizateCurseUser);

module.exports = router;