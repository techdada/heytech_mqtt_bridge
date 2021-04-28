# heytech_mqtt_bridge

Control HeyTech roller shutters from MQTT. Based on the great work of Jey-Cee and ansgarschulte (https://github.com/Jey-Cee/ioBroker.heytech)

To make it useable independently of ioBroker it communicates purely by MQTT instead of being an ioBroker adapter. So far only the basic functions are tested, so open/close and goto Position of the shutters.

## requirements

* Heytech shutter controller. I am using RS879M, but the others which have a LAN connection available should work, too. 
* Heytech LAN module.
* MQTT broker (in best case having TLS1.2+ enabled and having a proper authorization concept, at least user/password protection)
* Any MQTT client. I am using most frequently mosquitto-cli tools (Linux), MQTT Dash (Android) and Home Assistant (www.home-assistant.io). Others should do well, too.
* Node.js installation somewhere, or some container host which is able to access the Heytech controller via LAN.

## installation

### natively

install node.js for your platform (https://nodejs.org/en/download/)

clone the repository to a local folder

```git clone https://github.com/techdada/heytech_mqtt_bridge```

```cd heytech_mqtt_bridge```

install dependencies

```npm install```

copy config/default-example.json to config/default.json and enter your required settings there as explained below.

if done, run

```node app.js```


### using docker container

install docker for your platform (https://docs.docker.com/get-docker/)

copy config/default-example.json to config/default.json and enter your required settings there as explained below.

then, build and run docker

```docker build```

```docker run```

If you are having home-assistant running in a docker environment using docker-compose, you may want to use a compose file similar to this:

```
version: "3.4"

services:
  homeassistant:
    image: homeassistant/raspberrypi3-homeassistant
    restart: unless-stopped
    volumes:
      - /home/pi/Docker/home-assistant/configuration:/config
      - /etc/localtime:/etc/localtime:ro
      - /etc/ssl/certs:/etc/ssl/certs:ro
      - /home/pi/Docker/home-assistant/ssl:/ssl
    network_mode: host
    ports:
      - 8123:8123
  heytech:
    build:
      context: /home/pi/Docker/heytech_mqtt_bridge
    restart: unless-stopped
    network_mode: host
    volumes:
      - /home/pi/Docker/heytech_mqtt_bridge/config:/usr/src/app/config
```


## configuration

configuration is done in config/default.json and only requires the communication information to be set:

for Heytech:
* hostname / IP of the LAN module. 
* PIN if set (recommended)

for MQTT:
* hostname / IP and port of the broker
* TLS certificate root file to be used. Leave empty if no TLS is in use (not so much recommended).
* Username / password for the broker
* Topic root nodes for control and status topic.

The rest of the Heytech configuration is read directly from the controller. 

## Handling of the MQTT messages

You may either use the name or the numeric ID to address the shutters. The shutters use a naming scheme consisting of <type>.<identifier>, so e.g.:

control/heytech/shutter.Livingroom
control/heytech/shutter.Office

or:

control/heytech/shutter.12
control/heytech/shutter.2

For using the names, it is recommended to avoid special characters in Heytech controller configuration, like +, hash or anything else what could be interpreted wrongly.

