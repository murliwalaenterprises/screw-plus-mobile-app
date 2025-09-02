# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Razorpay SDK rules

 -keep class com.razorpay.** { *; }

 -keep interface com.razorpay.** { *; }

 -keepattributes *Annotation*
 
# Suppress GPay-related warnings

 -dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.**
 
# Fix missing proguard.annotation.Keep

 -keep class proguard.annotation.Keep { *; }

 -keep class proguard.annotation.KeepClassMembers { *; }
