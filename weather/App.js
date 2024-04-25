import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TextInput, CheckBox, Platform, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Alert} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // picker備react native剔除(?)了所以莫名的要額外下載+額外import
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';// 從Expo import DateTimePicker 组件(套件?)
// import axios from 'axios';
import crawler from './crawler.js';

{/* 通知時間 */}
const WeekdayTimePicker = ({ day }) => {
  const [selectedTime, setSelectedTime] = useState(null);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirm = (time) => {
    setSelectedTime(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })); // 格式化並設置所選擇的時間
    hideTimePicker();
  };

  const handleSaveTime = () => {
    // 在這裡可以將所選擇的時間存儲下來，這裡僅示範 Alert 顯示
    Alert.alert('已選擇時間', `您選擇的${day}的時間是：${selectedTime}`);
  };

  return (
    <View style={styles.weekdayTimePicker}>
      <Text>{day}</Text>
      <Button title="選擇時間" onPress={showTimePicker} />
      {isTimePickerVisible && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          onChange={(event, selectedDate) => handleConfirm(selectedDate)}
        />
      )}
      {selectedTime && (
        <Button title="確定提醒時間" onPress={handleSaveTime} />
      )}
    </View>
  );
};

{/* main */}
const App = () => {
  const [city, setCity] = useState('臺北市');
  const [temperature, setTemperature] = useState(25);
  const [weekData, setWeekData] = useState([0, 0, 0, 0, 0]); // 存一週的天氣
  const [rainProbability, setRainProbability] = useState(50); // 降雨機率
  const [weatherCondition, setWeatherCondition] = useState('晴天'); // 天氣狀況

  const handleCityChange = (value) => {
    setCity(value);
  };

  const [weekDataforalarm, setWeekDataforalarm] = useState([
    { day: '周一', time: null },
    { day: '周二', time: null },
    { day: '周三', time: null },
    { day: '周四', time: null },
    { day: '周五', time: null },
    { day: '周六', time: null },
    { day: '周日', time: null }
  ]);
  
  // 獲取一週的天氣
  const fetchWeekData = async () => {
    
    // crawler();
    
    try {
      const response = await fetch('https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/F-C0032-005?Authorization=CWA-FADE6AC3-54FB-452F-BC9D-2A94204257D6&downloadType=WEB&format=JSON');
      const text = await response.text();
      const data = JSON.parse(text);
      
      const locations = data.cwaopendata.dataset.location;
      
      for (let i = 0; i < locations.length; i++) {
        if (locations[i].locationName == city) {
          console.log(locations[i].locationName);
          const locationData = locations[i];
  
          const conditionData = locationData.weatherElement[0].time;  //Wx
          const MaxTimeData = locationData.weatherElement[1].time; // MaxT
          const MinTimeData = locationData.weatherElement[2].time; // MinT
  
          let weekData = {};

          conditionData.forEach(item => {
            const date = new Date(item.startTime);
            const day = date.getDate();
            weekData[day] = { ...weekData[day], condition: item.parameter.parameterName}
          });

          MaxTimeData.forEach(item => {
            const date = new Date(item.startTime);
            const day = date.getDate();
            if (!weekData[day] || !weekData[day].high || weekData[day].high < item.parameter.parameterName) {
              weekData[day] = { ...weekData[day], high: item.parameter.parameterName };
            }
          });

          MinTimeData.forEach(item => {
            const date = new Date(item.startTime);
            const day = date.getDate();
            if (!weekData[day] || !weekData[day].low || weekData[day].low > item.parameter.parameterName) {
              weekData[day] = { ...weekData[day], low: item.parameter.parameterName };
            }

          });

          weekData = Object.keys(weekData).map(day => ({ day: day, ...weekData[day] }));
  
          setWeekData(weekData);
        }
      }
  
    } catch (error) {
  
      console.error('Error fetching week data:', error);
  
    }
  };

  const fetchRainData = async () => {
    try {
      const response = await fetch('https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-FADE6AC3-54FB-452F-BC9D-2A94204257D6');
      const text = await response.text();
      const data = JSON.parse(text);
      
      const locations = data.records.location;
      
      for (let i = 0; i < locations.length; i++) {
        if (locations[i].locationName == city) {

          const locationData = locations[i];
  
          const RainData = locationData.weatherElement[1].time[0].parameter.parameterName;  //PoP
          setRainProbability(RainData);
          // console.log("RainData", RainData);
        }
      }
  
    } catch (error) {
  
      console.error('Error fetching week data:', error);
  
    }
  };

  // 當 city 變量改變時，重新獲取數據
  useEffect(() => {
    fetchWeekData();
    fetchRainData();
  }, [city]); // 將 city 添加到依賴陣列

  const chartData = {
    labels: weekData.map((day) => day.day),
    datasets: [
      {
        data: weekData.map((day) => day.high),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // 紅色線
        strokeWidth: 2
      },
      {
        data: weekData.map((day) => day.low),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // 藍色線
        strokeWidth: 2
      }
    ]
  };

  const today = new Date().getDate();
  const todayData = weekData.find(day => day.condition);

  {/* 當天最高/最低溫 */}
  const dailyHighs = weekData.map(day => day.high);
  const dailyLows = weekData.map(day => day.low);
  const todayHigh = Math.max(...dailyHighs); // 找到今天的最高溫
  const todayLow = Math.min(...dailyLows); // 找到今天的最低溫

  return (
    // ScrollView把整個return包起來超出畫面的部分才可以上下滑動查看
    <ScrollView contentContainerStyle={styles.scrollView}>
        
        {/* 縣市選擇 */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Picker
              style={styles.citySelect}
              selectedValue={city}
              onValueChange={(itemValue) => setCity(itemValue)}>
              <Picker.Item label="臺北市" value="臺北市" />
              <Picker.Item label="新北市" value="新北市" />
              <Picker.Item label="桃園市" value="桃園市" />
              <Picker.Item label="臺中市" value="臺中市" />
              <Picker.Item label="臺南市" value="臺南市" />
              <Picker.Item label="高雄市" value="高雄市" />
              <Picker.Item label="基隆市" value="基隆市" />
              <Picker.Item label="新竹市" value="新竹市" />
              <Picker.Item label="嘉義市" value="嘉義市" />
              <Picker.Item label="新竹縣" value="新竹縣" />
              <Picker.Item label="苗栗縣" value="苗栗縣" />
              <Picker.Item label="彰化縣" value="彰化縣" />
              <Picker.Item label="南投縣" value="南投縣" />
            </Picker>
          </View>
          
          {/* 溫度temperatureContainer */}       
          <View style={styles.temperatureContainer}>
            {/* 左半邊leftColumnTemperatureContainer */}
            <View style={styles.leftColumnTemperatureContainer}>
              <Text style={styles.temperatureTitle}>當前溫度</Text>
              <Text style={styles.temperatureText}>{temperature}°C</Text>
            </View>
            {/* 右半邊rightColumnTemperatureContainer */}
            <View style={styles.rightColumnTemperatureContainer}>
              <Text style={styles.temperatureTitle}>當日最高/最低溫度</Text>
              <View style={styles.temperatureTextContainer}>
                <Text style={styles.lowestesttemperatureText}>{todayHigh}°C</Text>
                <Text style={styles.highesttemperatureText}>{todayLow}°C</Text>
              </View>
            </View>
          </View>
          
          {/* 降雨機率weatherInfoContainer */}
          <View style={styles.weatherInfoContainer}>
            <View style={styles.middleColumn}>
                <Text style={styles.temperatureTitle}>目前降雨機率</Text>
                <Text style={styles.temperatureText}>{rainProbability}%</Text>
            </View>
          </View>

          {/* 天氣狀況weatherInfoContainer */}
          <View style={styles.weatherInfoContainer}>
            <View style={styles.weatherConditionContainer}>
              <Text style={styles.temperatureTitle}>今日天氣狀況</Text>
              <Text style={styles.weatherConditionText}>{todayData ? todayData.condition : 'N/A'}</Text>
            </View>
          </View>

          {/* 一周最高最低溫折線圖temperatureChartContainer */}
          <View style={styles.temperatureChartContainer}>
            <LineChart
              data={chartData}
              width={350}
              height={220}
              yAxisSuffix="°C"
              withVerticalLines={false}
              withHorizontalLines={false}
              withDots={false}
              chartConfig={{
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: '0'
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
          
          {/* 時間設定weekdayTimePicker */}
          <View style={styles.weekdayTimePicker}>
            {weekData.map((item, index) => (
              <WeekdayTimePicker key={`${item.day}-${index}`} day={item.day} />
            ))}
          </View>

        </View>

    </ScrollView>
    
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

export default App;