import React from 'react';
import { ICoreRouter, IStore } from '@elux/core';
export declare const Router: React.FC<{
    page: React.ComponentType;
}>;
export declare const Page: React.FC<{
    store: IStore;
    view: React.ComponentType;
}>;
export declare function useRouter(): ICoreRouter;
