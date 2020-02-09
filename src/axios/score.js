import request from '@/axios/request'


export function getScoreList() {
  return request({
    url: '/scs/api/list',
    method: 'post'
  })
}
export function getScoreById(id) {
  const data = {id};
  return request({
    url: '/scs/api/getone',
    //url: 'http://yulindb.myhuanghai.com/score.json',
    method: 'get',
    params: {
      id: id,
    }
  })
}
export function parse(xmlpath,midpath) {
  const data = {xmlpath,midpath}
  return request({
    url: '/scs/api/set_parse',
    method: 'post',
    data
  })
}
export function getParse(id) {
  const data = {id}
  return request({
    url: '/scs/api/get_parse',
    method: 'post',
    data
  })
}
export function getScore(id) {
  return request({
    url: '/scs/api/get',
    method: 'get',
    params: { id }
  })
}

export function getScoreData(id) {
  return request({
    url: '/scs/api/test',
    method: 'get',
    params: { id }
  })
}
