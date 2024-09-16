import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, Alert, Modal, TouchableHighlight} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // picker備react native剔除(?)了所以莫名的要額外下載+額外import
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';// 從Expo import DateTimePicker 组件(套件?)
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Audio } from 'expo-av';

import Crawler from './useCrawler.js';
import cities from './selectCity.js';
import * as knowledge from './weatherKnow.json';

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

  const [weekDataforalarm, setWeekDataforalarm] = useState([
    { day: '週一', time: null },
    { day: '週二', time: null },
    { day: '週三', time: null },
    { day: '週四', time: null },
    { day: '週五', time: null },
    { day: '週六', time: null },
    { day: '週日', time: null }
  ]);

  const handleSaveTime = async () => {
    try {
      // 將選擇的時間轉換成字符串格式
      const timeData = JSON.stringify(weekDataforalarm);
      // AsyncStorage 使用'weekDataforalarm'識別您保存的數據
      await AsyncStorage.setItem('weekDataforalarm', timeData);
      // 提示用戶數據已成功保存
      Alert.alert('保存成功', '您選擇的時間已成功保存到本地。');
    } catch (error) {
      // 如果保存數據時發生錯誤顯示錯誤消息
      console.error('保存時間數據時出錯:', error);
      Alert.alert('保存失敗', '保存時間數據時出錯，請稍後重試。');
    }
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

  const [temperature, setTemperature] = useState(25);
  const [weekData, setWeekData] = useState([0, 0, 0, 0, 0]); // 存一週的天氣
  const [rainProbability, setRainProbability] = useState(50); // 降雨機率
  const [weatherCondition, setWeatherCondition] = useState('晴天'); // 天氣狀況
  
  /* 選擇地區 */
  const [city, setCity] = useState('臺北市');
  const [district, setDistrict] = useState('');
  const [distInCity, setDistInCity] = useState([]);
  const [TID, setTID] = useState('');

  const handleCityChange = (city) => {
    setCity(city);
    setDistInCity(cities[city]);
    setDistrict('');
  };

  const handleDistrictChange = (district) => {
    setDistrict(district);
    setTID(distInCity[district]);
  };

  const weekdays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
  
  // 獲取一週的天氣
  const fetchWeekData = async () => {

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

  // 本地時間數據的 useEffect
  useEffect(() => {
    const loadTimeData = async () => {
      try {
        // 從本地存儲中讀取所保存的時間數據
        const storedData = await AsyncStorage.getItem('weekDataforalarm');
        if (storedData !== null) {
          // 如果找到本地數據，轉換為對象格式並設置為狀態
          setWeekDataforalarm(JSON.parse(storedData));
        } else {
          // 如果沒有找到本地數據，您可以執行相應的處理邏輯，例如顯示默認值
          console.log('找不到本地時間數據。');
        }
      } catch (error) {
        // 如果讀取本地數據時發生錯誤，請記錄錯誤消息
        console.error('讀取時間數據時出錯:', error);
      }
    };
    // 調用函數加載本地時間數據
    loadTimeData();
  }, []);

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

  const today_month = (new Date().getMonth() + 1).toString();
  const today_day = new Date().getDate().toString();
  const today = today_month + today_day;

  const todayData = weekData.find(day => day.condition);

  {/* 當天最高/最低溫 */}
  const dailyHighs = weekData.map(day => day.high);
  const dailyLows = weekData.map(day => day.low);
  const todayHigh = Math.max(...dailyHighs); // 找到今天的最高溫
  const todayLow = Math.min(...dailyLows); // 找到今天的最低溫

  // 彈出小知識視窗
  
  const [modalVisible, setModalVisible] = useState(false);
  // const word = knowledge.SolarTerms['twotwofour'];
  const [modalWord, setModalWord] = useState(knowledge.SolarTerms['twotwofour']);

  useEffect(() => {

    // 獲取當前日期
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 月份從0開始，所以要+1
    const currentDay = currentDate.getDate();

    // 判斷
    if (currentMonth === 2 && currentDay === 4) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['204']);
    } else if (currentMonth === 2 && currentDay === 19) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['219']);
    } else if (currentMonth === 3 && currentDay === 5) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['305']);
    } else if (currentMonth === 3 && currentDay === 20) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['320']);
    } else if (currentMonth === 4 && currentDay === 5) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['405']);
    } else if (currentMonth === 4 && currentDay === 20) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['420']);
    } else if (currentMonth === 5 && currentDay === 5) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['505']);
    } else if (currentMonth === 5 && currentDay === 21) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['521']);
    } else if (currentMonth === 6 && currentDay === 6) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['606']);
    } else if (currentMonth === 6 && currentDay === 21) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['621']);
    } else if (currentMonth === 7 && currentDay === 7) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['707']);
    } else if (currentMonth === 7 && currentDay === 23) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['723']);
    } else if (currentMonth === 8 && currentDay === 7) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['807']);
    } else if (currentMonth === 8 && currentDay === 23) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['823']);
    } else if (currentMonth === 9 && currentDay === 7) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['907']);
    } else if (currentMonth === 9 && currentDay === 23) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['923']);
    } else if (currentMonth === 10 && currentDay === 8) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1008']);
    } else if (currentMonth === 10 && currentDay === 23) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1023']);
    } else if (currentMonth === 11 && currentDay === 7) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1107']);
    } else if (currentMonth === 11 && currentDay === 22) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1122']);
    } else if (currentMonth === 12 && currentDay === 7) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1207']);
    } else if (currentMonth === 12 && currentDay === 22) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['1222']);
    } else if (currentMonth === 1 && currentDay === 5) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['105']);
    } else if (currentMonth === 1 && currentDay === 20) {
      setModalVisible(true);
      setModalWord(knowledge.SolarTerms['120']);
    } else {
      setModalVisible(true);  //待刪
      // setModalVisible(false);
      setModalWord(knowledge.SolarTerms['test']);  //待刪
    }

  }, []);

  /* 背景音樂 */
  const sound = new Audio.Sound();

  useEffect(() => {
    // 當組件掛載時播放背景音樂
    const loadAndPlaySound = async () => {
      try {
        await sound.loadAsync(require('./assets/歡樂的夏日旅行.mp3')); // 替換成你的音檔路徑
        await sound.setIsLoopingAsync(true); // 設置循環播放
        await sound.playAsync();
      } catch (error) {
        console.log('Error loading sound:', error);
      }
    };

    loadAndPlaySound();

    // 當組件卸載時卸載音樂
    return () => {
      sound.unloadAsync();
    };
  }, []);

  return (
    // ScrollView把整個return包起來超出畫面的部分才可以上下滑動查看
    <ScrollView contentContainerStyle={styles.scrollView}>

      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>

              {/* 提示框裡的字 */}
              <Text style={styles.modalText}>{modalWord}</Text>

              {/* 關閉按鈕 */}
              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }} 
              >
                <Text style={styles.textStyle}>Hide Modal</Text>
              </TouchableHighlight>

            </View>
          </View>
        </Modal>
      </View>
        
      <Crawler setTemperature={setTemperature} city={city} district={district} TID={TID}></Crawler>
      
      {/* 縣市選擇 */}
      <View style={styles.container}>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={city}
            onValueChange={(itemValue) => handleCityChange(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="請選擇縣市" value="" />
            {Object.keys(cities).map((city) => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        </View>
        
        {city !== '' && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={district}
              onValueChange={(itemValue) => handleDistrictChange(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="請選擇鄉鎮區" value="" />
                {Object.keys(distInCity).map((district) => (
                  <Picker.Item
                    key={district}
                    label={district}
                    value={district}
                  />
                ))}
              </Picker>
          </View>
        )}
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
        <WeekdayTimePicker key={`${item.day}-${index}`} day={weekdays[index]} />
        ))} 
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // 新增水平方向的內邊距
    paddingTop: 50, // 增加上邊距，讓這部分在最上方
  },
  pickerContainer: {
    flexDirection: 'row', // 讓兩個 Picker 橫向排列
    marginBottom: 150, // 增加底部間距
  },
  picker: {
    flex: 1, // 讓 Picker 充滿可用空間
    height: 50,
    marginHorizontal: 10, // 增加水平間距
  },
  selectedContainer: {
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 16,
  },
  temperatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  leftColumnTemperatureContainer: {
    alignItems: 'center',
  },
  rightColumnTemperatureContainer: {
    alignItems: 'center',
  },
  temperatureTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowestesttemperatureText: {
    fontSize: 24,
    marginRight: 10,
  },
  highesttemperatureText: {
    fontSize: 24,
  },
  temperatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  temperatureText: {
    fontSize: 24,
  },
  weatherInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'blue',
    borderWidth: 1,
    padding: 10,
    marginTop: 20,
  },
  temperatureChartContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  weekdayTimePicker: {
    alignItems: 'center',
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
});

export default App;