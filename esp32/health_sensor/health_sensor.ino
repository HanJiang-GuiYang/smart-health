/*
  MAX30102 + ESP32-C3 网页心率监视器
  库：DFRobot_MAX30102（另需 ESP32 开发板核心自带的 WiFi/WebServer）
  接线：VIN->3V3, GND->GND, SDA->GPIO4, SCL->GPIO5
  串口：115200

  DFRobot 算法固定使用 25Hz * 4 秒 = 100 点窗口。
  采集放在独立 FreeRTOS 任务，网页不会被 4 秒计算阻塞。
  本程序仅供学习实验，不可用于医疗诊断。
*/

#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <DFRobot_MAX30102.h>

constexpr int SDA_PIN = 4;
constexpr int SCL_PIN = 5;

// Wi-Fi 信息只保存在 ESP32 程序中，网页接口不会返回密码。
const char WIFI_SSID[] = "111";
const char WIFI_PASSWORD[] = "12345678..";

DFRobot_MAX30102 particleSensor;
WebServer server(80);

struct SensorData {
  int rawHeartRate;
  int stableHeartRate;
  int spo2;
  bool heartRateValid;
  bool spo2Valid;
  bool sensorReady;
  bool collecting;
  uint32_t updateId;
  uint32_t updatedAtMs;
};

SensorData sharedData = {0, 0, 0, false, false, false, false, 0, 0};
portMUX_TYPE dataMux = portMUX_INITIALIZER_UNLOCKED;

