#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <FastLED.h>
#include <LittleFS.h>

// LED Configuration
#define LED_PIN 5
#define NUM_LEDS 60
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

// WiFi AP Configuration
const char* ap_ssid = "LED-Control";
const char* ap_password = "12345678";  // Minimum 8 characters

// LED Array
CRGB leds[NUM_LEDS];

// Current LED State
struct LEDState {
  uint8_t r = 255;
  uint8_t g = 255;
  uint8_t b = 255;
  uint8_t brightness = 128;
  bool power = true;
} ledState;

// Web Server
AsyncWebServer server(80);

// Function to update LEDs
void updateLEDs() {
  if (ledState.power) {
    CRGB color = CRGB(ledState.r, ledState.g, ledState.b);
    fill_solid(leds, NUM_LEDS, color);
    FastLED.setBrightness(ledState.brightness);
  } else {
    fill_solid(leds, NUM_LEDS, CRGB::Black);
  }
  FastLED.show();
}

// CORS headers helper
void addCORSHeaders(AsyncWebServerResponse* response) {
  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response->addHeader("Access-Control-Allow-Headers", "Content-Type");
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nIniciando LED Control System...");

  // Initialize FastLED
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(ledState.brightness);
  updateLEDs();
  
  Serial.println("LEDs inicializados");

  // Configure WiFi Access Point
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ap_ssid, ap_password);
  
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  Serial.print("SSID: ");
  Serial.println(ap_ssid);
  Serial.print("Password: ");
  Serial.println(ap_password);

  // Handle CORS preflight requests
  server.on("/api/color", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    addCORSHeaders(response);
    request->send(response);
  });

  server.on("/api/brightness", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    addCORSHeaders(response);
    request->send(response);
  });

  server.on("/api/power", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    addCORSHeaders(response);
    request->send(response);
  });

  server.on("/api/status", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    addCORSHeaders(response);
    request->send(response);
  });

  // API Endpoint: Set Color
  server.on("/api/color", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, data, len);
      
      if (error) {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        addCORSHeaders(response);
        request->send(response);
        return;
      }

      if (doc.containsKey("r") && doc.containsKey("g") && doc.containsKey("b")) {
        ledState.r = doc["r"];
        ledState.g = doc["g"];
        ledState.b = doc["b"];
        updateLEDs();
        
        Serial.printf("Color changed to R:%d G:%d B:%d\n", ledState.r, ledState.g, ledState.b);
        
        AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"status\":\"ok\"}");
        addCORSHeaders(response);
        request->send(response);
      } else {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Missing r, g, or b\"}");
        addCORSHeaders(response);
        request->send(response);
      }
    }
  );

  // API Endpoint: Set Brightness
  server.on("/api/brightness", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, data, len);
      
      if (error) {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        addCORSHeaders(response);
        request->send(response);
        return;
      }

      if (doc.containsKey("value")) {
        ledState.brightness = doc["value"];
        updateLEDs();
        
        Serial.printf("Brightness changed to %d\n", ledState.brightness);
        
        AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"status\":\"ok\"}");
        addCORSHeaders(response);
        request->send(response);
      } else {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Missing value\"}");
        addCORSHeaders(response);
        request->send(response);
      }
    }
  );

  // API Endpoint: Power On/Off
  server.on("/api/power", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, data, len);
      
      if (error) {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        addCORSHeaders(response);
        request->send(response);
        return;
      }

      if (doc.containsKey("state")) {
        ledState.power = doc["state"];
        updateLEDs();
        
        Serial.printf("Power %s\n", ledState.power ? "ON" : "OFF");
        
        AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"status\":\"ok\"}");
        addCORSHeaders(response);
        request->send(response);
      } else {
        AsyncWebServerResponse *response = request->beginResponse(400, "application/json", "{\"error\":\"Missing state\"}");
        addCORSHeaders(response);
        request->send(response);
      }
    }
  );

  // API Endpoint: Get Status
  server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request){
    JsonDocument doc;
    doc["r"] = ledState.r;
    doc["g"] = ledState.g;
    doc["b"] = ledState.b;
    doc["brightness"] = ledState.brightness;
    doc["power"] = ledState.power;
    
    String response;
    serializeJson(doc, response);
    
    AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", response);
    addCORSHeaders(resp);
    request->send(resp);
  });

  // Initialize LittleFS
  if(!LittleFS.begin()){
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }

  // Serve static files
  server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");

  // Start server
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("Ready to receive commands!");
}

void loop() {
  // Nothing needed here, async server handles everything
  delay(10);
}
