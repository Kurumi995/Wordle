import { userRouter } from '../userRoutes.js';

describe('userRoutes', () => {
  it('should register user routes and protect patch/delete with validateJWT', () => {
    const layers = userRouter.stack.filter(l => l.route);

    const getRoot = layers.find(l => l.route.path === '/' && l.route.methods.get);
    const getId = layers.find(l => l.route.path === '/:id' && l.route.methods.get);
    const postRoot = layers.find(l => l.route.path === '/' && l.route.methods.post);
    const patchId = layers.find(l => l.route.path === '/:id' && l.route.methods.patch);
    const deleteId = layers.find(l => l.route.path === '/:id' && l.route.methods.delete);

    expect(getRoot).toBeTruthy();
    expect(getId).toBeTruthy();
    expect(postRoot).toBeTruthy();
    expect(patchId).toBeTruthy();
    expect(deleteId).toBeTruthy();

    expect(patchId.route.stack[0].handle.name).toBe('validateJWT');
    expect(deleteId.route.stack[0].handle.name).toBe('validateJWT');
  });
});