const char PAGE[] PROGMEM = R"HTML(
<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MAX30102 心率监视器</title>
<style>
:root{color-scheme:dark;--bg:#07101d;--card:#101c2d;--line:#263750;--text:#edf5ff;--muted:#91a4bb;--red:#ff5b67;--cyan:#38d9e6;--green:#4ade80;--yellow:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top,#132943 0,#07101d 45%);color:var(--text);font:15px system-ui,-apple-system,sans-serif}.wrap{max-width:1050px;margin:auto;padding:22px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:18px}h1{font-size:23px;margin:0}.pill{padding:7px 11px;border-radius:99px;background:#17283c;color:var(--muted)}.pill.ok{color:var(--green)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:rgba(16,28,45,.94);border:1px solid var(--line);border-radius:16px;padding:17px;box-shadow:0 12px 30px #0004}.label{color:var(--muted);font-size:13px}.value{font-size:39px;font-weight:750;margin-top:5px}.unit{font-size:14px;color:var(--muted);font-weight:500}.sub{color:var(--muted);margin-top:5px}.charts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.chart{height:290px}.chart h2{font-size:15px;margin:0 0 10px}.canvas-wrap{height:220px}canvas{width:100%;height:100%;display:block}.stats{display:flex;gap:15px;color:var(--muted);font-size:13px;margin-top:9px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}.note{margin-top:14px;color:var(--muted);font-size:13px;line-height:1.6}@media(max-width:720px){.grid,.charts{grid-template-columns:1fr}.chart{height:270px}.wrap{padding:14px}.value{font-size:35px}}
</style></head><body><main class="wrap">
<div class="top"><div><h1>MAX30102 实时分析</h1><div class="sub">ESP32-C3 · DFRobot 4 秒算法窗口</div></div><div id="state" class="pill">正在连接…</div></div>
<section class="grid">
 <div class="card"><div class="label">稳定心率</div><div class="value"><span id="hr">--</span> <span class="unit">BPM</span></div><div id="trend" class="sub">等待有效数据</div></div>
 <div class="card"><div class="label">算法原始心率</div><div class="value"><span id="raw">--</span> <span class="unit">BPM</span></div><div class="sub">用于观察瞬时跳变</div></div>
 <div class="card"><div class="label">血氧</div><div class="value"><span id="spo2">--</span> <span class="unit">%</span></div><div id="age" class="sub">尚未完成采样</div></div>
</section>
<section class="charts">
 <div class="card chart"><h2>心率趋势</h2><div class="canvas-wrap"><canvas id="hrChart"></canvas></div><div class="stats"><span><i class="dot" style="background:#38d9e6"></i>稳定</span><span><i class="dot" style="background:#ff5b67"></i>原始</span><span id="hrStats">--</span></div></div>
 <div class="card chart"><h2>血氧趋势</h2><div class="canvas-wrap"><canvas id="spo2Chart"></canvas></div><div class="stats"><span><i class="dot" style="background:#4ade80"></i>SpO₂</span><span id="spo2Stats">--</span></div></div>
</section>
<div class="note">稳定值使用最近有效结果的中位数与突变确认：单次从 90 跳到 120 会保留原值，连续出现相近的新读数后才跟随。网页每秒刷新，但传感器算法仍以完整 4 秒窗口计算，以免牺牲有效率。数据仅供实验。</div>
</main><script>
const hist={stable:[],raw:[],spo2:[]};let lastId=-1;
function push(a,v){a.push(v);if(a.length>120)a.shift()}
function stats(a){const v=a.filter(Number.isFinite);if(!v.length)return'--';const avg=v.reduce((x,y)=>x+y,0)/v.length;return`均 ${avg.toFixed(0)} · 低 ${Math.min(...v)} · 高 ${Math.max(...v)}`}
function draw(canvas,series,minY,maxY){const d=devicePixelRatio||1,r=canvas.getBoundingClientRect();canvas.width=r.width*d;canvas.height=r.height*d;const c=canvas.getContext('2d');c.scale(d,d);const w=r.width,h=r.height,p={l:35,r:8,t:8,b:22};c.clearRect(0,0,w,h);c.strokeStyle='#263750';c.fillStyle='#91a4bb';c.font='11px system-ui';c.lineWidth=1;for(let i=0;i<5;i++){const y=p.t+(h-p.t-p.b)*i/4,val=Math.round(maxY-(maxY-minY)*i/4);c.beginPath();c.moveTo(p.l,y);c.lineTo(w-p.r,y);c.stroke();c.fillText(val,2,y+4)}series.forEach(s=>{c.strokeStyle=s.color;c.lineWidth=2;c.beginPath();let started=false;s.data.forEach((v,i)=>{if(!Number.isFinite(v))return;const x=p.l+(w-p.l-p.r)*(i/Math.max(1,s.data.length-1)),y=p.t+(h-p.t-p.b)*(maxY-v)/(maxY-minY);started?c.lineTo(x,y):c.moveTo(x,y);started=true});c.stroke()})}
function render(d){const valid=d.hr_valid&&d.stable_hr>0;document.querySelector('#hr').textContent=valid?d.stable_hr:'--';document.querySelector('#raw').textContent=d.hr_valid?d.raw_hr:'--';document.querySelector('#spo2').textContent=d.spo2_valid?d.spo2:'--';const st=document.querySelector('#state');st.textContent=d.collecting?'采集中':'已更新';st.className='pill '+(d.sensor_ready?'ok':'');document.querySelector('#age').textContent=d.update_id?`上次完成 ${Math.floor(d.age_ms/1000)} 秒前`:'正在准备第一组数据';if(d.update_id!==lastId&&d.update_id>0){lastId=d.update_id;push(hist.stable,valid?d.stable_hr:NaN);push(hist.raw,d.hr_valid?d.raw_hr:NaN);push(hist.spo2,d.spo2_valid?d.spo2:NaN)}const v=hist.stable.filter(Number.isFinite),delta=v.length>1?v[v.length-1]-v[Math.max(0,v.length-4)]:0;document.querySelector('#trend').textContent=!valid?'当前结果无效':Math.abs(delta)<4?'近期平稳':delta>0?`近期上升 ${delta} BPM`:`近期下降 ${-delta} BPM`;document.querySelector('#hrStats').textContent=stats(hist.stable);document.querySelector('#spo2Stats').textContent=stats(hist.spo2);draw(document.querySelector('#hrChart'),[{data:hist.stable,color:'#38d9e6'},{data:hist.raw,color:'#ff5b67'}],40,160);draw(document.querySelector('#spo2Chart'),[{data:hist.spo2,color:'#4ade80'}],85,100)}
async function poll(){try{const r=await fetch('/data',{cache:'no-store'});render(await r.json())}catch(e){const s=document.querySelector('#state');s.textContent='连接中断';s.className='pill'}}setInterval(poll,1000);poll();addEventListener('resize',()=>{});
</script></body></html>
)HTML";

int medianOf(const int *values, int count) {
  int copy[5];
  for (int i = 0; i < count; i++) copy[i] = values[i];
  for (int i = 1; i < count; i++) {
    int value = copy[i];
    int j = i - 1;
    while (j >= 0 && copy[j] > value) {
      copy[j + 1] = copy[j];
      j--;
    }
    copy[j + 1] = value;
  }
  return copy[count / 2];
}

