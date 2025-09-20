# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

########## React Native ##########
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

########## Hermes ##########
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

########## JNI ##########
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.jni.**

########## Firebase ##########
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

########## Google Play Services ##########
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

########## Razorpay ##########
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

########## Networking (OkHttp, Retrofit, Gson) ##########
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

-keep class retrofit2.** { *; }
-dontwarn retrofit2.**

-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

########## Kotlin ##########
-keep class kotlin.** { *; }
-dontwarn kotlin.**

-keep class kotlinx.** { *; }
-dontwarn kotlinx.**

########## Your Models (for Firebase serialization) ##########
-keep class com.eshopmobile.models.** { *; }

########## Annotations ##########
-keep @androidx.annotation.Keep class * { *; }

########## Enums ##########
-keepclassmembers enum * { *; }