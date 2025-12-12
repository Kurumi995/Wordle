import { authRouter } from '../authRoutes.js';

describe('authRoutes', () => {
  it('should register register and login routes', () => {
    const routes = authRouter.stack
      .filter(l => l.route)
      .map(l => ({ path: l.route.path, methods: Object.keys(l.route.methods).sort() }));

    expect(routes).toEqual([
      { path: '/register', methods: ['post'] },
      { path: '/login', methods: ['post'] }
    ]);
  });
});


