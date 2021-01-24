const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3000 })

let group = {}
wss.on('connection', function connection(ws) {
  console.log('one client is connected')
  // 接受客户端的消息
  ws.on('message', function (msg) {
    const msgObj = JSON.parse(msg)
    if (msgObj.event === 'enter') {
      ws.name = msgObj.message
      ws.roomid = msgObj.roomid
      if (typeof group[ws.roomid] === 'undefined') {
        group[ws.roomid] = { num: 1 }
      } else {
        group[ws.roomid].num++
      }
    }
    // 主动发送消息给客户端
    // 广播消息
    wss.clients.forEach((client) => {
      // 判断非自己的客户端 ws:当前连接的客户端,client当前循环到的客户端
      if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
        msgObj.name = ws.name
        msgObj.num = group[ws.roomid].num
        client.send(JSON.stringify(msgObj))
      }
    })
  })

  ws.on('close', function () {
    // 用户ws.name说明进入聊天室了，不然的话在没进入聊天室时刷新页面也会触发
    if (ws.name) {
      group[ws.roomid].num--
    }
    // 广播消息
    let msgObj = {}
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
        msgObj.name = ws.name
        msgObj.num = group[ws.roomid].num
        msgObj.event = 'out'
        client.send(JSON.stringify(msgObj))
      }
    })
  })
})
