/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Require main module
//var RED = require(process.env.NODE_RED_HOME+"/red/red");
module.exports = function(RED) {

var nfc = require('nfc').nfc;
//var ndef   = require('ndef')


// The main node definition - most things happen in here
function NFCNode(n) {
    RED.nodes.createNode(this,n);
    this.name = n.name;
    this.topic = n.topic;
    
    var node = this;
   
	try {
		this.n = new nfc.NFC();
	} catch (err) {
		node.log("foo");
	}

    this.n.on('read', function(tag){
    	if (node.uid) {
    		if (node.uid == tag.uid) {
    			return;
    		} else {
                node.uid = tag.uid;
            }
    	} else {
    		node.uid = tag.uid;
    		node.timer = setTimeout(function(){
    			delete node.timer;
    			delete node.uid;
    		}, 10000);
    	}

    	
    	var msg = {};
    	if (node.topic) {
    		msg.topic = node.topic;
    	}
        // if (tag.data && tag.offset) {
        //     var ndef = nfc.parse(tag.data.slice(tag.offset));
        // }
    	msg.payload = tag;
    	node.send(msg);
    });
    try {
    	this.n.start();
	} catch (err) {
		node.n.stop();
		node.reset = setTimeout(function(){
			node.log("late restart");
			node.n.start();
		}, 2000);
		node.reset.unref;
	}

    node.on('close', function(){
        try {
        	node.log('shutting down nfc');
        	if (node.timer) {
        		clearTimeout(node.timer);
        	}
        	if (node.reset) {
        		clearTimeout(node.reset);
        	}
        	node.n.stop();
        } catch(err) {
			node.error(err);
		}
   });
};

RED.nodes.registerType("nfc",NFCNode);

// function NDEFNode(n) {
//     RED.nodes.createNode(this,n);
//     this.name = n.name;
//     this.topic = n.topic;

//     var node = this;
//     this.on('input', function(msg){
//         if (msg.payload.data && msg.payload.offset) {
//             var data = msg.payload.data.slice(msg.payload.offset);
//             var results = [];

//             var messages = ndef.decodeMessage(data.toJSON());

//             messages.forEach(function(record){
//                 console.log(record);
//                 if (record.type[0] === ndef.RTD_TEXT[0]) {
//                     console.log(ndef.text.decodePayload(record.type));
//                 } else if (record.type[0] === ndef.RTD_URI[0]) {
//                     console.log(ndef.uri.decodePayload(record.type.slice(1)));
//                 }
//             });

//             // for (i = 0, bytes = data.toJSON(); i < bytes.length; i += tlv.len) {
//             //     tlv = { type: bytes[i++] };
//             //     if ((tlv.type === 0xfe) || (i >= bytes.length)) {
//             //         results.push(tlv);
//             //         break;
//             //     }
//             //     tlv.len = bytes[i++];
//             //     if (tlv.len === 0xff) {
//             //         if ((i + 1) >= bytes.length) {
//             //             break;
//             //         }
//             //         tlv.len = bytes[i++] << 8;
//             //         tlv.len += bytes[i++];
//             //     }
//             //     if ((tlv.len > 0) && ((i + tlv.len) < bytes.length)) {
//             //         tlv.value = bytes.slice(i, i + tlv.len);
//             //     } else {
//             //         console.log(tlv.type + " - "+ tlv.len + " - " + (i + tlv.len) + " - " + bytes.length);
//             //     }
//             //     if ((tlv.type === 0x03) && (!!tlv.value)) {
//             //         tlv.ndef = ndef.decodeMessage(tlv.value);
//             //     }
//             //     if (!!tlv.value) {
//             //         tlv.value = ndef.util.bytesToHexString(tlv.value);
//             //     }
//             //     results.push(tlv);
//             // }

//             msg.payload = results;
//             if (node.topic) {
//                 msg.topic = node.topic;
//             }
//             node.send(msg);
//         }
//     });

// };

// RED.nodes.registerType("ndef", NDEFNode);

}

