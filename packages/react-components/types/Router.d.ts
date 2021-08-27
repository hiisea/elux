import React from 'react';
import { ICoreRouter, IStore } from '@elux/core';
export declare const Router: React.FC;
export declare const Page: React.FC<{
    store: IStore;
    pagename: string;
}>;
export declare function useRouter(): ICoreRouter;
