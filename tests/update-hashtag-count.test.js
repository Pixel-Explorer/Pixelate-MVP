process.env.NODE_ENV = 'test';

jest.mock('firebase-admin', () => {
  const updateMock = jest.fn();
  const onceMock = jest.fn();
  const equalToMock = jest.fn(() => ({ once: onceMock }));
  const orderByChildMock = jest.fn(() => ({ equalTo: equalToMock }));
  const refMock = jest.fn(() => ({ orderByChild: orderByChildMock }));

  return {
    credential: { applicationDefault: jest.fn(), cert: jest.fn() },
    initializeApp: jest.fn(),
    storage: jest.fn(() => ({ bucket: jest.fn() })),
    database: jest.fn(() => ({ ref: refMock })),
    apps: [],
    __mocks: { updateMock, onceMock, equalToMock, orderByChildMock, refMock },
  };
});

const admin = require('firebase-admin');
const { updateHashtagCount } = require('../controllers/blogController');

describe('updateHashtagCount', () => {
  it('updates all fields atomically', async () => {
    const { updateMock, onceMock } = admin.__mocks;
    onceMock.mockResolvedValue({
      forEach: (cb) => cb({
        val: () => ({ count: '99', utilityTokensLocked: '0' }),
        ref: { update: updateMock },
      }),
    });

    await updateHashtagCount('tag1', 2);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({
      count: '101',
      utilityTokensLocked: '10000',
      avgPrice: (10000 / 101).toString(),
    });
  });
});
