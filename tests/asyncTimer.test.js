/* eslint-disable */
const asyncTimer = require('../dist/SteamCondenser/asyncTimer.js');

test('resolving doWithin should return resolved value', async () => {
  const expectedResult = 1;

  const val = await asyncTimer.doWithin(new Promise(resolve => resolve(expectedResult)), 1);

  expect(val).toBe(expectedResult);
});

test('rejecting doWithin should throw error', async () => {
  const rejectMessage = 'rejected';

  let err;
  try {
    const val = await asyncTimer.doWithin(new Promise((resolve, reject) => reject(new Error(rejectMessage))), 1)
  }
  catch (e) {
    err = e;
  }
  
  expect(err).not.toBeUndefined();
  expect(err.message).toBe(rejectMessage);
});

test('not resolving or rejecting promise should throw error', async () => {
  let err;
  try {
    const val = await asyncTimer.doWithin(new Promise((resolve, reject) => () => {}), 1)
  }
  catch (e) {
    err = e;
  }
  
  expect(err).not.toBeUndefined();
  expect(err.message).toBe('Timed out.');
});
