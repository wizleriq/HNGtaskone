const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Handle multiple IPs in x-forwarded-for header
  if (clientIp && clientIp.includes(',')) {
    clientIp = clientIp.split(',')[0];
  }

  // Default IP for local testing (use a known public IP for testing purposes)
  if (clientIp === '::1' || clientIp === '127.0.0.1') {
    clientIp = '8.8.8.8'; // Example IP (Google's public DNS server)
  }

  let location = 'unknown';
  let temperature = 'unknown';

  try {
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    location = locationResponse.data.city || 'unknown';

    if (location !== 'unknown') {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.WEATHER_API_KEY}`);
      temperature = weatherResponse.data.main.temp;
    }
  } catch (error) {
    console.error('Error fetching location or weather data:', error);
  }

  res.json({
    client_ip: clientIp,
    location: location,
    greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
