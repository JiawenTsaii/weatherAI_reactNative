import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cheerio from 'cheerio'; // 用於解析 HTML 內容

// 發送 HTTP 請求並獲取中央氣象局網頁的內容
const fetchRainProbability = async () => {

    // const baseUrl = 'https://www.cwa.gov.tw/V8/C/W/County/County.html?CID=63';

    // axios({
    //     method: 'get',
    //     url: `${baseUrl}/api/users/1`,
    // }).then((response) => {
    //     // console.log(response.data);
    // });

    // axios.get(`${baseUrl}/api/users/1`).then((response) => {
    //     console.log(response.data);
    // });

    try {
        const response = await axios.get('https://www.cwa.gov.tw/V8/C/W/County/County.html?CID=63');
        const html = response.data; // 獲取 HTML 內容

        // 使用 cheerio 解析 HTML 內容
        const $ = cheerio.load(html);

        // 在這裡使用 CSS 選擇器找到降雨機率所在的元素，並獲取其內容
        const rainProbabilityElement = $('html > body > div:nth-child(2) > main > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > ul > li:nth-child(3) > span:nth-child(3) > span'); // 使用 XPath 找到降雨機率所在的元素
        const rainProbabilityText = rainProbabilityElement.text(); // 獲取降雨機率的文字內容

        return rainProbabilityText; // 返回降雨機率
    } catch (error) {
        console.error('Error fetching rain probability:', error);
        return null; // 如果發生錯誤，返回 null
    }
};
  
const crawler = () => {
    // 使用 fetchRainProbability 函數來獲取降雨機率
    fetchRainProbability().then((rainProbability) => {
        console.log('Rain probability:', rainProbability);
    });    
};

export default crawler;