/* eslint-disable no-console */
const nativeRouter = {
  push(location: string, key: string) {
    console.log('push', key);
  },
  replace(location: string, key: string) {
    console.log('replace', key);
  },
  relaunch(location: string, key: string) {
    console.log('relaunch', key);
  },
  back(location: string, n: number, key: string) {
    console.log('back', n, key);
  },
  pop(location: string, n: number, key: string) {
    console.log('pop', n, key);
  },
};

export default nativeRouter;
