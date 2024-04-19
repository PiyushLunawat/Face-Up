import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = '99ee7677a8a745ed94b7f7f03fdab53e';
const TOKEN =
  '00699ee7677a8a745ed94b7f7f03fdab53eIAApoyMoTzk7vs7z6VZss24GSras+N37TeYdwlj7EDi9qSKBCQIAAAAAEACKRNzQfi6hYgEAAQCsMKFi';
const CHANNEL = 'wdj';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

const ConnectVew = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === 'audio') {
      // user.audioTrack.play()
    }
  };

  const handleUserLeft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  useEffect(() => {
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([
          AgoraRTC.createMicrophoneAndCameraTracks(),
          uid,
        ])
      )
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        client.publish(tracks);
      });

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off('user-published', handleUserJoined);
      client.off('user-left', handleUserLeft);
      client.unpublish(tracks).then(() => client.leave());
    };
  }, []);

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
      <div className="right-side">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 200px)',
        }}
      >
        {users.map((user) => (
         <p>{user.uid} user={user}</p>
        ))}
      </div>
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

export default ConnectVew;
