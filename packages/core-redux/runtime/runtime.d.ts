declare namespace EluxRuntime {
  interface ENV {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options?: any) => {
        init(state: any): void;
        subscribe(action: any): void;
        send(action: {type: string; payload: any[]}, state: any): void;
      };
    };
  }
}
