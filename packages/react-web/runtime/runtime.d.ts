declare namespace EluxRuntime {
  interface ENV {
    document: Document;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
  }
}
