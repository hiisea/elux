import {router} from './tools';

describe('/admin/member', () => {
  test('locationToNativeDataUrl', () => {
    expect(
      router.locationToNativeData({
        pagename: '/admin/member',
        params: {
          admin: {},
          member: {
            listSearchPre: {
              pageSize: 10,
              pageCurrent: 1,
              term: undefined,
            },
            listView: '',
            _listVerPre: 0,
            itemIdPre: '',
            itemView: '',
            _itemVerPre: 0,
          },
        },
      }).nativeUrl
    ).toBe('/admin/member2');
    expect(
      router.locationToNativeData({
        pagename: '/admin/member',
        params: {
          member: {
            listSearchPre: {
              pageSize: 10,
            },
            _itemVerPre: 0,
          },
        },
      }).nativeUrl
    ).toBe('/admin/member2');
    expect(
      router.locationToNativeData({
        pagename: '/admin/member',
        params: {
          member: {
            listSearchPre: {
              pageSize: 11,
            },
            _itemVerPre: 1,
          },
        },
      }).nativeUrl
    ).toBe(
      '/admin/member2?_=%7B%22member%22%3A%7B%22listSearchPre%22%3A%7B%22pageSize%22%3A11%7D%7D%7D#_=%7B%22member%22%3A%7B%22_itemVerPre%22%3A1%7D%7D'
    );
    expect(
      router.locationToNativeData({
        pagename: '/admin/member333',
        params: {
          member: {
            listSearchPre: {
              pageSize: 11,
            },
            _itemVerPre: 1,
          },
        },
      }).nativeUrl
    ).toBe(
      '/admin/member2333?_=%7B%22member%22%3A%7B%22listSearchPre%22%3A%7B%22pageSize%22%3A11%7D%7D%7D#_=%7B%22member%22%3A%7B%22_itemVerPre%22%3A1%7D%7D'
    );
  });
});
