import { useRef, useState } from "react";
import "./Connect.css";
import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  onCameraChanged,
  onMicrophoneChanged
} from "agora-rtc-sdk-ng/esm";

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
    token.current = "007eJxTYKhP7ckw/zjvcPMKQWWOM9Mru250hjOV+9ey9x3m1E7uqlBgMDJNNE0yMLU0NzVKMTEzSUyySDG3TE42NTEwMjQ2N0hi8pFLawhkZDC8VsXKyACBID4LQ1B+fi4DAwCe2Rwo";
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
      await leaveChannel();
    }

    client.on("user-published", onUserPublish);

    await client.join(
      appid.current,
      channel.current,
      token.current || null,
      null
    );
    setIsJoined(true);

    await Promise.all([turnOnCamera(true), turnOnMicrophone(true)]);
    await client.publish([videoTrack, audioTrack]);
    setIsVideoPubed(true);
    setIsAudioPubed(true);
  };

  const leaveChannel = async () => {
    window.location.reload();
  };

  const onUserPublish = async (user, mediaType) => {
    if (mediaType === "video") {
      const remoteTrack = await client.subscribe(user, mediaType);
      remoteTrack.play("remote-video");
      setIsVideoSubed(true);
    }
    if (mediaType === "audio") {
      const remoteTrack = await client.subscribe(user, mediaType);
      remoteTrack.play();
    }
  };

  return (
    <>
      <div className="left-side">
        <div className="buttons">
          {isJoined && <><button onClick={() => turnOnCamera()} className={isVideoOn ? "button-on" : ""}>
            Turn {isVideoOn ? "off" : "on"} camera
          </button>
          <button onClick={() => turnOnMicrophone()} className={isAudioOn ? "button-on" : ""}>
            Turn {isAudioOn ? "off" : "on"} microphone
          </button></>}
        </div>
        <div className="buttons">
          <button onClick={joinChannel} className={isJoined ? "button-on" : ""}>
            {isJoined ? "Leave Channel" : "Join Channel"}
          </button>
        </div>
      </div>
      <div className="right-side">
        <video id="camera-video" hidden={isVideoOn ? false : true}></video>
        <video id="remote-video" hidden={isVideoSubed ? false : true}></video>
        {isJoined && !isVideoSubed ? (
          <div className="waiting">
            You can share channel {channel.current} with others.....
          </div>
        ) : null}
      </div>
    </>
  );
}

export default ConnectView;
