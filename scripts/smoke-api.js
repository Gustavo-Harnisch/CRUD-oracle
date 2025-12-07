#!/usr/bin/env node
/**
 * Smoke test de API con las cuentas del README.
 * Usa fetch nativo (Node 18+). Ajusta API_URL si tu backend corre en otro host/puerto.
 *
 * Ejecuta:
 *    API_URL=http://localhost:3000/api node scripts/smoke-api.js
 */

const baseUrl = process.env.API_URL || 'http://localhost:3000/api';

const credentials = {
  admin: { email: 'gustavo.admin@example.com', password: 'Gustavo_make_ALL2004.' },
  employee: { email: 'gustavo.empleado@example.com', password: 'gustavo_empleado' },
  customer: { email: 'gustavo.cliente@example.com', password: 'gustavo_cliente' }
};

async function apiRequest(method, path, { token, body } = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = await res.text();
  }

  if (!res.ok) {
    const message = data?.message || data || res.statusText;
    throw new Error(`[${res.status}] ${message}`);
  }

  return data;
}

async function login(label, { email, password }) {
  process.stdout.write(`- ${label}: login... `);
  const data = await apiRequest('POST', '/auth/login', { body: { email, password } });
  console.log('OK');
  return data.token;
}

async function step(label, fn) {
  process.stdout.write(`  · ${label}... `);
  const data = await fn();
  console.log('OK');
  return data;
}

async function run() {
  console.log(`API_URL: ${baseUrl}`);

  // Admin
  const adminToken = await login('Admin', credentials.admin);
  await step('Admin -> /auth/me', () => apiRequest('GET', '/auth/me', { token: adminToken }));
  await step('Admin -> /users', () => apiRequest('GET', '/users', { token: adminToken }));
  await step('Admin -> /services?includeInactive=1', () =>
    apiRequest('GET', '/services?includeInactive=1', { token: adminToken })
  );
  await step('Admin -> /reservations?all=1', () =>
    apiRequest('GET', '/reservations?all=1', { token: adminToken })
  );

  // Employee
  const employeeToken = await login('Empleado', credentials.employee);
  await step('Empleado -> /auth/me', () => apiRequest('GET', '/auth/me', { token: employeeToken }));
  await step('Empleado -> /reservations?all=1', () =>
    apiRequest('GET', '/reservations?all=1', { token: employeeToken })
  );
  await step('Empleado -> /services', () => apiRequest('GET', '/services', { token: employeeToken }));

  // Cliente
  const customerToken = await login('Cliente', credentials.customer);
  await step('Cliente -> /auth/me', () => apiRequest('GET', '/auth/me', { token: customerToken }));
  await step('Cliente -> /reservations (solo propias)', () =>
    apiRequest('GET', '/reservations', { token: customerToken })
  );
  await step('Cliente -> /services (activos)', () => apiRequest('GET', '/services', { token: customerToken }));

  console.log('\nSmoke test finalizado.');
}

run().catch((err) => {
  console.error('\nFalla en smoke test:', err.message);
  process.exit(1);
});
