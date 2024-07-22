// types.d.ts
declare interface ImportMeta {
    glob: (paths: string, options?: { eager?: boolean, import?: 'default' | 'namespace' | 'named' | string[], query?: { [key: string]: string } }) => Record<string, () => Promise<Record<string, any>>>;
}
  