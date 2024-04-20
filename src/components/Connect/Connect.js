import { useRef, useState, useEffect } from "react";
import "./Connect.css";
import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  onCameraChanged,
  onMicrophoneChanged
} from "agora-rtc-sdk-ng/esm";

import AgoraRTC from 'agora-rtc-sdk-ng';

onCameraChanged((device) => {
  console.log("onCameraChanged: ", device);
});
onMicrophoneChanged((device) => {
  console.log("onMicrophoneChanged: ", device);
});

const client = createClient({
  mode: "rtc",
  codec: "vp8",
});
let audioTrack;
let videoTrack;

function ConnectView() {
  const channel = useRef("");
  const appid = useRef("");
  const token = useRef("");
  if (!appid.current) {
    appid.current = "25a5b059752d464ab8d79cc54021370b";
  }
  if (!token.current) {
    token.current = "007eJxTYPBnu720O+ThWekzsntU9jWr+d4VnPkhKmML12rl860s/ysVGIxME02TDEwtzU2NUkzMTBKTLFLMLZOTTU0MjAyNzQ2SXjsopzUEMjL8TshiYWSAQBCfhSEoPz+XgQEAKl4ewA==";
  }
  if (!channel.current) {
    channel.current = "Room";
  }
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioPubed, setIsAudioPubed] = useState(false);
  const [isVideoPubed, setIsVideoPubed] = useState(false);
  const [isVideoSubed, setIsVideoSubed] = useState(false);
  const turnOnCamera = async (flag) => {
    flag = flag ?? !isVideoOn;
    setIsVideoOn(flag);

    if (videoTrack) {
      return videoTrack.setEnabled(flag);
    }
    videoTrack = await createCameraVideoTrack();
    videoTrack.play("camera-video");
  };

  const turnOnMicrophone = async (flag) => {
    flag = flag ?? !isAudioOn;
    setIsAudioOn(flag);

    if (audioTrack) {
      return audioTrack.setEnabled(flag);
    }

    audioTrack = await createMicrophoneAudioTrack();
    // audioTrack.play();
  };

  const [isJoined, setIsJoined] = useState(false);

  const joinChannel = async () => {
    if (isJoined) {
      const confirmLeave = window.confirm("You are already in a channel. Do you want to leave and join a new channel?");
      if (confirmLeave) {
        await leaveChannel();
      } else {
        return;
      }
    }
  
    client.on("user-published", onUserPublish);
  
    await client.join(
      appid.current,
      channel.current,
      token.current || null,
      null
    );
    setIsJoined(true);
  };
  
  
  const leaveChannel = async () => {
    window.location.reload();
  };

  const onUserPublish = async (
    user,
    mediaType
  ) => {
    
    if (mediaType === "video") {
      const remoteTrack = await client.subscribe(user, mediaType);
      remoteTrack.play("remote-video");
      setIsVideoSubed(true);
      const confirmSubscribe = window.confirm(`User ${user.uid} wants to share their ${mediaType}. Do you want to accept?`);
  
      if (!confirmSubscribe) {
        alert('User has Declined the call');
        return; // If the user declines, do nothing
      }
      else{
        await publishVideo();
        setIsVideoPubed(true);
        setIsAudioPubed(true);
      alert('User has connected the call');
      }
    }
    if (mediaType === "audio") {
      const remoteTrack = await client.subscribe(user, mediaType);
      remoteTrack.play();  
      const confirmSubscribe = window.confirm(`User ${user.uid} wants to share their ${mediaType}. Do you want to accept?`);
  
      if (!confirmSubscribe) {
        alert('User has Declined the call');
        return; // If the user declines, do nothing
      }
      else{
        const remoteTrack = await client.subscribe(user, mediaType);
      remoteTrack.play();  
      alert('User has connected the call');
      }
    }
  };

  const publishVideo = async () => {
    await Promise.all([turnOnCamera(), turnOnMicrophone()]);
    if (!isJoined) {
      await joinChannel();
    }
    await client.publish([videoTrack,audioTrack]);
    setIsVideoPubed(true);
    setIsAudioPubed(true);

  };

  const publishAudio = async () => {
    await turnOnMicrophone(true);
    if (!isJoined) {
      await joinChannel();
    }
    await client.publish(audioTrack);
    setIsAudioPubed(true);
  };

  return (
    <>
      <div className="left-side">
        <div className="buttons">
          {(isAudioPubed||isVideoPubed) && <><button onClick={() => turnOnCamera()} className={isVideoOn ? "button-on" : ""}>
            Turn {isVideoOn ? "off" : "on"} camera
          </button>
          <button onClick={() => turnOnMicrophone()} className={isAudioOn ? "button-on" : ""}>
            Turn {isAudioOn ? "off" : "on"} microphone
          </button></>}
        </div>
        <div className="buttons">
        {!isJoined && <><button onClick={joinChannel} className={isJoined ? "button-on" : ""}>
            Join Channel
          </button></>}
          {(!(isAudioPubed||isVideoPubed)&&isJoined) && <><button onClick={publishVideo}className={isVideoPubed ? "button-on" : ""}>
            Video Call
          </button>
          <button onClick={publishAudio} className={isAudioPubed ? "button-on" : ""}>
            Audio Call
          </button></>}
          {(isAudioPubed||isVideoPubed) && <><button onClick={leaveChannel}>Leave Call</button></>}
        </div>
      </div>
     {isJoined && <div className="right-side">
        <video id="camera-video" hidden={isVideoOn ? false : true}></video>
        <video id="remote-video" hidden={isVideoSubed ? false : true}></video>
        {isJoined && !isVideoSubed ? (
          <div className="waiting">
            You can share channel {channel.current} with others.....
          </div>
        ) : null}
      </div>}
    </>
  );
}

export default ConnectView;
