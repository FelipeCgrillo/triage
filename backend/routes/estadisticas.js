const express = require('express');
const router = express.Router();
const Caso = require('../models/Caso');

router.get('/', async (req, res) => {
  try {
    const porUrgencia = await Caso.aggregate([
      {
        $group: {
          _id: '$nivelUrgencia',
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          nivel: '$_id',
          cantidad: 1,
          _id: 0
        }
      }
    ]);

    const porEstado = await Caso.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          estado: '$_id',
          cantidad: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      porUrgencia,
      porEstado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 