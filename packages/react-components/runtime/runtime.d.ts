declare namespace EluxRuntime {
  interface ENV {
    document: {
      title: string;
      getElementById(id: string): any;
    };
  }
}
interface HTMLDivElement {
  className?: string;
}
