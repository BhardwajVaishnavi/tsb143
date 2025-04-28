import { NextApiRequest, NextApiResponse } from 'next';

// Mock suppliers data
const mockSuppliers = [
  {
    id: 'sup-1',
    name: 'Tech Solutions Inc.',
    contactPerson: 'John Smith',
    email: 'john@techsolutions.com',
    phone: '123-456-7890',
    address: '123 Tech St, Silicon Valley, CA',
    status: 'active'
  },
  {
    id: 'sup-2',
    name: 'Office Furniture Co.',
    contactPerson: 'Jane Doe',
    email: 'jane@officefurniture.com',
    phone: '987-654-3210',
    address: '456 Office Blvd, Business Park, NY',
    status: 'active'
  },
  {
    id: 'sup-3',
    name: 'Global Electronics',
    contactPerson: 'Mike Johnson',
    email: 'mike@globalelectronics.com',
    phone: '555-123-4567',
    address: '789 Electronic Ave, Tech City, TX',
    status: 'active'
  },
  {
    id: 'sup-4',
    name: 'Office Supplies Direct',
    contactPerson: 'Sarah Williams',
    email: 'sarah@officesupplies.com',
    phone: '444-555-6666',
    address: '101 Supply St, Commerce City, IL',
    status: 'inactive'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all suppliers
    return res.status(200).json(mockSuppliers);
  } else if (req.method === 'POST') {
    // Create a new supplier
    const newSupplier = {
      id: 'sup-' + Date.now(),
      ...req.body,
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, you would save this to a database
    
    return res.status(201).json(newSupplier);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
