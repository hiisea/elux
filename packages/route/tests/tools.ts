import {defineModuleGetter, exportModule, CoreModuleHandlers, IStore} from '@elux/core';
import {BaseEluxRouter, BaseNativeRouter, DeepPartial, RootParams, NativeData, PagenameMap, createRouteModule} from 'src/index';

import nativeRouterMock from './nativeRouter';

jest.mock('./nativeRouter');

interface MemberRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term: string | null};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}

const defaultMemberRouteParams: MemberRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: null,
  },
  listView: '',
  _listVerPre: 0,
  itemIdPre: '',
  itemView: '',
  _itemVerPre: 0,
};
interface ArticleRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term: string | null};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}
const defaultArticleRouteParams: ArticleRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: null,
  },
  listView: '',
  _listVerPre: 0,
  itemIdPre: '',
  itemView: '',
  _itemVerPre: 0,
};

class ModuleHandlers extends CoreModuleHandlers {
  constructor(moduleName: string, store: IStore) {
    super(moduleName, store, {});
  }
}

type RouteParams = {admin: {}; member: MemberRouteParams; article: ArticleRouteParams};
type PartialRouteParams = DeepPartial<RouteParams>;

const pagenameMap: PagenameMap = {
  '/admin/member': {
    argsToParams() {
      const params: PartialRouteParams = {admin: {}, member: {}};
      return params;
    },
    paramsToArgs() {
      return [];
    },
  },
  '/admin/member/list': {
    argsToParams([pageCurrent, term]: Array<string | undefined>) {
      const params: PartialRouteParams = {admin: {}, member: {listView: 'list', listSearchPre: {}}};
      if (pageCurrent) {
        params.member!.listSearchPre!.pageCurrent = parseInt(pageCurrent, 10);
      }
      if (term) {
        params.member!.listSearchPre!.term = term;
      }
      return params;
    },
    paramsToArgs(params: PartialRouteParams) {
      const {pageCurrent, term} = params.member?.listSearchPre || {};
      return [pageCurrent, term];
    },
  },
  '/admin/member/detail': {
    argsToParams([itemIdPre]: Array<string | undefined>) {
      const params: PartialRouteParams = {admin: {}, member: {itemView: 'detail', itemIdPre}};
      return params;
    },
    paramsToArgs(params: PartialRouteParams) {
      const {itemIdPre} = params.member || {};
      return [itemIdPre];
    },
  },
};

export type Pagename = keyof typeof pagenameMap;

const routeModule = createRouteModule('route', pagenameMap, {
  in(nativeLocation) {
    let pathname = nativeLocation.pathname;
    if (pathname === '/' || pathname === '/admin2') {
      pathname = '/admin/member2';
    }
    return {...nativeLocation, pathname: pathname.replace('/member2', '/member')};
  },
  out(nativeLocation) {
    const pathname = nativeLocation.pathname;
    return {...nativeLocation, pathname: pathname.replace('/member', '/member2')};
  },
});
defineModuleGetter({
  route: () => routeModule,
  admin: () => exportModule('admin', ModuleHandlers, {}, {}),
  member: () => exportModule('member', ModuleHandlers, defaultMemberRouteParams, {}),
  article: () => exportModule('article', ModuleHandlers, defaultArticleRouteParams, {}),
});
export class Router<P extends RootParams, N extends string> extends BaseEluxRouter<P, N> {}

export class NativeRouter extends BaseNativeRouter {
  protected push(getNativeData: () => NativeData, key: string): NativeData {
    const nativeData = getNativeData();
    nativeRouterMock.push(nativeData.nativeUrl, key);
    return nativeData;
  }

  protected replace(getNativeData: () => NativeData, key: string): NativeData {
    const nativeData = getNativeData();
    nativeRouterMock.replace(nativeData.nativeUrl, key);
    return nativeData;
  }

  protected relaunch(getNativeData: () => NativeData, key: string): NativeData {
    const nativeData = getNativeData();
    nativeRouterMock.relaunch(nativeData.nativeUrl, key);
    return nativeData;
  }

  protected back(getNativeData: () => NativeData, n: number, key: string): NativeData {
    const nativeData = getNativeData();
    nativeRouterMock.back(nativeData.nativeUrl, n, key);
    return nativeData;
  }

  toOutside(): void {
    return undefined;
  }

  destroy(): void {
    return undefined;
  }
}
export const nativeRouter: NativeRouter = new NativeRouter();

const store = {
  dispatch() {
    return undefined;
  },
} as any;
export const router = new Router('/', nativeRouter, routeModule.locationTransform, {});
router.startup(store);
