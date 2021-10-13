import {ActionTypes, CoreModuleHandlers, reducer, effect, IStore} from '@elux/core';
import {messages} from '../../utils';

export interface State {
  count: number;
}

// 定义本模块的Handlers
export class ModuleHandlers extends CoreModuleHandlers<State, {}> {
  constructor(moduleName: string, store: IStore) {
    super(moduleName, store, {count: 0});
  }

  @reducer
  public add(): State {
    messages.push(['moduleA/add', JSON.stringify(this.getRootState())]);
    const state = this.getState();
    return {...state, count: state.count + 1};
  }

  @reducer
  public add2(): State {
    const prevState = this.getCurrentRootState();
    messages.push(['moduleA/add2', JSON.stringify(this.getRootState()), JSON.stringify(prevState)]);
    const state = this.getState();
    state.count += 1;
    return state;
  }

  @reducer
  public simple(): State {
    return this.getState();
  }

  @reducer
  public reducerError(error: string): State {
    throw error;
  }

  @effect(null)
  public async effectError(error: string): Promise<void> {
    throw error;
  }

  @effect(null)
  public async effectReducerError(error: string): Promise<void> {
    this.dispatch(this.actions.reducerError(error));
  }

  @effect(null)
  public async effectEffectError(error: string): Promise<void> {
    this.dispatch(this.actions.effectError(error));
    this.dispatch(this.actions.simple());
  }

  @effect(null)
  protected async [ActionTypes.Error](error: any): Promise<boolean> {
    messages.push(error, error.__eluxProcessed__);
    return true;
  }
}
