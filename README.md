# tcb-study



## 第 4 天思路

### 实时推送

[完整源码](https://github.com/moreant/tcb-study/blob/e1e2b2abab5d1c193a6364f5fd01dbbcf8b4150e/webviews/asset/admin.js#L76-L98)

```js
function initlist() {
    const db = cloud.database()
    const _ = db.command
    db.collection('advice')
        // 获取反馈不为空的数据
        .where({
            advice: _.neq("")
        })
        // 实时推送
        // 获取结果为 0 时需要清除浏览器缓存和 cookie
        .watch({
            onChange: res => {
                console.log(res.docs);
                // 处理日期对象显示异常
                let list = res.docs.map(item => {
                    item.adddue = new Date(item.adddue.$date);
                    return item;
                })
                refreshlist(list)
            },
            onError: err => {
                console.error(err);
            }
        })
}
```



### Rromise all 加载列表

[完整源码](https://github.com/moreant/tcb-study/blob/e1e2b2abab5d1c193a6364f5fd01dbbcf8b4150e/cloudfunctions/init/index.js#L10-L29)

```js
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
```

