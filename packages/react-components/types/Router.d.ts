import React, { ComponentType } from 'react';
import { UStore } from '@elux/core';
import { URouter } from '@elux/route';
export declare const Router: React.FC<{
    page: ComponentType;
}>;
export declare const EWindow: React.FC<{
    store: UStore;
    view: ComponentType;
}>;
export declare function useRouter(): URouter;
//# sourceMappingURL=Router.d.ts.map