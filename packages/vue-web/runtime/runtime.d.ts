declare namespace EluxRuntime {
  interface ENV {
    document: Document;
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
  }
}
