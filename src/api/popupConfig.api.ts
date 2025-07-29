import request from '@/utils/request'

export function fetchPopupConfig(type: string) {
  return request.get('/api/popup_config', {
    params: { popup_type: type } // 改这里！！！
  });
}
