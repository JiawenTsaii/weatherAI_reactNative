# API

## 當前溫度
- [自動氣象站-氣象觀測資料 (更新頻率:1小時)](https://opendata.cwa.gov.tw/dataset/observation/O-A0001-001) : CoordinateFormat、CoordinateName、StationLatitude、StationLongitude、CountyCode、CountyName、StationAltitude、TownCode、TownName、DateTime、AirPressure、AirTemperature、WindDirection、PeakGustSpeed、Precipitation、RelativeHumidity、Weather、WindSpeed
- [現在天氣觀測報告-現在天氣觀測報告 (更新頻率:10分鐘)](https://opendata.cwa.gov.tw/dataset/observation/O-A0003-001) : CoordinateFormat、CoordinateName、StationLatitude、StationLongitude、CountyCode、CountyName、StationAltitude、TownCode、TownName、DateTime、AirPressure、AirTemperature、GustInfo、WindDirection、PeakGustSpeed、WindSpeed、Precipitation、RelativeHumidity、SunshineDuration、UVI

## 降雨機率
- [一般天氣預報-今明36小時天氣預報 (更新頻率:6小時)](https://opendata.cwa.gov.tw/dataset/forecast/F-C0032-001) : Wx(天氣現象)、MaxT(最高溫度)、MinT(最低溫度)、CI(舒適度)、**PoP(降雨機率)**

## 當日最高/最低溫、天氣狀況、一週內天氣預報
- 一天兩次 (6.~18. / 18.~6.) : [一般天氣預報-一週縣市天氣預報 (更新頻率:6小時)](https://opendata.cwa.gov.tw/dataset/forecast/F-C0032-005) -> **Wx(天氣現象)**、**MaxT(最高溫度)**、**MinT(最低溫度)**

> 偶ㄉAPI授權碼: CWA-FADE6AC3-54FB-452F-BC9D-2A94204257D6