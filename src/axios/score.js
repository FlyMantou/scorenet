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

export function getScoreData(id) {
  return request({
    url: 'http://yuepu.myhuanghai.com:8080/score/scoreapi/getdata',
    method: 'get',
    params: { id }
  })
}
