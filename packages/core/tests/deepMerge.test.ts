import {deepMerge} from 'src/sprite';

describe('deepExtend', () => {
  test('deepExtend', () => {
    const ww = {ww: 1};
    const vv = {vv: ww};
    const yy = {yy: vv};
    expect(deepMerge({}, {yy}, {yy: {yy: {vv: 3}}})).toEqual({yy: {yy: {vv: 3}}});
    expect(deepMerge({}, yy, {yy: {vv: {ww: 2, www: 3}, vvv: 4}, yyy: 5})).toEqual({yy: {vv: {ww: 2, www: 3}, vvv: 4}, yyy: 5});
    expect(yy).toEqual({yy: {vv: {ww: 1}}});
  });
});
