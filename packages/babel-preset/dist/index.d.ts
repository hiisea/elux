export declare type Options = {
    module?: 'cjs' | 'esm';
    targets?: any;
    presets?: any[];
    plugins?: any[];
    moduleResolver?: {
        root: string[];
        alias: {
            [key: string]: string;
        };
    };
    rootImport?: any;
    classPropertiesLoose?: boolean;
    ui?: 'react' | 'vue' | 'vue2' | 'vue3';
};
