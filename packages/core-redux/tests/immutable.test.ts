import {getComponet, ModuleGetter, defineModuleGetter, initApp, BStore, IStore, IStoreMiddleware, StoreBuilder, setCoreConfig} from '@elux/core';
import {createRedux} from 'src/index';
import {messages, router} from './utils';
import {App, moduleGetter} from './modules';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createAppWithRedux(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[], AppModuleName: string, appViewName: string) {
  setCoreConfig({AppModuleName});
  defineModuleGetter(moduleGetter);
  return {
    useStore<O, B extends BStore = BStore>(storeBuilder: StoreBuilder<O, B>) {
      return {
        render() {
          return initApp(router, storeBuilder, middlewares, appViewName);
        },
      };
    },
  };
}

describe('init', () => {
  let mockStore: IStore;
  const actionLogs: string[] = [];

  const storeMiddlewares: IStoreMiddleware = () => (next) => (action) => {
    actionLogs.push(action.type);
    return next(action);
  };

  beforeAll(() => {
    const {store, AppView} = createAppWithRedux(moduleGetter, [storeMiddlewares], 'moduleA', 'Main')
      .useStore(
        createRedux({
          enhancers: [],
          initState: {thirdParty: 123},
        })
      )
      .render();
    mockStore = store;
    (AppView as any)();
  });
  beforeEach(() => {
    actionLogs.length = 0;
    messages.length = 0;
  });
  test('初始状态', () => {
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 0},
    });
  });
  test('加载moduleB.Main,moduleC.Main', async () => {
    const viewB: any = await getComponet('moduleB', 'Main');
    const viewC: any = await getComponet('moduleC', 'Main');
    expect(viewB()).toBe('moduleB_views_Main');
    expect(viewC()).toBe('moduleC_views_Main');
    expect(actionLogs).toEqual(['moduleB.Init', 'moduleC.Init']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 0},
      moduleB: {count: 0},
      moduleC: {count: 0},
    });
  });
  test('同步handler', () => {
    mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add']);
    expect(messages).toEqual([
      ['moduleA/add', '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}'],
      [
        'moduleB/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1},"moduleB":{"count":1},"moduleC":{"count":0}}',
        '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}',
      ],
      [
        'moduleC/moduleA.add',
        '{"thirdParty":123,"moduleA":{"count":1,"loading":{"global":"Start"}},"moduleB":{"count":1},"moduleC":{"count":1}}',
        '{"thirdParty":123,"moduleA":{"count":0},"moduleB":{"count":0},"moduleC":{"count":0}}',
      ],
    ]);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 1, loading: {global: 'Start'}},
      moduleB: {count: 1},
      moduleC: {count: 1},
    });
  });
  test('await handler', async () => {
    await mockStore.dispatch(App.moduleA.actions.add());
    expect(actionLogs).toEqual(['moduleA.add', 'moduleB.add', 'moduleA.Loading', 'moduleC.add', 'moduleA.Loading']);
    expect(mockStore.getState()).toEqual({
      thirdParty: 123,
      moduleA: {count: 2, loading: {global: 'Stop'}},
      moduleB: {count: 2},
      moduleC: {count: 2},
    });
  });
  test('reducerError', () => {
    expect(() => mockStore.dispatch(App.moduleA.actions.reducerError('reducerError'))).toThrow('reducerError');
    expect(actionLogs).toEqual(['moduleA.reducerError']);
  });
  test('effect-reducerError', async () => {
    await mockStore.dispatch(App.moduleA.actions.effectReducerError('reducerError'));
    expect(actionLogs).toEqual(['moduleA.effectReducerError', 'moduleA.reducerError', 'Elux.Error']);
  });
});
