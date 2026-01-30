// Test which routes are registered
const express = require('express');
const routes = require('./src/routes');

const app = express();
app.use('/api', routes);

console.log('Registered routes:');
console.log('==================');

function listRoutes(stack, basePath = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // Route registered directly on the app
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`${methods.padEnd(8)} ${basePath}${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      listRoutes(middleware.handle.stack, basePath + (middleware.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '').replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$/g, '')));
    }
  });
}

listRoutes(app._router.stack, '');

console.log('\nLooking for staging routes:');
console.log('===========================');

const stagingRoutes = [];
function findStagingRoutes(stack, basePath = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      const path = basePath + middleware.route.path;
      if (path.includes('staging')) {
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        stagingRoutes.push(`${methods.padEnd(8)} ${path}`);
      }
    } else if (middleware.name === 'router') {
      const newBase = basePath + (middleware.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '').replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$/g, ''));
      findStagingRoutes(middleware.handle.stack, newBase);
    }
  });
}

findStagingRoutes(app._router.stack, '');

if (stagingRoutes.length > 0) {
  stagingRoutes.forEach(route => console.log(route));
} else {
  console.log('❌ No staging routes found!');
}
