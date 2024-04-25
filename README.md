# React Native - setup
---
- download Expo CLI：`npm install -g expo-cli` <br>
- initialize (expo-cli) : `npx expo init <project_name>`
選擇template時，選擇了 `blank`。<br>

- 執行 : `npx start` <br>
- 手機下載 `Expo` APP ，掃描QRcode或自行輸入網址，查看畫面。 <br>
- 要確認手機和電腦連到同一個wifi畫面才會跑出來
- 程式碼每次儲存時，手機APP會自動更新畫面，若有bug也會顯示在畫面中。
- 用了picker這個東西，但她不知道為什麼會報錯，要先執行這行指令`npm install @react-native-picker/picker`另外安裝picker才能跑
- 用lineChart也要額外安裝`npm install react-native-chart-kit`
- `npx expo install @react-native-community/datetimepicker`時間選擇器DateTimePicker是在'@react-native-community/datetimepicker'套件裡的東西，所以也要先install這個套件才能使用。前面有試其他套件(DateTimePickerModal、)但，因為我用的是Expo所以會有版本問題跟一些衝突(?)



<<<<<<< HEAD
- 目前應該是長這樣
![image](https://github.com/JiawenTsaii/weatherAI_reactNative/blob/master/dress.jpg)