import request from '@/axios/request'


export function getScoreList() {
  return request({
    url: '/scoreapi/list',
    method: 'get'
  })
}

export function getScore(id) {
  return request({
    url: '/scoreapi/get',
    method: 'get',
    params: { id }
  })
}
