const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get all locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Create a new location
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      type,
      address,
      city,
      state,
      postalCode,
      country,
      contactName,
      contactPhone,
      contactEmail,
      notes,
      status = 'active'
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const location = await prisma.location.create({
      data: {
        name,
        type,
        address,
        city,
        state,
        postalCode,
        country,
        contactName,
        contactPhone,
        contactEmail,
        notes,
        status
      }
    });
    
    return res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return res.status(500).json({ error: 'Failed to create location' });
  }
});

// Get a location by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await prisma.location.findUnique({
      where: { id }
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    return res.status(200).json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Update a location
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      address,
      city,
      state,
      postalCode,
      country,
      contactName,
      contactPhone,
      contactEmail,
      notes,
      status
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        type,
        address,
        city,
        state,
        postalCode,
        country,
        contactName,
        contactPhone,
        contactEmail,
        notes,
        status
      }
    });
    
    return res.status(200).json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete a location
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryItems = await prisma.inventoryItem.count({
      where: { locationId: id }
    });
    
    if (inventoryItems > 0) {
      return res.status(400).json({ error: 'Cannot delete location that is being used by inventory items' });
    }
    
    await prisma.location.delete({
      where: { id }
    });
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({ error: 'Failed to delete location' });
  }
});

module.exports = router;
