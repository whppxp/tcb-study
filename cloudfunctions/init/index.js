const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "xly-4sbzr",
});
const db = cloud.database();
const advices = db.collection('advice')

exports.main = async (event, context) => {
  // 获得数据库总条数
  const total = (await advices.count()).total
  // 计算分页次数
  const times = Math.ceil(total / 100);
  const tasks = []
  // 循环添加 Promise 请求
  for (let i = 0; i < times; i++) {
    const promise = await advices.skip(i * 100).limit(100).orderBy('adddue', 'desc').get();
    tasks.push(promise);
  }
  // 并发
  const data = (await Promise.all(tasks)).reduce((acc, cur) => {
    // 使用 reduce 拼接请求结果
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  }).data;
  // 返回数据
  return { data };
};