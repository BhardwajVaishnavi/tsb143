import { API } from './api';

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'TRANSFER'
  | 'RECEIVE'
  | 'DAMAGE'
  | 'LOGIN'
  | 'LOGOUT';

export type EntityType = 
  | 'User'
  | 'Supplier'
  | 'Product'
  | 'WarehouseItem'
  | 'InventoryItem'
  | 'InwardEntry'
  | 'OutwardEntry'
  | 'DamageEntry'
  | 'Transfer'
  | 'PurchaseOrder'
  | 'ClosingStock';

/**
 * Log an employee action to the audit log
 * 
 * @param userId The ID of the user performing the action
 * @param action The action being performed
 * @param entityType The type of entity being acted upon
 * @param entityId The ID of the entity being acted upon
 * @param details Additional details about the action
 * @returns Promise that resolves when the log is created
 */
export const logEmployeeAction = async (
  userId: string,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  details: string
): Promise<void> => {
  try {
    await API.auditLogs.create({
      userId,
      action,
      entity: entityType,
      entityId,
      details
    });
    console.log(`Audit log created: ${action} ${entityType} ${entityId}`);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

/**
 * Generate a standardized detail message for audit logs
 * 
 * @param action The action being performed
 * @param entityType The type of entity being acted upon
 * @param entityName The name or identifier of the entity
 * @param quantity Optional quantity for inventory-related actions
 * @param additionalInfo Optional additional information
 * @returns Formatted detail message
 */
export const generateAuditDetails = (
  action: AuditAction,
  entityType: EntityType,
  entityName: string,
  quantity?: number,
  additionalInfo?: string
): string => {
  let details = '';

  switch (action) {
    case 'CREATE':
      details = `Created ${entityType.toLowerCase()} ${entityName}`;
      break;
    case 'UPDATE':
      details = `Updated ${entityType.toLowerCase()} ${entityName}`;
      break;
    case 'DELETE':
      details = `Deleted ${entityType.toLowerCase()} ${entityName}`;
      break;
    case 'APPROVE':
      details = `Approved ${entityType.toLowerCase()} ${entityName}`;
      break;
    case 'REJECT':
      details = `Rejected ${entityType.toLowerCase()} ${entityName}`;
      break;
    case 'TRANSFER':
      details = quantity 
        ? `Transferred ${quantity} ${entityName} from warehouse to inventory`
        : `Transferred ${entityName} from warehouse to inventory`;
      break;
    case 'RECEIVE':
      details = quantity
        ? `Received ${quantity} ${entityName} into warehouse`
        : `Received ${entityName} into warehouse`;
      break;
    case 'DAMAGE':
      details = quantity
        ? `Reported damage for ${quantity} ${entityName}`
        : `Reported damage for ${entityName}`;
      break;
    case 'LOGIN':
      details = `User logged in`;
      break;
    case 'LOGOUT':
      details = `User logged out`;
      break;
    default:
      details = `${action} ${entityType.toLowerCase()} ${entityName}`;
  }

  if (additionalInfo) {
    details += ` - ${additionalInfo}`;
  }

  return details;
};
