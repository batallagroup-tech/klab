# App entry point
-keep class com.batallagroup.klab.MainActivity { *; }
-keep public class * extends com.getcapacitor.BridgeActivity

# Capacitor / Cordova
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Mantener trazas de error legibles
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
