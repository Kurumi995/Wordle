import sinon from 'sinon';
import { roomService } from '../../services/roomService.js';
import { gameService } from '../../services/gameService.js';

const makeSocket = (id) => {
  const handlers = {};
  const socket = {
    id,
    data: {},
    on: (event, cb) => {
      handlers[event] = cb;
    },
    join: sinon.stub(),
    emit: sinon.stub(),
    __handlers: handlers
  };
  return socket;
};

const makeIo = () => {
  const emitStub = sinon.stub();
  const io = {
    on: sinon.stub(),
    to: sinon.stub().returns({ emit: emitStub })
  };
  return { io, emitStub };
};

describe('gameSocket', () => {
  let getRoomByIdStub;
  let checkGuessStub;
  let consoleLogStub;

  beforeEach(() => {
    getRoomByIdStub = sinon.stub(roomService, 'getById');
    checkGuessStub = sinon.stub(gameService, 'checkGuess');
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    getRoomByIdStub.restore();
    checkGuessStub.restore();
    consoleLogStub.restore();
  });

  const importFreshGameSocket = async () => {
    const url = new URL(`../gameSocket.js?cacheBust=${Date.now()}_${Math.random()}`, import.meta.url);
    return await import(url.href);
  };

  it('should join game and emit gameState/playerJoined', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();

    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket = makeSocket('s1');
    const roomId = 'r_join';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });

    connectionHandler(socket);
    await socket.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    expect(socket.join.calledOnceWith(roomId)).toBe(true);
    expect(socket.data.userId).toBe('u1');
    expect(socket.data.username).toBe('alice');
    expect(socket.data.roomId).toBe(roomId);
    expect(io.to.calledWith(roomId)).toBe(true);
    expect(emitStub.calledWith('gameState', sinon.match.object)).toBe(true);
    expect(emitStub.calledWith('playerJoined', { userId: 'u1', username: 'alice' })).toBe(true);
  });

  it('should emit error when room does not exist', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket = makeSocket('s1');
    getRoomByIdStub.resolves(null);

    connectionHandler(socket);
    await socket.__handlers.joinGame({ roomId: 'r_missing', userId: 'u1', username: 'alice' });

    expect(socket.emit.calledWith('error', 'Room not found.')).toBe(true);
  });



  it('should reject submitGuess when not current player turn', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const socket2 = makeSocket('s2');
    const roomId = 'r_turn';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    connectionHandler(socket2);
    await socket2.__handlers.joinGame({ roomId, userId: 'u2', username: 'bob' });

    await socket2.__handlers.submitGuess({ roomId, guess: 'apple' });

    expect(socket2.emit.calledWith('error', 'It is not your turn.')).toBe(true);
  });

  it('should update state and emit gameOver when game ends', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const roomId = 'r_won';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });
    checkGuessStub.returns({ result: [{ letter: 'A', status: 'correct' }], won: true });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });
    await socket1.__handlers.submitGuess({ roomId, guess: 'apple' });

    expect(emitStub.calledWith('gameOver', { won: true, targetWord: 'APPLE' })).toBe(true);
  });

  it('should rotate turn when guess does not end game', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const socket2 = makeSocket('s2');
    const roomId = 'r_rotate';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });
    checkGuessStub.returns({ result: [{ letter: 'A', status: 'absent' }], won: false });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    connectionHandler(socket2);
    await socket2.__handlers.joinGame({ roomId, userId: 'u2', username: 'bob' });

    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });

    const lastGameStateCall = emitStub.getCalls().reverse().find(c => c.args[0] === 'gameState');
    expect(lastGameStateCall).toBeTruthy();
    expect(lastGameStateCall.args[1].currentRow).toBe(1);
    expect(lastGameStateCall.args[1].currentPlayer).toBe('bob');
  });

  it('should end game when reaching last row (row 5)', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const roomId = 'r_lastrow';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });
    checkGuessStub.returns({ result: Array(5).fill({ letter: 'A', status: 'absent' }), won: false });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    const checkSubmitGuess = (expectedCalls) => {
      expect(checkGuessStub.callCount).toBe(expectedCalls);
      const last = checkGuessStub.lastCall.args;
      expect(last[0]).toBe('ZZZZZ');
      expect(last[1]).toBe('APPLE');
    };

    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(1);
    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(2);
    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(3);
    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(4);
    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(5);
    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    checkSubmitGuess(6);

    expect(emitStub.calledWith('gameOver', { won: false, targetWord: 'APPLE' })).toBe(true);
  });

  it('should ignore disconnect when roomId missing', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket = makeSocket('s1');
    connectionHandler(socket);
    socket.data = {};
    socket.__handlers.disconnect();

    expect(true).toBe(true);
  });

  it('should delete room when last player disconnects', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const roomId = 'r_disconnect_delete';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    socket1.__handlers.disconnect();

    expect(emitStub.calledWith('playerLeft', { userId: 'u1', username: 'alice' })).toBe(true);
  });

  it('should emit gameState after disconnect when players remain and reset currentPlayerIndex if needed', async () => {
    const { initGameSocket } = await importFreshGameSocket();
    const { io, emitStub } = makeIo();
    initGameSocket(io);
    const connectionHandler = io.on.firstCall.args[1];

    const socket1 = makeSocket('s1');
    const socket2 = makeSocket('s2');
    const roomId = 'r_disconnect_state';
    getRoomByIdStub.resolves({ id: roomId, targetWord: 'APPLE' });
    checkGuessStub.returns({ result: [{ letter: 'A', status: 'absent' }], won: false });

    connectionHandler(socket1);
    await socket1.__handlers.joinGame({ roomId, userId: 'u1', username: 'alice' });

    connectionHandler(socket2);
    await socket2.__handlers.joinGame({ roomId, userId: 'u2', username: 'bob' });

    await socket1.__handlers.submitGuess({ roomId, guess: 'zzzzz' });
    socket2.__handlers.disconnect();

    const lastGameStateCall = emitStub.getCalls().reverse().find(c => c.args[0] === 'gameState');
    expect(lastGameStateCall).toBeTruthy();
    expect(lastGameStateCall.args[1].players.length).toBe(1);
    expect(lastGameStateCall.args[1].currentPlayer).toBe('alice');
  });
});


