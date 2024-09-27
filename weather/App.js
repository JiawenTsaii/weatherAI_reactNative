import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, Alert, Modal, TouchableHighlight, Image} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // picker備react native剔除(?)了所以莫名的要額外下載+額外import
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';// 從Expo import DateTimePicker 组件(套件?)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

import Crawler from './useCrawler.js';
import cities from './selectCity.js';
import * as knowledge from './weatherKnow.json';

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

  // 初始設定推薦衣物氣溫的參數
  const [summerFitTemperature, setSummerFitTemperature] = useState(25);
  const [winterFitTemperature, setWinterFitTemperature] = useState(20);

  // 新增一個控制彈出視窗顯示的狀態
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  // 顯示並自動隱藏彈出視窗
  const showPopup = (message) => {
    setPopupMessage(message);
    setIsPopupVisible(true);
    setTimeout(() => {
      setIsPopupVisible(false);
    }, 3000);}

  // 推薦衣物溫度
  const adjustRecommendation = (type) => {
    if (temperature >= summerFitTemperature && type === 'hot') {
      setSummerFitTemperature(summerFitTemperature - 1);
      showPopup(`目前的夏裝推薦溫度: ${summerFitTemperature - 1}, 冬裝推薦溫度: ${winterFitTemperature}`);
    } else if (temperature >= summerFitTemperature && type === 'cold') {
      setSummerFitTemperature(summerFitTemperature + 1);
      showPopup(`目前的夏季推薦溫度: ${summerFitTemperature + 1}, 冬季推薦溫度: ${winterFitTemperature}`);
    } else if (temperature <= winterFitTemperature && type === 'hot') {
      setWinterFitTemperature(winterFitTemperature - 1);
      showPopup(`目前的夏季推薦溫度: ${summerFitTemperature}, 冬季推薦溫度: ${winterFitTemperature - 1}`);
    } else if (temperature <= winterFitTemperature && type === 'cold') {
      setWinterFitTemperature(winterFitTemperature + 1);
      showPopup(`目前的夏季推薦溫度: ${summerFitTemperature}, 冬季推薦溫度: ${winterFitTemperature + 1}`);
    } else if (temperature > winterFitTemperature && temperature < summerFitTemperature &&  type === 'cold') {
      setWinterFitTemperature(winterFitTemperature + 1);
      setSummerFitTemperature(summerFitTemperature + 1);
      showPopup(`目前的夏季推薦溫度: ${summerFitTemperature + 1}, 冬季推薦溫度: ${winterFitTemperature + 1}`);
    } else if (temperature > winterFitTemperature && temperature < summerFitTemperature &&  type === 'hot') {
      setWinterFitTemperature(winterFitTemperature - 1);
      setSummerFitTemperature(summerFitTemperature - 1);
      showPopup(`目前的夏季推薦溫度: ${summerFitTemperature - 1}, 冬季推薦溫度: ${winterFitTemperature - 1}`);
    }
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
          // console.log(locations[i].locationName);
          const locationData = locations[i];
  
          const conditionData = locationData.weatherElement[0].time;  //Wx
          const MaxTimeData = locationData.weatherElement[1].time; // MaxT
          const MinTimeData = locationData.weatherElement[2].time; // MinT

          let weekData = {};

          console.log("------new------");

          conditionData.forEach(item => {
            const date = new Date(item.startTime);
            const day = date.getDate();  // 只有"日"，例如9/20就是"20"
            weekData[day] = {
              ...weekData[day],
              condition: item.parameter.parameterName,
              conditionValue: item.parameter.parameterValue
            };
            {/* 這邊的weekData是正確的 */}
            // console.log("date (item.startTime): ");
            // console.log(date);
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
  
          // console.log("Object.keys(weekData): ");
          // console.log(Object.keys(weekData));

          setWeekData(weekData);  // 取到每天的資料都是startTime是當天(?)的第二筆

          // console.log("weekData: ");
          // console.log(weekData);
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

  {/* 失敗 */}
  // 本地時間數據的 useEffect
  // useEffect(() => {
  //   const loadTimeData = async () => {
  //     try {
  //       // 從本地存儲中讀取所保存的時間數據
  //       const storedData = await AsyncStorage.getItem('weekDataforalarm');
  //       if (storedData !== null) {
  //         // 如果找到本地數據，轉換為對象格式並設置為狀態
  //         setWeekDataforalarm(JSON.parse(storedData));
  //       } else {
  //         // 如果沒有找到本地數據，您可以執行相應的處理邏輯，例如顯示默認值
  //         console.log('找不到本地時間數據。');
  //       }
  //     } catch (error) {
  //       // 如果讀取本地數據時發生錯誤，請記錄錯誤消息
  //       console.error('讀取時間數據時出錯:', error);
  //     }
  //   };
  //   // 調用函數加載本地時間數據
  //   loadTimeData();
  // }, []);

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

  {/* 此處weekData是錯的 */}
  const todayData = weekData.find(day => day.condition);
  // const todayData = weekData[0];
  // console.log(weekData);

  // console.log("todayData: ");
  // console.log(todayData);

  /* 當天最高/最低溫 */
  const dailyHighs = weekData.map(day => day.high);
  const dailyLows = weekData.map(day => day.low);
  const todayHigh = Math.max(...dailyHighs); // 找到今天的最高溫
  const todayLow = Math.min(...dailyLows); // 找到今天的最低溫

  {/* 彈出小知識視窗 */}
  const [modalVisible, setModalVisible] = useState(false);
  const [modalWord, setModalWord] = useState('');

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
      // setModalVisible(true);  //待刪
      setModalVisible(false);
      // setModalWord(knowledge.SolarTerms['test']);  //待刪
    }

  }, []);

  {/* 背景音樂 */}
  const sound = new Audio.Sound();

  useEffect(() => {
    console.log("weekData[1]: ");
    console.log(weekData[1]);

    // 當組件掛載時播放背景音樂
    const loadAndPlaySound = async () => {
      const playHappy = [1, 2, 3, 19, 24, 25, 26]  // 晴天: 輕鬆的爵士
      const playPeaceful = [4, 5, 6, 7, 27, 28]  // 陰天: 咖啡廳
      const playLittleSad = [8, 9, 10, 19]  // 小雨: 緩和的爵士
      const playMidSad = [11, 12, 13, 14, 20, 23, 29, 30, 31, 32, 37, 38, 39]  // 有雨: 平和的爵士
      const playVerySad = [15, 16, 17, 18, 21, 22, 33, 34, 35, 36, 40, 41]  // 大雨: 微悲傷的爵士

      if (playHappy.includes(Number(weekData[1].conditionValue))) {
        try {
          await sound.loadAsync(require('./assets/輕鬆的爵士.mp3'));
          await sound.setIsLoopingAsync(true); // 設置循環播放
          await sound.playAsync();
        } catch (error) {
          console.log('Error loading sound:', error);
        }
      } else if (playPeaceful.includes(Number(weekData[1].conditionValue))) {
        try {
          await sound.loadAsync(require('./assets/咖啡廳.mp3'));
          await sound.setIsLoopingAsync(true); // 設置循環播放
          await sound.playAsync();
        } catch (error) {
          console.log('Error loading sound:', error);
        }
      } else if (playLittleSad.includes(Number(weekData[1].conditionValue))) {
        try {
          await sound.loadAsync(require('./assets/緩和的爵士.mp3'));
          await sound.setIsLoopingAsync(true); // 設置循環播放
          await sound.playAsync();
        } catch (error) {
          console.log('Error loading sound:', error);
        }
      } else if (playMidSad.includes(Number(weekData[1].conditionValue))) {
        try {
          await sound.loadAsync(require('./assets/平和的爵士.mp3'));
          await sound.setIsLoopingAsync(true); // 設置循環播放
          await sound.playAsync();
        } catch (error) {
          console.log('Error loading sound:', error);
        }
      } else if (playVerySad.includes(Number(weekData[1].conditionValue))) {
        try {
          await sound.loadAsync(require('./assets/微悲傷的爵士.mp3'));
          await sound.setIsLoopingAsync(true); // 設置循環播放
          await sound.playAsync();
        } catch (error) {
          console.log('Error loading sound:', error);
        }
      }
      
    };

    loadAndPlaySound();

    // 當組件卸載時卸載音樂
    return () => {
      sound.unloadAsync();
    };
  }, [city]);

  return (
    // ScrollView把整個return包起來超出畫面的部分才可以上下滑動查看
    <ScrollView contentContainerStyle={styles.scrollView}>

      {/* 24節氣提示框 */}
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

      {/* 推薦衣服 */}
      <View style={styles.clothingRecommendationContainer}>
        <Text style={styles.recommendationTitle}>推薦衣服</Text>
        {temperature >= summerFitTemperature ? (
          <View style={styles.imageContainer}>
            <Image source={require('./assets/tshirt.png')} style={styles.clothingImage} />
            <Image source={require('./assets/shorts.png')} style={styles.clothingImage} />
          </View>
        ) : temperature <= winterFitTemperature ? (
          <View style={styles.imageContainer}>
            <Image source={require('./assets/sweater.png')} style={styles.clothingImage} />
            <Image source={require('./assets/pants.png')} style={styles.clothingImage} />
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={require('./assets/tshirt.png')} style={styles.clothingImage} />
            <Image source={require('./assets/shorts.png')} style={styles.clothingImage} />
            <Image source={require('./assets/jacket.png')} style={styles.clothingImage} />
          </View>
        )}

        {/* 彈出視窗顯示 */}
        {isPopupVisible && (
          <View style={styles.popup}>
            <Text style={styles.popupText}>{popupMessage}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="太冷 🥶" onPress={() => adjustRecommendation('cold')} />
          <Button title="完美 🥳" onPress={() => adjustRecommendation("perfect")} />
          <Button title="太熱 🥵" onPress={() => adjustRecommendation('hot')} />
        </View>

      </View>
      
      {/* 降雨機率weatherInfoContainer */}
      <View style={styles.weatherInfoContainer1}>
        <View style={styles.middleColumn}>
            <Text style={styles.temperatureTitle}>目前降雨機率</Text>
            <Text style={styles.temperatureText}>{rainProbability}%</Text>
        </View>
      </View>

      {/* 天氣狀況weatherInfoContainer */}
      <View style={styles.weatherInfoContainer2}>
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
      {/* <View style={styles.weekdayTimePicker}>
      {weekData.map((item, index) => (
        <WeekdayTimePicker key={`${item.day}-${index}`} day={weekdays[index]} />
        ))} 
      </View> */}

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

  // 當日氣溫、最高最低溫
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

  // 推薦衣物
  clothingRecommendationContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center'
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  // 推薦衣服的圖片
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  clothingImage: {
    width: 100,  // 調整圖片寬度
    height: 100, // 調整圖片高度
    resizeMode: 'contain', // 確保圖片不變形
    marginHorizontal: 10 // 圖片之間的間距
  },

  // 衣物推薦溫度
  popup: {
    position: 'absolute',
    top: '50%',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  popupText: {
    color: '#fff',
  },

  // 天氣資訊1
  weatherInfoContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
  },

  // 天氣資訊2
  weatherInfoContainer2: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#f0f0f0',
  },

  // 折線圖
  temperatureChartContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  // 時間選擇
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