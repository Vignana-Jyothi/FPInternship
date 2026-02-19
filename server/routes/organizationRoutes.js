const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');
const role = require('../middleware/role');

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
// 🔐 Admin Only – Add organization
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name required' });
    }

    const existing = await Organization.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i') // case-insensitive match
    });

    if (existing) {
      return res.status(400).json({ error: 'Organization already exists' });
    }

    const org = new Organization({ name: name.trim() });
    await org.save();

    res.status(201).json(org);
  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ error: 'Failed to add organization' });
  }
});


// 🔐 Admin Only – Delete organization
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organization deleted' });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});
module.exports = router;