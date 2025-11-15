// ✅ YOUR DEPLOYED API CONFIGURATION
// Copy this to your Android project

package com.yourapp.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiConfig {
    
    // ✅ YOUR LIVE AWS API GATEWAY URL
    private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
    
    private fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(provideOkHttpClient())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}

// API Service Interface
interface ApiService {
    
    @POST("api/data")
    suspend fun sendBloodPressure(
        @Body data: VitalData
    ): Response<ApiResponse>
    
    @POST("api/spo2")
    suspend fun sendSpO2(
        @Body data: VitalData
    ): Response<ApiResponse>
    
    @POST("api/temp")
    suspend fun sendTemperature(
        @Body data: VitalData
    ): Response<ApiResponse>
}

// Data Classes
data class VitalData(val value: String)
data class ApiResponse(
    val success: Boolean,
    val message: String? = null,
    val temperature: Float? = null
)

// ============================================
// EXAMPLE USAGE IN YOUR ACTIVITY/FRAGMENT
// ============================================

class MainActivity : AppCompatActivity() {
    
    private val apiService = ApiConfig.apiService
    
    fun sendBloodPressure(systolic: Int, diastolic: Int, bpm: Int) {
        lifecycleScope.launch {
            try {
                val data = VitalData("Result: $systolic / $diastolic, BPM : $bpm")
                val response = apiService.sendBloodPressure(data)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Log.d("API", "✅ BP sent successfully!")
                    Toast.makeText(this@MainActivity, "BP data sent!", Toast.LENGTH_SHORT).show()
                } else {
                    Log.e("API", "❌ Failed: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("API", "❌ Error: ${e.message}", e)
            }
        }
    }
    
    fun sendSpO2(spo2: Int, bpm: Int) {
        lifecycleScope.launch {
            try {
                val data = VitalData("SpO2 : $spo2%, BPM : $bpm")
                val response = apiService.sendSpO2(data)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Log.d("API", "✅ SpO2 sent successfully!")
                    Toast.makeText(this@MainActivity, "SpO2 data sent!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("API", "❌ Error: ${e.message}", e)
            }
        }
    }
    
    fun sendTemperature(temp: Float) {
        lifecycleScope.launch {
            try {
                val data = VitalData("${temp}°C")
                val response = apiService.sendTemperature(data)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Log.d("API", "✅ Temperature sent successfully!")
                    Toast.makeText(this@MainActivity, "Temperature data sent!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("API", "❌ Error: ${e.message}", e)
            }
        }
    }
}

// ============================================
// REQUIRED IMPORTS (Add to your file)
// ============================================

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import android.widget.Toast
import android.util.Log

// ============================================
// GRADLE DEPENDENCIES (Add to app/build.gradle)
// ============================================

/*
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
}
*/

// ============================================
// ANDROID MANIFEST (Add permission)
// ============================================

/*
<uses-permission android:name="android.permission.INTERNET" />
*/
