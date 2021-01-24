const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3000 })

let num = 0
wss.on('connection', function connection(ws) {
  console.log('one client is connected')
  // 接受客户端的消息
  ws.on('message', function (msg) {
    const msgObj = JSON.parse(msg)
    if (msgObj.event === 'enter') {
      ws.name = msgObj.message
      num++
    }
    // 主动发送消息给客户端
    // 广播消息
    wss.clients.forEach((client) => {
      // 判断非自己的客户端 ws:当前连接的客户端,client当前循环到的客户端
      if (client.readyState === WebSocket.OPEN) {
        msgObj.name = ws.name
        msgObj.num = num
        client.send(JSON.stringify(msgObj))
      }
    })
  })

  ws.on('close', function () {
    if (ws.name) {
      num--
    }
    // 广播消息
    let msgObj = {}
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        msgObj.name = ws.name
        msgObj.num = num
        msgObj.event = 'out'
        client.send(JSON.stringify(msgObj))
      }
    })
  })
})
