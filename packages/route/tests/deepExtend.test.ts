import {extendDefault, excludeDefault, splitPrivate} from 'src/deep-extend';

describe('extendDefault', () => {
  test('过滤def中未定义的key', () => {
    let target: any = {aa: {bb: {cc: 1}}};
    let def: any = {bb: true};
    expect(extendDefault(target, def)).toEqual({bb: true});
    target = {aa: {bb: {cc: 1}}};
    def = {aa: true};
    expect(extendDefault(target, def)).toEqual({aa: {bb: {cc: 1}}});
    target = {aa: {bb: {cc: 1}}};
    def = {aa: undefined};
    expect(extendDefault(target, def)).toEqual({aa: {bb: {cc: 1}}});
    target = {aa: {bb: {cc: 1}}};
    def = {aa: {dd: 1}};
    expect(extendDefault(target, def)).toEqual({aa: {dd: 1}});
    target = {aa: {bb: {cc: 1, cc2: 2}}};
    def = {aa: {bb: {cc: 2}}};
    expect(extendDefault(target, def)).toEqual({aa: {bb: {cc: 1}}});
    target = {aa: {bb: {cc2: 2}}};
    def = {aa: {bb: {cc: 2}}};
    expect(extendDefault(target, def)).toEqual({aa: {bb: {cc: 2}}});
    target = {aa: {bb: {cc: undefined, cc2: 2}}};
    def = {aa: {bb: {cc: 2}}};
    expect(extendDefault(target, def)).toEqual({aa: {bb: {cc: 2}}});
  });
});

describe('excludeDefault', () => {
  test('excludeDefault', () => {
    const target = {aa: {bb: {cc: 1, cc2: 2}}, aaa: {bbb: {ccc: 1}}};
    const def = {aa: {bb: {cc: 1, cc2: 2}}, aaa: 1};
    expect(excludeDefault(target, def, true)).toEqual({aa: {}, aaa: {bbb: {ccc: 1}}});
    expect(excludeDefault(target, def, false)).toEqual({aaa: {bbb: {ccc: 1}}});
    expect(excludeDefault(target, {aa: {bb: {cc: 1}}}, false)).toEqual({aa: {bb: {cc2: 2}}, aaa: {bbb: {ccc: 1}}});
  });
});

describe('splitPrivate', () => {
  test('splitPrivate', () => {
    expect(splitPrivate(1 as any, {})).toEqual([undefined, undefined]);
    expect(splitPrivate({}, {})).toEqual([undefined, undefined]);
    expect(splitPrivate({aaa: {}, bbb: {}}, {})).toEqual([{aaa: {}, bbb: {}}, undefined]);
    expect(splitPrivate({aaa: {_a: 1}, bbb: {_b: 1}}, {})).toEqual([
      {aaa: {}, bbb: {}},
      {aaa: {_a: 1}, bbb: {_b: 1}},
    ]);
    expect(splitPrivate({aaa: {_a: 1}, bbb: {_b: 1}}, {aaa: true, bbb: true})).toEqual([undefined, {aaa: {_a: 1}, bbb: {_b: 1}}]);
    expect(splitPrivate({aaa: {bbb: {ccc: 1}}}, {})).toEqual([{aaa: {bbb: {ccc: 1}}}, undefined]);
    expect(splitPrivate({aaa: {bbb: {ccc: 1}, _bbb: {_ccc: 1}}}, {})).toEqual([{aaa: {bbb: {ccc: 1}}}, {aaa: {_bbb: {_ccc: 1}}}]);
  });
});
