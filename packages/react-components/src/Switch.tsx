import React, {ReactNode} from 'react';

/*** @public */
export interface SwitchProps {
  elseView?: ReactNode;
  children: ReactNode;
}
const Component: React.FC<SwitchProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr[0]}</>;
  }
  return <>{elseView}</>;
};

/*** @public */
export default React.memo(Component);