void sensorTask(void *parameter) {
  int history[5] = {0};
  int historyCount = 0;
  int historyIndex = 0;
  int stableHeartRate = 0;
  int jumpCandidate = 0;
  int jumpConfirmations = 0;
  float stableSpo2 = 0;

  for (;;) {
    portENTER_CRITICAL(&dataMux);
    sharedData.collecting = true;
    portEXIT_CRITICAL(&dataMux);

    int32_t rawSpo2 = 0;
    int8_t rawSpo2Valid = 0;
    int32_t rawHeartRate = 0;
    int8_t rawHeartRateValid = 0;

    particleSensor.heartrateAndOxygenSaturation(
        &rawSpo2, &rawSpo2Valid, &rawHeartRate, &rawHeartRateValid);

    const bool hrValid = rawHeartRateValid == 1 &&
                         rawHeartRate >= 35 && rawHeartRate <= 220;
    const bool oxygenValid = rawSpo2Valid == 1 &&
                             rawSpo2 >= 70 && rawSpo2 <= 100;

    if (hrValid) {
      history[historyIndex] = static_cast<int>(rawHeartRate);
      historyIndex = (historyIndex + 1) % 5;
      if (historyCount < 5) historyCount++;
      const int median = medianOf(history, historyCount);

      if (stableHeartRate == 0) {
        stableHeartRate = median;
      } else if (abs(median - stableHeartRate) <= 15) {
        stableHeartRate = (stableHeartRate * 2 + median) / 3;
        jumpConfirmations = 0;
      } else {
        // 大幅变化必须连续两次方向和数值相近，才更新稳定值。
        if (abs(static_cast<int>(rawHeartRate) - jumpCandidate) <= 10) {
          jumpConfirmations++;
        } else {
          jumpCandidate = static_cast<int>(rawHeartRate);
          jumpConfirmations = 1;
        }
        if (jumpConfirmations >= 2) {
          stableHeartRate = median;
          jumpConfirmations = 0;
        }
      }
    }

    if (oxygenValid) {
      stableSpo2 = stableSpo2 == 0 ? rawSpo2 :
                   stableSpo2 * 0.7F + rawSpo2 * 0.3F;
    }

    portENTER_CRITICAL(&dataMux);
    sharedData.rawHeartRate = static_cast<int>(rawHeartRate);
    sharedData.stableHeartRate = stableHeartRate;
    sharedData.spo2 = static_cast<int>(stableSpo2 + 0.5F);
    sharedData.heartRateValid = hrValid;
    sharedData.spo2Valid = oxygenValid;
    sharedData.sensorReady = true;
    sharedData.collecting = false;
    sharedData.updateId++;
    sharedData.updatedAtMs = millis();
    portEXIT_CRITICAL(&dataMux);

    Serial.print("rawHR=");
    Serial.print(rawHeartRate);
    Serial.print(", stableHR=");
    Serial.print(stableHeartRate);
    Serial.print(", hrValid=");
    Serial.print(hrValid);
    Serial.print(", SpO2=");
    Serial.print(rawSpo2);
    Serial.print(", spo2Valid=");
    Serial.println(oxygenValid);

    taskYIELD();
  }
}

void sendData() {
  SensorData data;
  portENTER_CRITICAL(&dataMux);
  data = sharedData;
  portEXIT_CRITICAL(&dataMux);

  const uint32_t age = data.updatedAtMs == 0 ? 0 : millis() - data.updatedAtMs;
  String json;
  json.reserve(240);
  json += "{\"raw_hr\":" + String(data.rawHeartRate);
  json += ",\"stable_hr\":" + String(data.stableHeartRate);
  json += ",\"spo2\":" + String(data.spo2);
  json += ",\"hr_valid\":" + String(data.heartRateValid ? "true" : "false");
  json += ",\"spo2_valid\":" + String(data.spo2Valid ? "true" : "false");
  json += ",\"sensor_ready\":" + String(data.sensorReady ? "true" : "false");
  json += ",\"collecting\":" + String(data.collecting ? "true" : "false");
  json += ",\"update_id\":" + String(data.updateId);
  json += ",\"age_ms\":" + String(age) + "}";

  server.sendHeader("Cache-Control", "no-store");
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.setPins(SDA_PIN, SCL_PIN);
  while (!particleSensor.begin(&Wire)) {
    Serial.println("ERROR: 未找到 MAX30102，请检查 GPIO4/GPIO5 和供电。");
    delay(1000);
  }

  particleSensor.sensorConfiguration(
      50, SAMPLEAVG_4, MODE_MULTILED,
      SAMPLERATE_100, PULSEWIDTH_411, ADCRANGE_16384);

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("正在连接 Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print('.');
  }
  Serial.println();
  Serial.print("网页地址：http://");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("max30102")) {
    MDNS.addService("http", "tcp", 80);
    Serial.println("也可尝试：http://max30102.local");
  }

  server.on("/", []() { server.send_P(200, "text/html; charset=utf-8", PAGE); });
  server.on("/data", sendData);
  server.onNotFound([]() { server.send(404, "text/plain", "Not found"); });
  server.begin();

  xTaskCreate(sensorTask, "max30102", 8192, nullptr, 1, nullptr);
}

void loop() {
  server.handleClient();
  delay(2);
}
