# heytech_mqtt_bridge
MQTT bridge for HeyTech roller shutter / light controllers, using most of the great work of Jey Cee (https://github.com/Jey-Cee/ioBroker.heytech)

To make it useable independently of ioBroker it communicates purely by MQTT instead. So far only the basic functions are tested, so open/close and goto Position of the shutters.

## installation

### natively

install docker for your platform

clone the repository

```git clone https://github.com/techdada/heytech_mqtt_bridge```
```cd heytech_mqtt_bridge```

install dependencies

```npm install```

copy config/default-example.json to config/default.json and enter your required settings there.

if done, run

```node app.js```


### using docker container

copy config/default-example.json to config/default.json and enter your required settings there

then, build and run docker

```docker build```
```docker run```
