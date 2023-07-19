/* eslint-disable no-restricted-globals */
import React from 'react';
import ReactDOM from 'react-dom';
import ZoomVideo from '@zoom/videosdk';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ZoomContext from './context/zoom-context';
import { devConfig } from './config/dev';
//import { b64DecodeUnicode, generateVideoToken } from './utils/util';
import { b64DecodeUnicode } from './utils/util';

let meetingArgs: any = Object.fromEntries(new URLSearchParams(location.search));
// Add enforceGalleryView to turn on the gallery view without SharedAddayBuffer
if (!meetingArgs.sdkKey || !meetingArgs.topic || !meetingArgs.name || !meetingArgs.signature) {
  meetingArgs = { ...devConfig, ...meetingArgs };
  meetingArgs.enforceGalleryView = true;
}

if (meetingArgs.web) {
  if (meetingArgs.topic) {
    try {
      meetingArgs.topic = b64DecodeUnicode(meetingArgs.topic);
    } catch (e) {}
  } else {
    meetingArgs.topic = '';
  }

  if (meetingArgs.name) {
    try {
      meetingArgs.name = b64DecodeUnicode(meetingArgs.name);
    } catch (e) {}
  } else {
    meetingArgs.name = '';
  }

  if (meetingArgs.password) {
    try {
      meetingArgs.password = b64DecodeUnicode(meetingArgs.password);
    } catch (e) {}
  } else {
    meetingArgs.password = '';
  }

  if (meetingArgs.sessionKey) {
    try {
      meetingArgs.sessionKey = b64DecodeUnicode(meetingArgs.sessionKey);
    } catch (e) {}
  } else {
    meetingArgs.sessionKey = '';
  }

  if (meetingArgs.userIdentity) {
    try {
      meetingArgs.userIdentity = b64DecodeUnicode(meetingArgs.userIdentity);
    } catch (e) {}
  } else {
    meetingArgs.userIdentity = '';
  }

  if (meetingArgs.role) {
    meetingArgs.role = parseInt(meetingArgs.role, 10);
  } else {
    meetingArgs.role = 1;
  }
}

if (!meetingArgs?.cloud_recording_option) {
  meetingArgs.cloud_recording_option = '0';
}
if (!meetingArgs?.cloud_recording_election) {
  meetingArgs.cloud_recording_election = '';
}

/*if (!meetingArgs.signature && meetingArgs.sdkSecret && meetingArgs.topic) {
  meetingArgs.signature = generateVideoToken(
    meetingArgs.sdkKey,
    meetingArgs.sdkSecret,
    meetingArgs.topic,
    meetingArgs.password,
    meetingArgs.sessionKey,
    meetingArgs.userIdentity,
    parseInt(meetingArgs.role, 10),
    meetingArgs.cloud_recording_option,
    meetingArgs.cloud_recording_election
  );
  console.log('=====================================');
  console.log('meetingArgs', meetingArgs);
  }*/

let namefromPrompt = null;
let sessionName = null;
let passcode = null;

while (namefromPrompt == null || namefromPrompt == '') {
  namefromPrompt = prompt('Enter your name', '');
}
console.log(namefromPrompt);
meetingArgs.name = namefromPrompt;

while (sessionName == null || sessionName == '') {
  sessionName = prompt('Enter session name', '');
}
console.log(sessionName);
meetingArgs.sessionKey = sessionName;
meetingArgs.topic = sessionName;

while (passcode == null || passcode == '') {
  passcode = prompt('Enter passcode', '');
}
meetingArgs.passcode = passcode;

fetch('https://zlab.zoom.us/vsdk-auth', {
  //fetch(`/api/`, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionName: meetingArgs.topic,
    role: meetingArgs.role,
    userIdentity: meetingArgs.userIdentity,
    sessionKey: meetingArgs.sessionKey,
    geoRegions: 'US,AU,CA,IN,CN,BR,MX,HK,SG,JP,DE,NL',
    cloudRecordingOption: 1,
    cloudRecordingElection: 0
  })
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log('ajtha signature');
    console.log(data.signature);
    meetingArgs.signature = data.signature;
    const zmClient = ZoomVideo.createClient();

    ReactDOM.render(
      <React.StrictMode>
        <ZoomContext.Provider value={zmClient}>
          <App meetingArgs={meetingArgs as any} />
        </ZoomContext.Provider>
      </React.StrictMode>,
      document.getElementById('root')
    );
  })
  .catch((error) => {
    console.log(error);
  });

console.log('=====================================');
console.log('meetingArgs', meetingArgs);

const urlArgs = {
  topic: meetingArgs.topic,
  name: meetingArgs.name,
  password: meetingArgs.password,
  sessionKey: meetingArgs.sessionKey,
  userIdentity: meetingArgs.userIdentity,
  role: meetingArgs.role || 1,
  cloud_recording_option: meetingArgs.cloud_recording_option,
  cloud_recording_election: meetingArgs.cloud_recording_election,
  web: '1'
};
console.log('use url args');
console.log(window.location.origin + '/?' + new URLSearchParams(urlArgs).toString());

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
