import {ARouter, Location, RouteTarget} from './basic';

export abstract class Router extends ARouter {
  private async _relaunch(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, _nativeCaller: boolean) {
    //const action: RouteAction = 'push';
  }
}
