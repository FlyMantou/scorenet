import request from '@/axios/request'


export function getScoreList() {
  return request({
    url: '/score/api/list',
    method: 'get'
  })
}

export function getScore(id) {
  return request({
    url: '/score/api/get',
    method: 'get',
    params: { id }
  })
}

export function getScoreData(id) {
  return request({
    url: '/score/api/test',
    method: 'get',
    params: { id }
  })
}
