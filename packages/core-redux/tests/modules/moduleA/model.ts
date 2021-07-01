import {ActionTypes, CoreModuleHandlers, reducer, effect} from '@elux/core';
import {messages} from '../../utils';

export interface State {
  count: number;
}

// 定义本模块的Handlers
export class ModuleHandlers extends CoreModuleHandlers<State, {}> {
  constructor(moduleName: string) {
    super(moduleName, {count: 0});
  }

  @reducer
  public add(): State {
    messages.push(['moduleA/add', JSON.stringify(this.rootState)]);
    return {...this.state, count: this.state.count + 1};
  }

  @reducer
  public add2(): State {
    const prevState = this.currentRootState;
    messages.push(['moduleA/add2', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
    this.state.count += 1;
    return this.state;
  }

  @reducer
  public simple(): State {
    return this.state;
  }

  @reducer
  public reducerError(error: string): State {
    throw error;
  }

  @effect(null)
  public async effectError(error: string) {
    throw error;
  }

  @effect(null)
  public async effectReducerError(error: string) {
    this.dispatch(this.actions.reducerError(error));
  }

  @effect(null)
  public async effectEffectError(error: string) {
    this.dispatch(this.actions.effectError(error));
    this.dispatch(this.actions.simple());
  }

  @effect(null)
  protected async [ActionTypes.Error](error: any) {
    messages.push(error, error.__eluxProcessed__);
    return true;
  }
}
