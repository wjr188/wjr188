import simpleService from '@/utils/request'

// 登录
export function loginApi(data: { account: string; password: string }): Promise<any> {
  return simpleService.post('/api/user/login', data)
}

// 注册
export function registerApi(data: { account: string; password: string; uuid?: string }): Promise<any> {
  return simpleService.post('/api/user/register', data)
}

// 获取用户信息
export function fetchUserInfoApi(): Promise<any> {
  return simpleService.get('/api/user/info')
}

// 自动注册游客
export function autoRegisterApi(data: { uuid?: string } = {}): Promise<any> {
  return simpleService.post('/api/user/autoRegister', data)
}

// 获取任务领取状态
export function fetchTaskStatusApi(): Promise<any> {
  return simpleService.get('/api/user/task-status')
}

// 领取积分任务
export function claimTaskApi(data: { type: string }): Promise<any> {
  return simpleService.post('/api/user/claim-task', data)
}

// 【新增】获取长视频剩余观看次数
export function fetchLongVideoRemaining(userId: string): Promise<any> {
  return simpleService.get('/api/long/videos/canWatch', {
    params: { userId }
  })
}
