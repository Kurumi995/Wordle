import { errorHandler } from '../errorHandler.js';
import sinon from 'sinon';

describe('errorHandler middleware', () => {
  it('should respond with provided statusCode and message', () => {
    const err = { statusCode: 418, message: 'teapot' };
    const req = {};
    const resJsonStub = sinon.stub();
    const resStatusStub = sinon.stub().returns({ json: resJsonStub });
    const res = { status: resStatusStub };
    const next = sinon.stub();
    const consoleErrorStub = sinon.stub(console, 'error');

    errorHandler(err, req, res, next);

    expect(consoleErrorStub.calledOnce).toBe(true);
    expect(resStatusStub.calledOnceWith(418)).toBe(true);
    const payload = resJsonStub.firstCall.args[0];
    expect(payload.error).toBe('teapot');
    expect(typeof payload.timestamp).toBe('string');

    consoleErrorStub.restore();
  });

  it('should default to 500 and Internal server error', () => {
    const err = {};
    const req = {};
    const resJsonStub = sinon.stub();
    const resStatusStub = sinon.stub().returns({ json: resJsonStub });
    const res = { status: resStatusStub };
    const next = sinon.stub();
    const consoleErrorStub = sinon.stub(console, 'error');

    errorHandler(err, req, res, next);

    expect(resStatusStub.calledOnceWith(500)).toBe(true);
    const payload = resJsonStub.firstCall.args[0];
    expect(payload.error).toBe('Internal server error');

    consoleErrorStub.restore();
  });
});


