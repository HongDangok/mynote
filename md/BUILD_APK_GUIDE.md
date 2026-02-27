# Hướng dẫn Build APK cho MyNote

## Cách 1: Build Local (Cần Android SDK)

### Bước 1: Cài đặt Android Studio
1. Tải và cài đặt [Android Studio](https://developer.android.com/studio)
2. Mở Android Studio và cài đặt Android SDK
3. Ghi nhớ đường dẫn SDK (thường là: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`)

### Bước 2: Cấu hình Android SDK
Tạo file `android/local.properties` với nội dung:
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```
(Thay `YourUsername` bằng tên user của bạn)

Hoặc set biến môi trường:
```powershell
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

### Bước 3: Build APK
```bash
npm run build:apk
```

File APK sẽ được tạo tại: `android/app/build/outputs/apk/release/app-release.apk`

---

## Cách 2: Build trên Cloud với EAS Build (Không cần Android SDK)

### Bước 1: Cài đặt EAS CLI
```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập Expo
```bash
eas login
```
(Tạo tài khoản miễn phí tại https://expo.dev nếu chưa có)

### Bước 2: Đăng nhập Expo (nếu chưa đăng nhập)
```bash
eas login
```
(Tạo tài khoản miễn phí tại https://expo.dev nếu chưa có)

### Bước 3: Build APK
```bash
npm run build:apk:eas
```
hoặc
```bash
eas build --platform android --profile preview
```

File APK sẽ được tải về sau khi build xong (thường mất 10-20 phút).

---

## Lưu ý

- APK được build với debug keystore (chỉ dùng để test)
- Để publish lên Google Play, cần tạo release keystore và cấu hình trong `android/app/build.gradle`
- File APK release thường có kích thước khoảng 20-50MB

