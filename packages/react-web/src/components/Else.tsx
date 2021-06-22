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
    return <>{arr}</>;
  }
  return <>{elseView}</>;
};

export const Else = React.memo(Component);
