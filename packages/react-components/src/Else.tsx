import React, {ReactNode} from 'react';

/*** @public */
export interface ElseProps {
  elseView?: ReactNode;
  children: ReactNode;
}

const Component: React.FC<ElseProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr}</>;
  }
  return <>{elseView}</>;
};

/*** @public */
export default React.memo(Component);
