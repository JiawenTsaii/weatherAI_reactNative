import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TextInput, CheckBox, Platform, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Alert} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // picker備react native剔除(?)了所以莫名的要額外下載+額外import
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';// 從Expo import DateTimePicker 组件(套件?)
import Crawler from './useCrawler.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

{/* 鄉鎮市區 */}
const cities = {
  '基隆市': {
      '中正區': '1001701',
      '七堵區': '1001702',
      '暖暖區': '1001703',
      '仁愛區': '1001704',
      '中山區': '1001705',
      '安樂區': '1001706',
      '信義區': '1001707'
      },

  '臺北市': {
      '松山區': '6300100',
      '信義區': '6300200',
      '大安區': '6300300',
      '中山區': '6300400',
      '中正區': '6300500',
      '大同區': '6300600',
      '萬華區': '6300700',
      '文山區': '6300800',
      '南港區': '6300900',
      '內湖區': '6301100',
      '士林區': '6301200',
      '北投區': '6301300'
  },

  '新北市': {
      '板橋區': '6500100',
      '三重區': '6500200',
      '中和區': '6500300',
      '永和區': '6500400',
      '新莊區': '6500500',
      '新店區': '6500600',
      '樹林區': '6500700',
      '鶯歌區': '6500800',
      '三峽區': '6500900',
      '淡水區': '6501000',
      '汐止區': '6501100',
      '瑞芳區': '6501200',
      '土城區': '6501300',
      '蘆洲區': '6501400',
      '五股區': '6501500',
      '泰山區': '6501600',
      '林口區': '6501700',
      '深坑區': '6501800',
      '石碇區': '6501900',
      '坪林區': '6502000',
      '三芝區': '6502100',
      '石門區': '6502200',
      '八里區': '6502300',
      '平溪區': '6502400',
      '雙溪區': '6502500',
      '貢寮區': '6502600',
      '金山區': '6502700',
      '萬里區': '6502800',
      '烏來區': '6502900'
  },

  '桃園市': {
      '桃園區': '6800100',
      '中壢區': '6800200',
      '大溪區': '6800300',
      '楊梅區': '6800400',
      '蘆竹區': '6800500',
      '大園區': '6800600',
      '龜山區': '6800700',
      '八德區': '6800800',
      '龍潭區': '6800900',
      '平鎮區': '6801000',
      '新屋區': '6801100',
      '觀音區': '6801200',
      '復興區': '6801300'
  },

  '新竹市': {
      '東區': '1001801',
      '北區': '1001802',
      '香山區': '1001803'
  },

  '新竹縣': {
      '竹北市': '1000401',
      '竹東鎮': '1000402',
      '新埔鎮': '1000403',
      '關西鎮': '1000404',
      '湖口鄉': '1000405',
      '新豐鄉': '1000406',
      '芎林鄉': '1000407',
      '橫山鄉': '1000408',
      '北埔鄉': '1000409',
      '寶山鄉': '1000410',
      '峨嵋鄉': '1000411',
      '尖石鄉': '1000412',
      '五峰鄉': '1000413'
  },

  '苗栗縣': {
      '苗栗市': '1000501',
      '苑裡鎮': '1000502',
      '通霄鎮': '1000503',
      '竹南鎮': '1000504',
      '頭份市': '1000505',
      '後龍鎮': '1000506',
      '卓蘭鎮': '1000507',
      '大湖鄉': '1000508',
      '公館鄉': '1000509',
      '銅鑼鄉': '1000510',
      '南庄鄉': '1000511',
      '頭屋鄉': '1000512',
      '三義鄉': '1000513',
      '西湖鄉': '1000514',
      '造橋鄉': '1000515',
      '三灣鄉': '1000516',
      '獅潭鄉': '1000517',
      '泰安鄉': '1000518'
  },

  '臺中市': {
      '中區': '6600100',
      '東區': '6600200',
      '南區': '6600300',
      '西區': '6600400',
      '北區': '6600500',
      '西屯區': '6600600',
      '南屯區': '6600700',
      '北屯區': '6600800',
      '豐原區': '6600900',
      '東勢區': '6601000',
      '大甲區': '6601100',
      '清水區': '6601200',
      '沙鹿區': '6601300',
      '梧棲區': '6601400',
      '后里區': '6601500',
      '神岡區': '6601600',
      '潭子區': '6601700',
      '大雅區': '6601800',
      '新社區': '6601900',
      '石岡區': '6602000',
      '外埔區': '6602100',
      '大安區': '6602200',
      '烏日區': '6602300',
      '大肚區': '6602400',
      '龍井區': '6602500',
      '霧峰區': '6602600',
      '太平區': '6602700',
      '大里區': '6602800',
      '和平區': '6602900'
  },

  '彰化縣': {
      '彰化市': '1000701',
      '鹿港鎮': '1000702',
      '和美鎮': '1000703',
      '線西鄉': '1000704',
      '伸港鄉': '1000705',
      '福興鄉': '1000706',
      '秀水鄉': '1000707',
      '花壇鄉': '1000708',
      '芬園鄉': '1000709',
      '員林市': '1000710',
      '溪湖鎮': '1000711',
      '田中鎮': '1000712',
      '大村鄉': '1000713',
      '埔鹽鄉': '1000714',
      '埔心鄉': '1000715',
      '永靖鄉': '1000716',
      '社頭鄉': '1000717',
      '二水鄉': '1000718',
      '北斗鎮': '1000719',
      '二林鎮': '1000720',
      '田尾鄉': '1000721',
      '埤頭鄉': '1000722',
      '芳苑鄉': '1000723',
      '大城鄉': '1000724',
      '竹塘鄉': '1000725',
      '溪州鄉': '1000726'
  },

  '南投縣': {
      '南投市': '1000801',
      '埔里鎮': '1000802',
      '草屯鎮': '1000803',
      '竹山鎮': '1000804',
      '集集鎮': '1000805',
      '名間鄉': '1000806',
      '鹿谷鄉': '1000807',
      '中寮鄉': '1000808',
      '魚池鄉': '1000809',
      '國姓鄉': '1000810',
      '水里鄉': '1000811',
      '信義鄉': '1000812',
      '仁愛鄉': '1000813'
  },

  '雲林縣': {
      '斗六市': '1000901',
      '斗南鎮': '1000902',
      '虎尾鎮': '1000903',
      '西螺鎮': '1000904',
      '土庫鎮': '1000905',
      '北港鎮': '1000906',
      '古坑鄉': '1000907',
      '大埤鄉': '1000908',
      '莿桐鄉': '1000909',
      '林內鄉': '1000910',
      '二崙鄉': '1000911',
      '崙背鄉': '1000912',
      '麥寮鄉': '1000913',
      '東勢鄉': '1000914',
      '褒忠鄉': '1000915',
      '臺西鄉': '1000916',
      '元長鄉': '1000917',
      '四湖鄉': '1000918',
      '口湖鄉': '1000919',
      '水林鄉': '1000920'
  },

  '嘉義市': {
      '東區': '1002001',
      '西區': '1002002'
  },

  '嘉義縣': {
      '太保市': '1001001',
      '朴子市': '1001002',
      '布袋鎮': '1001003',
      '大林鎮': '1001004',
      '民雄鄉': '1001005',
      '溪口鄉': '1001006',
      '新港鄉': '1001007',
      '六腳鄉': '1001008',
      '東石鄉': '1001009',
      '義竹鄉': '1001010',
      '鹿草鄉': '1001011',
      '水上鄉': '1001012',
      '中埔鄉': '1001013',
      '竹崎鄉': '1001014',
      '梅山鄉': '1001015',
      '番路鄉': '1001016',
      '大埔鄉': '1001017',
      '阿里山鄉': '1001018'
  },

  '台南市': {
      '新營區': '6700100',
      '鹽水區': '6700200',
      '白河區': '6700300',
      '柳營區': '6700400',
      '後壁區': '6700500',
      '東山區': '6700600',
      '麻豆區': '6700700',
      '下營區': '6700800',
      '六甲區': '6700900',
      '官田區': '6701000',
      '大內區': '6701100',
      '佳里區': '6701200',
      '學甲區': '6701300',
      '西港區': '6701400',
      '七股區': '6701500',
      '將軍區': '6701600',
      '北門區': '6701700',
      '新化區': '6701800',
      '善化區': '6701900',
      '新市區': '6702000',
      '安定區': '6702100',
      '山上區': '6702200',
      '玉井區': '6702300',
      '楠西區': '6702400',
      '南化區': '6702500',
      '左鎮區': '6702600',
      '仁德區': '6702700',
      '歸仁區': '6702800',
      '關廟區': '6702900',
      '龍崎區': '6703000',
      '永康區': '6703100',
      '東區': '6703200',
      '南區': '6703300',
      '北區': '6703400',
      '安南區': '6703500',
      '安平區': '6703600',
      '中西區': '6703700'
  },

  '高雄市': {
      '鹽埕區': '6400100',
      '鼓山區': '6400200',
      '左營區': '6400300',
      '楠梓區': '6400400',
      '三民區': '6400500',
      '新興區': '6400600',
      '前金區': '6400700',
      '苓雅區': '6400800',
      '前鎮區': '6400900',
      '旗津區': '6401000',
      '小港區': '6401100',
      '鳳山區': '6401200',
      '林園區': '6401300',
      '大寮區': '6401400',
      '大樹區': '6401500',
      '大社區': '6401600',
      '仁武區': '6401700',
      '鳥松區': '6401800',
      '岡山區': '6401900',
      '橋頭區': '6402000',
      '燕巢區': '6402100',
      '田寮區': '6402200',
      '阿蓮區': '6402300',
      '路竹區': '6402400',
      '湖內區': '6402500',
      '茄萣區': '6402600',
      '永安區': '6402700',
      '彌陀區': '6402800',
      '梓官區': '6402900',
      '旗山區': '6403000',
      '美濃區': '6403100',
      '六龜區': '6403200',
      '甲仙區': '6403300',
      '杉林區': '6403400',
      '內門區': '6403500',
      '茂林區': '6403600',
      '桃源區': '6403700',
      '那瑪夏區': '6403800'
  },

  '屏東縣': {
      '屏東市': '1001301',
      '潮州鎮': '1001302',
      '東港鎮': '1001303',
      '恆春鎮': '1001304',
      '萬丹鄉': '1001305',
      '長治鄉': '1001306',
      '麟洛鄉': '1001307',
      '九如鄉': '1001308',
      '里港鄉': '1001309',
      '鹽埔鄉': '1001310',
      '高樹鄉': '1001311',
      '萬巒鄉': '1001312',
      '內埔鄉': '1001313',
      '竹田鄉': '1001314',
      '新埤鄉': '1001315',
      '枋寮鄉': '1001316',
      '新園鄉': '1001317',
      '崁頂鄉': '1001318',
      '林邊鄉': '1001319',
      '南州鄉': '1001320',
      '佳冬鄉': '1001321',
      '琉球鄉': '1001322',
      '車城鄉': '1001323',
      '滿州鄉': '1001324',
      '枋山鄉': '1001325',
      '三地門鄉': '1001326',
      '霧臺鄉': '1001327',
      '瑪家鄉': '1001328',
      '泰武鄉': '1001329',
      '來義鄉': '1001330',
      '春日鄉': '1001331',
      '獅子鄉': '1001332',
      '牡丹鄉': '1001333'
  },

  '宜蘭縣': {
      '宜蘭市': '1000201',
      '羅東鎮': '1000202',
      '蘇澳鎮': '1000203',
      '頭城鎮': '1000204',
      '礁溪鄉': '1000205',
      '壯圍鄉': '1000206',
      '員山鄉': '1000207',
      '冬山鄉': '1000208',
      '五結鄉': '1000209',
      '三星鄉': '1000210',
      '大同鄉': '1000211',
      '南澳鄉': '1000212'
  },

  '花蓮縣': {
      '花蓮市': '1001501',
      '鳳林鎮': '1001502',
      '玉里鎮': '1001503',
      '新城鄉': '1001504',
      '吉安鄉': '1001505',
      '壽豐鄉': '1001506',
      '光復鄉': '1001507',
      '豐濱鄉': '1001508',
      '瑞穗鄉': '1001509',
      '富里鄉': '1001510',
      '秀林鄉': '1001511',
      '萬榮鄉': '1001512',
      '卓溪鄉': '1001513'
  },

  '臺東縣': {
      '臺東市': '1001401',
      '成功鎮': '1001402',
      '關山鎮': '1001403',
      '卑南鄉': '1001404',
      '鹿野鄉': '1001405',
      '池上鄉': '1001406',
      '東河鄉': '1001407',
      '長濱鄉': '1001408',
      '太麻里鄉': '1001409',
      '大武鄉': '1001410',
      '綠島鄉': '1001411',
      '海端鄉': '1001412',
      '延平鄉': '1001413',
      '金峰鄉': '1001414',
      '達仁鄉': '1001415',
      '蘭嶼鄉': '1001416'
  },

  '澎湖縣': {
      '馬公市': '1001601',
      '湖西鄉': '1001602',
      '白沙鄉': '1001603',
      '西嶼鄉': '1001604',
      '望安鄉': '1001605',
      '七美鄉': '1001606'
  },

  '金門縣': {
      '金城鎮': '0902001',
      '金沙鎮': '0902002',
      '金湖鎮': '0902003',
      '金寧鄉': '0902004',
      '列嶼鄉': '0902005',
      '烏坵鄉': '0902006'
  },

  '連江縣': {
      '南竿鄉': '0900701',
      '北竿鄉': '0900702',
      '莒光鄉': '0900703',
      '東引鄉': '0900704'
  }

};

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

  // const handleSaveTime = () => {
  //   // 在這裡可以將所選擇的時間存儲下來，這裡僅示範 Alert 顯示
  //   Alert.alert('已選擇時間', `您選擇的${day}的時間是：${selectedTime}`);
  // };
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
    // console.log("distInCity", distInCity);
    // console.log("district", district);
    // console.log("distInCity[district]", distInCity[district]);
  };

  const weekdays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  // const [weekDataforalarm, setWeekDataforalarm] = useState([
  //   { day: '週一', time: null },
  //   { day: '週二', time: null },
  //   { day: '週三', time: null },
  //   { day: '週四', time: null },
  //   { day: '週五', time: null },
  //   { day: '週六', time: null },
  //   { day: '週日', time: null }
  // ]);
  
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
});

export default App;