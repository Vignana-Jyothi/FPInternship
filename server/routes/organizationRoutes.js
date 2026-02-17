const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');


// 🔓 Public – Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({});
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});


// 🔐 Admin Only – Add organization
router.post('/', auth, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const existing = await Organization.findOne({
      name: name.trim()
    });

    if (existing) {
      return res.status(409).json({ error: 'Organization already exists' });
    }

    const newOrg = await Organization.create({
      name: name.trim()
    });

    res.status(201).json(newOrg);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔐 Admin Only – Delete organization
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organization deleted' });

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

module.exports = router;