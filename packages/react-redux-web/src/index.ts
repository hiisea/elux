import {Provider} from '@elux/react-redux';
import {setRootViewOptions} from '@elux/react-web';

setRootViewOptions({Provider: Provider as any});

export * from '@elux/react-web';
export * from '@elux/react-redux';
