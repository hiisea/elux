declare namespace EluxCore {
  interface Document {
    title: string;
    getElementById: (id: string) => any;
  }

  interface ENV {
    document: Document;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
  }
}
