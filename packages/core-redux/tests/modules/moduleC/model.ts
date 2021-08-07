import {CoreModuleHandlers, effect, IStore, reducer} from '@elux/core';
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
    return {...this.state, count: this.state.count + 1};
  }

  @reducer
  public add2(): State {
    this.state.count += 1;
    return this.state;
  }

  @effect()
  protected async ['moduleA.add'](): Promise<void> {
    const prevState = this.currentRootState;
    this.dispatch(this.actions.add());
    messages.push(['moduleC/moduleA.add', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
  }

  @effect()
  protected async ['moduleA.add2'](): Promise<void> {
    const prevState = this.currentRootState;
    this.dispatch(this.actions.add2());
    messages.push(['moduleC/moduleA.add2', JSON.stringify(this.rootState), JSON.stringify(prevState)]);
  }
}
