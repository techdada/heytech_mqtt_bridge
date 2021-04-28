const mqtt = require('mqtt');
const fs = require('fs');
const EventEmitter = require('events');

class MqttHandler extends EventEmitter {
  constructor(options) {
    super();
    this.mqttClient = null;
    this.config = options.config;
    this.eventHandler = options.handler;
    this.eventHandler.setCommunicator(this);

    this.on('message',this.publishMessage);
    //console.log(options);
  }

  publishMessage(suffix,message) {
    let topic = this.config.state_topic_root+'/'+suffix;
    console.log("topic: "+topic+", value: "+message);
    this.mqttClient.publish(topic, message);
  }

  processMessage(topic,message) {
    console.log(topic.toString() + " : " + message.toString());
    var rolloId = topic.split('/').pop();
    try {
      var command = JSON.parse(message);
      if (command.action !== undefined) {
        console.log("trigger event for "+rolloId+" - "+command);
        this.eventHandler.emit("message",rolloId,command);
      }
    } catch (e) {
      // retry with plain command
      console.log("trigger event for "+rolloId+" - "+message);
      this.eventHandler.emit("message",rolloId,message);
      return;
    }
  }

  connect() {
    let proto = 'mqtt://';
    var opts = {};
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    if ((this.config.cafile !== undefined) && (this.config.cafile.length > 0 )) {
      opts.ca = [  fs.readFileSync(this.config.cafile) ];
      proto = 'mqtts://';
    }
    if ((this.config.user !== undefined) && (this.config.user.length > 0)){
      if (this.config.pass === undefined) this.config.pass = "";
      opts.username = this.config.user;
      opts.password = this.config.pass;
    }

    if (( this.config.port !== undefined ) && (this.config.port > 0)) {
      opts.port = this.config.port;
    }

    this.mqttClient = mqtt.connect(proto + this.config.host, opts);


    // Mqtt error callback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log('mqtt client connected');
      this.eventHandler.emit("ready");
      this.sendMessage("ONLINE");
    });

    // mqtt subscriptions
    console.log("subscribing to "+this.config.control_topic_root+'/#');
    this.mqttClient.subscribe(this.config.control_topic_root + '/#', {qos: 0});

    // When a message arrives, console.log it
    /*this.mqttClient.on('message', function (topic, message) {
      console.log(topic.toString() + " : " + message.toString());
      self.processMessage(topic,message);
    });*/
    this.mqttClient.on('message', this.processMessage.bind(this));

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    this.mqttClient.publish(this.config.state_topic_root, message);
  }



}

module.exports = MqttHandler;
