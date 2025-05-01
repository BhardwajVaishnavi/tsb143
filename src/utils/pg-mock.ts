/**
 * Mock implementation of the pg module for browser environments
 * This file provides a client-side mock of the PostgreSQL client
 */

// Mock Pool class
export class Pool {
  constructor(config: any) {
    console.log('Mock PG Pool created with config:', config);
  }

  async connect() {
    console.log('Mock PG Pool connect called');
    return {
      query: async (text: string, params?: any[]) => {
        console.log('Mock PG Client query called:', text, params);
        return { rows: [], rowCount: 0 };
      },
      release: () => {
        console.log('Mock PG Client release called');
      }
    };
  }

  async query(text: string, params?: any[]) {
    console.log('Mock PG Pool query called:', text, params);
    return { rows: [], rowCount: 0 };
  }

  async end() {
    console.log('Mock PG Pool end called');
  }
}

// Mock Client class
export class Client {
  constructor(config: any) {
    console.log('Mock PG Client created with config:', config);
  }

  async connect() {
    console.log('Mock PG Client connect called');
  }

  async query(text: string, params?: any[]) {
    console.log('Mock PG Client query called:', text, params);
    return { rows: [], rowCount: 0 };
  }

  async end() {
    console.log('Mock PG Client end called');
  }
}

export default {
  Pool,
  Client
};
