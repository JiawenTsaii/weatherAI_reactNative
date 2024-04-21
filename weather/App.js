import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, CheckBox, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // picker備react native剔除(?)了所以莫名的要額外下載+額外import
import { LineChart } from 'react-native-chart-kit';

const App = () => {
  const [city, setCity] = useState('臺北市');
  const [temperature, setTemperature] = useState(25);
  const [weekData, setWeekData] = useState([]); // 存一週的天氣

  const handleCityChange = (value) => {
    setCity(value);
  };

  // 獲取一週的天氣
  const fetchWeekData = async () => {
    try {
      const response = await fetch('https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/F-C0032-005?Authorization=CWA-FADE6AC3-54FB-452F-BC9D-2A94204257D6&downloadType=WEB&format=JSON');
      const text = await response.text();
      const data = JSON.parse(text);
      
      const locations = data.cwaopendata.dataset.location;
      
      for (let i = 0; i < locations.length; i++) {
        // console.log(locations[i].locationName);
        if (locations[i].locationName == city) {
          console.log(locations[i].locationName);
          const locationData = locations[i];
  
          const MaxTimeData = locationData.weatherElement[1].time; // MaxT
          const MinTimeData = locationData.weatherElement[2].time; // MinT
  
          const weekData = MaxTimeData.map(item => {
            const date = new Date(item.startTime);
            const day = date.getDate();
            return {
              day: day,
              high: item.parameter.parameterName,
              low: MinTimeData.find(t => t.startTime === item.startTime).parameter.parameterName // MinT
            };
          });
  
          setWeekData(weekData);
        }
      }
  
    } catch (error) {
  
      console.error('Error fetching week data:', error);
  
    }
  };

  // 當 city 變量改變時，重新獲取數據
  useEffect(() => {
    fetchWeekData();
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


  // 固定溫度
  const randomTemperature = 30;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Picker
          style={styles.picker}
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
      {/* <View style={styles.body}>
        <Text style={styles.temperatureText}>{temperature}°C</Text>
        <Text style={styles.highesttemperatureText}>{randomTemperature}°C</Text>
        <Text style={styles.lowestesttemperatureText}>{randomTemperature}°C</Text>
      </View> */}
      <View style={styles.body}>
        {/* 左半邊 */}
        <View style={styles.leftColumn}>
          <Text style={styles.temperatureTitle}>當前溫度</Text>
          <Text style={styles.temperatureText}>{temperature}°C</Text>
        </View>
        {/* 右半邊 */}
        <View style={styles.rightColumn}>
          <Text style={styles.temperatureTitle}>當日最高/最低溫度</Text>
          <Text style={styles.lowestesttemperatureText}>{randomTemperature}°C</Text>
          <Text style={styles.highesttemperatureText}>{randomTemperature}°C</Text>
        </View>
      </View>


      <View style={styles.body}>
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
      <View style={styles.timeSettingContainer}>
        <Text style={styles.timeSettingTitle}>通知時間設定</Text>
        <View style={styles.timeSettingContent}>
          {/* 在這裡放置你的時間設定元件 */}
          {/* 周一到周日，點擊後彈出時間選擇器 */}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute', // 將地區選擇設成絕對位置
    top: 20, // 跟畫面最上方的距離
    left: 0, // 跟最左邊的距離
    right: 0, // 跟最右邊的距離
    zIndex: 1, // 確定地區選擇在最上面
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    width: 200,
    height: 50,
  },

  body: {
    flexDirection: 'row', // 水平排列
    justifyContent: 'space-between', // 左右對齊
    alignItems: 'center', // 垂直居中
    marginTop: 10, // 設置三個區塊之間的距離
  },
  leftColumn: {
    flex: 1, // 左半邊佔滿可用空間
    alignItems: 'center', // 水平居中
  },
  rightColumn: {
    flex: 1, // 右半邊佔滿可用空間
    alignItems: 'center', // 水平居中
  },
  temperatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5, // 標題底部間距
  },
  temperatureText: {
    fontSize: 24,
  },
  // temperatureText: {
  //   fontSize: 24,
  // },
  highesttemperatureText: {
    fontSize: 24,
  },
  lowestesttemperatureText: {
    fontSize: 24,
  },
  clothingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clothingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  clothingText: {
    fontSize: 16,
  },
  weatherInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'blue',
    borderWidth: 1,
    padding: 10,
    marginTop: 20,
  },

  weatherInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'blue', // 設置藍色邊框
    borderWidth: 1,
    padding: 10, // 添加內部間距
    // marginTop: 20, // 與下方區塊之間的距離
  },
  timeSettingContainer: {
    marginTop: 20,
    padding: 10,
    borderColor: 'blue',
    borderWidth: 1,
  },
  timeSettingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeSettingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
});

export default App;