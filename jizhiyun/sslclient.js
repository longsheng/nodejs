const tls = require('tls');
const http = require('http');
const querystring = require("querystring");//解析参数的库
const url = require('url');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: "%m"
            }
        },
        {
            type: 'dateFile',
            filename: 'logs/log4js',
            pattern: "_yyyy-MM-dd",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'logger',
            layout: {
                type: 'pattern',
                pattern: "%m"
            }
        }
    ],
    replaceConsole: true
});
global.log = log4js.getLogger('logger');

let options = {
    host: 'snoti.gizwits.com',
    port: 2017,
    rejectUnauthorized: false,
};
let login_req_data = {
    "cmd": "login_req",
    "data": [{
        "product_key": '54bda8c5942943e3934cffd410f25438',
        "auth_id": '4i0zBjKQSYmEW0hBuNBT5A',
        "auth_secret": 'aTzmvjJST1m4gA7ultCNdA',
        "subkey": '111222333',
        "events": [
            'device.attr_fault',
            'device.attr_alert',
            'device.online',
            'device.offline',
            'device.status.raw',
            'device.status.kv',
            'datapoints.changed']
    }]
};
let ack = {
    "cmd": "event_ack",
    "delivery_id": ""
};
let ping = {"cmd": "ping"};

let baas_url = "http://localhost:8360/ls_waterheater/";
let log_push_url = "devicelog/push";

function start_pingpong() { //发送心跳包
    setInterval(function () {
        log.debug("--->ping");
        client.write(JSON.stringify(ping) + "\n");
    }, 1000 * 60 * 1); //3分钟发一次
}
function sendack(json_data) {
    ack.delivery_id = json_data.delivery_id;
    log.debug(">>--------ack-----------");
    client.write(JSON.stringify(ack) + "\n");
}
function event_push_router(jsondata) {
    log.debug("事件处理路由...");
    // log.debug(jsondata);
    switch (jsondata.event_type) {
        case "device_offline":
            log.debug("设备离线");
            sendack(jsondata);
            break;
        case "device_online":
            log.debug("设备连线");
            sendack(jsondata);
            break;
        case "device_status_kv":
            let event_no = parseInt(jsondata.data.test.substr(0, 3));
            switch (event_no) {
                case 101:
                    log.debug("设备事件1--log");
                    sendack(jsondata);
                    break;
                case 102:
                    log.debug("设备事件2");
                    sendack(jsondata);
                    break;
                case 103:
                    log.debug("设备事件3");
                    testBaasServer(jsondata);
                    sendack(jsondata);
                    break;
                default:
                    log.debug("无效的设备事件");
                    sendack(jsondata);
            }
            break;
        default:
            log.debug("无效的设备推送");
            sendack(jsondata);
    }
}
function msg_router(data) {
    log.debug("<<-----------(server return)--------------");
    json_data = JSON.parse(data);
    log.debug(json_data);
    switch (json_data.cmd) {
        case "login_res":
            if (json_data.data.result) {
                log.debug("登录成功...");
                start_pingpong();
            } else {
                log.debug("登录服务器出错...");
                process.exit(1);
            }
            break;
        case "event_push":
            log.debug("设备推送");
            // log.debug(json_data);
            event_push_router(json_data);

            break;
        case "invalid_msg":
            log.debug("客户端发送了错误的请求");
            log.debug(json_data);
            break;
        case "pong":
            log.debug("<<---pong!");
            break;
        default:
            log.debug("未处理的事件");
            log.debug(json_data);
    }
    log.debug("<<----------(server return end)-------------");
}
function login() {
    log.debug('服务器连接成功...');
    client.write(JSON.stringify(login_req_data));
    client.write('\n');
    log.debug("开始登录...")
}
function testBaasServer(jsondata) {  //可以封装一下,如：xxx_api(data) return a JSON
    jsondata.data = jsondata.data.test; //特殊处理data字段（因为querystring不支持JSON内套JSON的格式）
    let datastr = querystring.stringify(jsondata);
    log.debug(datastr);
    http.get(baas_url + log_push_url + '?' + datastr, (res) => {
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error(`请求失败。\n` +
                `状态码: ${statusCode}`);
        }
        if (error) {
            log.debug(error.message);
            // 消耗响应数据以释放内存
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            try {
                let parsedData = JSON.parse(rawData);
                log.debug(parsedData);
            } catch (e) {
                log.debug(e.message);
            }
        });
    }).on('error', (e) => {
        log.debug(`错误: ${e.message}`);
    });
}


let client = tls.connect(options, login);
log.debug("开始连接服务器...");
client.on('data', msg_router);
log.debug("程序主线程结束...");
function httprouter(req, res) {
    log.debug("httprouter...");
    switch (url.parse(req.url).pathname) {
        case "/deviceset": {
            let arg = querystring.parse(url.parse(req.url).query);
            log.debug(arg);
            client.write(JSON.stringify(ping) + "\n");
            res.end();
            break;
        }
        default: {
            log.debug("无效的请求:"+url.parse(req.url).pathname);
            res.write(JSON.stringify({err: 'error route'}));
            res.end();
        }
    }
}
function onRequest(req, res) {
    // log.debug(url.parse(req.url));
    httprouter(req, res);
}
let httpd = http.createServer(onRequest);
httpd.listen(8888);

