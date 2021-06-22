import React, {ReactNode} from 'react';

interface Props {
  elseView?: ReactNode;
  children: ReactNode;
}
const Component: React.FC<Props> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr[0]}</>;
  }
  return <>{elseView}</>;
};

export const Switch = React.memo(Component);
