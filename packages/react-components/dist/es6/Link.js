import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
import { useCallback, useMemo, useRef } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export const Link = ({
  to,
  cname,
  action,
  onClick,
  disabled,
  overflowRedirect,
  target,
  payload,
  ...props
}) => {
  const router = coreConfig.UseRouter();
  const {
    firstArg,
    url,
    href
  } = useMemo(() => {
    let firstArg, url, href;

    if (action === 'back') {
      firstArg = to;
      url = `#${to.toString()}`;
      href = `#`;
    } else {
      const location = typeof to === 'string' ? {
        url: to
      } : to;
      cname !== undefined && (location.classname = cname);
      url = router.computeUrl(location, action, target);
      firstArg = {
        url
      };
      href = urlToNativeUrl(url);
    }

    return {
      firstArg,
      url,
      href
    };
  }, [target, action, cname, router, to]);
  const data = {
    router,
    onClick,
    disabled,
    firstArg,
    action,
    target,
    payload,
    overflowRedirect
  };
  const refData = useRef(data);
  Object.assign(refData.current, data);
  const clickHandler = useCallback(event => {
    event.preventDefault();
    const {
      router,
      disabled,
      onClick,
      firstArg,
      action,
      target,
      payload,
      overflowRedirect
    } = refData.current;

    if (!disabled) {
      onClick && onClick(event);
      router[action](firstArg, target, payload, overflowRedirect);
    }
  }, []);
  props['onClick'] = clickHandler;
  props['action'] = action;
  props['target'] = target;
  props['url'] = url;
  props['href'] = href;
  overflowRedirect && (props['overflow'] = overflowRedirect);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return _jsx("span", { ...props
    });
  } else {
    return _jsx("a", { ...props
    });
  }
};
Link.displayName = 'EluxLink';