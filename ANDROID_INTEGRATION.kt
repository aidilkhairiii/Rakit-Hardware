// Android API Configuration for Rakit Hardware
// File: app/src/main/java/com/yourapp/api/ApiConfig.kt

package com.yourapp.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiConfig {
    
    // ⚠️ IMPORTANT: Replace this URL after AWS deployment
    // Get this from: serverless deploy output
    // Format: https://YOUR-API-ID.execute-api.REGION.amazonaws.com/STAGE/
    private const val BASE_URL = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/"
    
    // Alternative: Use BuildConfig for different environments
    // private val BASE_URL = BuildConfig.API_BASE_URL
    
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
// File: app/src/main/java/com/yourapp/api/ApiService.kt

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

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
// File: app/src/main/java/com/yourapp/model/VitalData.kt

data class VitalData(
    val value: String
)

data class ApiResponse(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null
)

// Repository
// File: app/src/main/java/com/yourapp/repository/VitalRepository.kt

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class VitalRepository {
    
    private val apiService = ApiConfig.apiService
    private val TAG = "VitalRepository"
    
    suspend fun sendBloodPressure(systolic: Int, diastolic: Int, bpm: Int): Result<ApiResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val value = "Result: $systolic / $diastolic, BPM : $bpm"
                val response = apiService.sendBloodPressure(VitalData(value))
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "✅ BP sent successfully: $value")
                    Result.success(response.body()!!)
                } else {
                    val error = "Failed: ${response.code()} - ${response.message()}"
                    Log.e(TAG, "❌ BP failed: $error")
                    Result.failure(Exception(error))
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ BP error: ${e.message}", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun sendSpO2(spo2: Int, bpm: Int): Result<ApiResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val value = "SpO2 : $spo2%, BPM : $bpm"
                val response = apiService.sendSpO2(VitalData(value))
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "✅ SpO2 sent successfully: $value")
                    Result.success(response.body()!!)
                } else {
                    val error = "Failed: ${response.code()} - ${response.message()}"
                    Log.e(TAG, "❌ SpO2 failed: $error")
                    Result.failure(Exception(error))
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ SpO2 error: ${e.message}", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun sendTemperature(temp: Float): Result<ApiResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val value = "$temp°C"
                val response = apiService.sendTemperature(VitalData(value))
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "✅ Temperature sent successfully: $value")
                    Result.success(response.body()!!)
                } else {
                    val error = "Failed: ${response.code()} - ${response.message()}"
                    Log.e(TAG, "❌ Temperature failed: $error")
                    Result.failure(Exception(error))
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Temperature error: ${e.message}", e)
                Result.failure(e)
            }
        }
    }
}

// ViewModel Example
// File: app/src/main/java/com/yourapp/viewmodel/VitalViewModel.kt

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class VitalViewModel : ViewModel() {
    
    private val repository = VitalRepository()
    
    private val _uploadState = MutableStateFlow<UploadState>(UploadState.Idle)
    val uploadState: StateFlow<UploadState> = _uploadState
    
    fun sendBloodPressure(systolic: Int, diastolic: Int, bpm: Int) {
        viewModelScope.launch {
            _uploadState.value = UploadState.Loading
            
            val result = repository.sendBloodPressure(systolic, diastolic, bpm)
            
            _uploadState.value = if (result.isSuccess) {
                UploadState.Success("Blood pressure sent successfully!")
            } else {
                UploadState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }
    
    fun sendSpO2(spo2: Int, bpm: Int) {
        viewModelScope.launch {
            _uploadState.value = UploadState.Loading
            
            val result = repository.sendSpO2(spo2, bpm)
            
            _uploadState.value = if (result.isSuccess) {
                UploadState.Success("SpO2 sent successfully!")
            } else {
                UploadState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }
    
    fun sendTemperature(temp: Float) {
        viewModelScope.launch {
            _uploadState.value = UploadState.Loading
            
            val result = repository.sendTemperature(temp)
            
            _uploadState.value = if (result.isSuccess) {
                UploadState.Success("Temperature sent successfully!")
            } else {
                UploadState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }
}

sealed class UploadState {
    object Idle : UploadState()
    object Loading : UploadState()
    data class Success(val message: String) : UploadState()
    data class Error(val message: String) : UploadState()
}

// Usage in Activity/Fragment
// File: app/src/main/java/com/yourapp/ui/VitalActivity.kt

class VitalActivity : AppCompatActivity() {
    
    private val viewModel: VitalViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_vital)
        
        // Observe upload state
        lifecycleScope.launch {
            viewModel.uploadState.collect { state ->
                when (state) {
                    is UploadState.Idle -> {
                        // Show idle state
                    }
                    is UploadState.Loading -> {
                        // Show loading spinner
                        showLoading()
                    }
                    is UploadState.Success -> {
                        // Show success message
                        hideLoading()
                        Toast.makeText(this@VitalActivity, state.message, Toast.LENGTH_SHORT).show()
                    }
                    is UploadState.Error -> {
                        // Show error message
                        hideLoading()
                        Toast.makeText(this@VitalActivity, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
        
        // Example: Send data when button is clicked
        btnSendBP.setOnClickListener {
            val systolic = 120
            val diastolic = 80
            val bpm = 72
            viewModel.sendBloodPressure(systolic, diastolic, bpm)
        }
        
        btnSendSpO2.setOnClickListener {
            val spo2 = 98
            val bpm = 75
            viewModel.sendSpO2(spo2, bpm)
        }
        
        btnSendTemp.setOnClickListener {
            val temp = 37.5f
            viewModel.sendTemperature(temp)
        }
    }
    
    private fun showLoading() {
        // Show your loading indicator
    }
    
    private fun hideLoading() {
        // Hide your loading indicator
    }
}
