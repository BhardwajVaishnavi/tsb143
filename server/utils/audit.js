const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create an audit log entry
 * @param {String} userId - User ID
 * @param {String} action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {String} entity - Entity type (User, Supplier, WarehouseItem, etc.)
 * @param {String} entityId - ID of the entity
 * @param {String} details - Additional details about the action
 * @returns {Promise<Object>} Created audit log
 */
const createAuditLog = async (userId, action, entity, entityId, details) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw the error, just log it
    // We don't want the main operation to fail if audit logging fails
  }
};

module.exports = {
  createAuditLog
};
