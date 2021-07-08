export = function loader(this: any, source: string) {
  if (/\bexportModule\s*\(/.test(source)) {
    return source.replace(/\(\s*\)[^,]+import\s*\(([^)]+?)\)/g, 'require($1)').replace('functionrequire', 'require');
  }
  return source;
};
