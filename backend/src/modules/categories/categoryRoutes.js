const express = require('express');
const router = express.Router();
const { getCategories } = require('./categoryController');

router.get('/', getCategories);

module.exports = router;
