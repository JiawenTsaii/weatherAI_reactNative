import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const useCrawler = ({ setTemperature, city, district, TID }) => {
  const webViewRef = useRef(null); // 使用 useRef 創建 ref
  const [source, setSource] = useState({ uri: `https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=${TID}` });
  // console.log("TID", TID);

  // WebView 加載完成後執行的函數
  const onLoad = () => {
    // 在 WebView 中執行 JavaScript 代碼來抓取資料
    const jsCode = `
      // 使用 XPath 查詢目標元素
      var tem = document.evaluate('/html/body/div[2]/main/div/div[1]/table/tbody/tr/td[2]/span/span[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      var area = document.evaluate('/html/body/div[2]/main/div/div[1]/div[4]/h3', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      // 檢查是否找到了元素
      if (tem && area) {
        // 將兩個值放入JavaScript物件中
        var data = {
          tem: tem.textContent.trim(),
          area: area.textContent.trim()
        };
        // 將JavaScript物件轉換為JSON字符串並傳送到React Native
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    `;
    webViewRef.current.injectJavaScript(jsCode);
  };

  useEffect(() => {
    setSource({ uri: `https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=${TID}` });
    onLoad();
  }, [TID]);

  // WebView 接收到消息時執行的函數
  const onMessage = event => {
    // 接收從 WebView 發送的消息
    const receivedData = JSON.parse(event.nativeEvent.data);
    console.log("receivedData", receivedData);
    const tem = receivedData.tem;
    setTemperature(parseInt(tem));
    const area = receivedData.area;
    // Alert.alert(`${area}`, `${tem}`);
  };

  return (
    <View style={styles.header}>
      <WebView
        ref={webViewRef}
        source={source}
        onLoad={onLoad}
        onMessage={onMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1, // 讓ScrollView 填滿父容器的可用空間
    justifyContent: 'center', // 垂直方向居中對齊
  },
  container: {
    flex: 1, // 使得容器充滿整個父容器的可用空間
    justifyContent: 'center', // 垂直方向居中對齊
    alignItems: 'center', // 水平方向居中對齊
  },
  header: {
    position: 'absolute', // 將元素設置為絕對定位
    top: 50, // 與螢幕頂部的距離為 20 個像素
    left: 0, // 與螢幕左側對齊
    right: 0, // 與螢幕右側對齊
    zIndex: 1, // 確保元素位於 z 軸的最上層
    justifyContent: 'center', // 垂直方向居中對齊
    alignItems: 'center', // 水平方向居中對齊
  },
  citySelect: {
    width: 200, // Picker 的寬度為 200 像素
    height: 50, // Picker 的高度為 50 像素
  },
  temperatureContainer: {
    flexDirection: 'row', // 水平排列子元素
    justifyContent: 'space-around', // 子元素之間均勻分佈
    alignItems: 'center', // 垂直方向居中對齊
    marginTop: 300, // 與上方區塊的距離為 300像素
  },
  leftColumnTemperatureContainer: {
    flex: 1, // 子元素按比例佔據可用空間
    alignItems: 'center', // 水平方向居中對齊
  },
  rightColumnTemperatureContainer: {
    flex: 1, // 子元素按比例佔據可用空間
    alignItems: 'center', // 水平方向居中對齊
  },
  temperatureTextContainer: {
    flexDirection: 'row', // 水平排列
    alignItems: 'center', // 垂直居中
  },
  lowestesttemperatureText: {
    fontSize: 24,
    marginRight: 10, // 設置右邊距
  },
  highesttemperatureText: {
    fontSize: 24,
  },
  temperatureTitle: {
    fontSize: 16, // 文字大小為 16 像素
    fontWeight: 'bold', // 文字加粗
    marginBottom: 5, // 文字底部與下一個元素的間距為 5 像素
  },
  temperatureText: {
    fontSize: 24, // 文字大小為 24 像素
  },
  weatherInfoContainer: {
    justifyContent: 'center', // 垂直方向居中對齊
    alignItems: 'center', // 水平方向居中對齊
    borderColor: 'blue', // 邊框顏色為藍色
    borderWidth: 1, // 邊框寬度為 1 像素
    padding: 10, // 內邊距為 10 像素
    marginTop: 30, // 與上方區塊的距離為 30 像素
  },
  temperatureChartContainer: {
    alignItems: 'center', // 水平方向居中對齊
    marginTop: 30, // 與上方區塊的距離為 30 像素
  },
  weekdayTimePicker: {
    //flexDirection: 'row', // 水平排列子元素
    alignItems: 'center', // 垂直方向居中對齊
    marginTop: 20, // 與上方區塊的距離為 20 像素
  },
});

export default useCrawler;