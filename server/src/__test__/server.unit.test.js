import { createApp, createServer, startServer } from '../server.js';
import path from 'path';
import sinon from 'sinon';

describe('server module', () => {
  it('should create app and server without listening', () => {
    const app = createApp({ serverPath: process.cwd() });
    const { server, io } = createServer({ app, initSocket: false });

    expect(typeof app).toBe('function');
    expect(typeof server.listen).toBe('function');
    expect(typeof io.on).toBe('function');

    io.close();
  });

  it('should register GET / and call sendFile with resolved path', async () => {
    const app = createApp({ serverPath: 'C:\\tmp' });
    const layer = app.router.stack.find(l => l.route && l.route.path === '/' && l.route.methods.get);
    expect(layer).toBeTruthy();

    const handler = layer.route.stack[0].handle;
    const req = {};
    const resSendFileStub = sinon.stub();
    const res = { sendFile: resSendFileStub };

    handler(req, res);

    expect(resSendFileStub.calledOnce).toBe(true);
    expect(resSendFileStub.firstCall.args[0]).toBe(path.join('C:\\tmp', 'client/build/index.html'));
  });

  it('startServer should listen on provided port and return handles', async () => {
    const consoleLogStub = sinon.stub(console, 'log');
    const { server, io } = startServer({ port: 0, serverPath: process.cwd(), initSocket: false });

    await new Promise((resolve) => server.close(resolve));
    io.close();
    consoleLogStub.restore();
  });
});


