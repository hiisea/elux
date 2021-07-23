declare namespace EluxRuntime {
  interface ENV {
    document: {
      getElementById(id: string): any;
      title: string;
    };
  }
}
