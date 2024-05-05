// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import cheerio from 'cheerio';
// import puppeteer from 'puppeteer';

// 發送 HTTP 請求並獲取中央氣象局網頁的內容
// const fetchRainProbability = async () => {

//     // const puppeteer = require("puppeteer");

//     try {
//         const response = await axios.get('https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=6300300');  // 台北市大安區
//         const html = response.data; // 獲取 HTML 內容

//         // 使用 cheerio 解析 HTML 內容
//         const $ = cheerio.load(html);

//         // 在這裡使用 CSS 選擇器找到降雨機率所在的元素，並獲取其內容
//         const rainProbabilityElement = $('body > div.wrapper > main > div > div.col-lg-5.clearconten > table > tbody > tr > td:nth-child(2) > span > span.tem-C.is-active');
//         // const rainProbabilityElement = $('body > div:nth-child(5) > main > div > div > table > tbody > tr > td:nth-child(2) > span');
//         console.log(rainProbabilityElement.text());
//         const rainProbabilityText = rainProbabilityElement.text(); // 獲取降雨機率的文字內容

//         return rainProbabilityText; // 返回降雨機率

//     } catch (error) {
//         console.error('Error fetching rain probability:', error);
//         return null; // 如果發生錯誤，返回 null
//     }

// };
  
// const crawler = () => {
//     console.log('Start crawling...');

//     // 使用 fetchRainProbability 函數來獲取降雨機率
//     fetchRainProbability().then((rainProbability) => {
//         console.log('Rain probability:', rainProbability);
//     });
        
// };

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import puppeteer from 'puppeteer';

// const crawler = () => {

//     (async () => {
//         // 啟動瀏覽器並開啟一個新的空白頁面
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();

//         // 將頁面導航至 URL
//         await page.goto("https://developer.chrome.com/");

//             // 關閉
//         await page.close();
//         await browser.close();
//     })();
        
// };

import React, { useState, useRef } from 'react';
import { View, Button, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const useCrawler = () => {
  const [data, setData] = useState(null);
  const webViewRef = useRef(null); // 使用 useRef 創建 ref

  // WebView 加載完成後執行的函數
  const onLoad = () => {
    // 在 WebView 中執行 JavaScript 代碼來抓取資料
    const jsCode = `
      // 在這裡放置你的 JavaScript 代碼
      // 例如，獲取 id 為 example 的元素的文本內容
      var element = document.getElementById('header');
      element ? element.textContent.trim() : null;
    `;
    webViewRef.current.injectJavaScript(jsCode);
  };

  // WebView 接收到消息時執行的函數
  const onMessage = event => {
    // 接收從 WebView 發送的消息
    const receivedData = event.nativeEvent.data;
    setData(receivedData);
    // 在這裡可以進行資料處理或顯示
    Alert.alert('資料', receivedData);
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=6300300' }}
        onLoad={onLoad}
        onMessage={onMessage}
      />
      <Button title="重新加載" onPress={() => webViewRef.current.reload()} />
    </View>
  );
};

export default useCrawler;