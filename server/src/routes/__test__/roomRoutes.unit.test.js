import { roomRouter } from '../roomRoutes.js';

describe('roomRoutes', () => {
  it('should register room routes with expected auth middleware', () => {
    const layers = roomRouter.stack.filter(l => l.route);

    const postRoot = layers.find(l => l.route.path === '/' && l.route.methods.post);
    const patchId = layers.find(l => l.route.path === '/:id' && l.route.methods.patch);
    const deleteId = layers.find(l => l.route.path === '/:id' && l.route.methods.delete);
    const verify = layers.find(l => l.route.path === '/:id/verify' && l.route.methods.post);
    const guess = layers.find(l => l.route.path === '/:id/guess' && l.route.methods.post);

    expect(postRoot.route.stack[0].handle.name).toBe('validateJWT');
    expect(patchId.route.stack[0].handle.name).toBe('validateJWT');
    expect(deleteId.route.stack[0].handle.name).toBe('validateJWT');

    expect(verify.route.stack[0].handle.name).not.toBe('validateJWT');
    expect(guess.route.stack[0].handle.name).not.toBe('validateJWT');
  });
});


