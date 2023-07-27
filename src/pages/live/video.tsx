import { useState, useRef, useEffect } from "react";
import styles from "./video.module.scss";
import { message, Input } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ChatBox } from "../../components";
import { SignDialog } from "./components/sign-dialog";
import { AttachDialog } from "./components/attach-dialog";
import { useSelector } from "react-redux";
import { live, goMeedu } from "../../api/index";
import backIcon from "../../assets/img/commen/icon-back-h.png";
import { courses } from "../../api/user";

declare const window: any;

const LiveVideoPage = () => {
  // store数据
  const user = useSelector((state: any) => state.loginUser.value.user);
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  // 销毁播放器
  const playerDestroy = () => {
    if (liveDPlayerRef.current) {
      liveDPlayerRef.current.destroy();
    }
    if (liveTencentPlayerRef.current) {
      liveTencentPlayerRef.current.dispose();
    }
    if (vodDlayerRef.current) {
      vodDlayerRef.current.destroy();
    }
  };

  // 退出全屏播放
  const exitFullscreen = () => {
    if (liveDPlayerRef.current) {
      liveDPlayerRef.current.fullScreen.cancel();
    }
    if (liveTencentPlayerRef.current) {
      liveTencentPlayerRef.current.exitFullscreen();
    }
  };

  // 三个播放器的实例
  const liveTencentPlayerRef = useRef<any>(null);
  const liveDPlayerRef = useRef<any>(null);
  const vodDlayerRef = useRef<any>(null);

  // 播放器
  const [enabledBulletSecret, setEnabledBulletSecret] = useState(false);
  const [bulletSecretText, setBullectSecretText] = useState("");
  const [bulletSecretColor, setBulletSecretColor] = useState("red");
  const [bulletSecretFontSize, setBulletSecretFontSize] = useState("10px");
  const [bulletSecretFontOpacity, setBulletSecretOpacity] = useState("1");
  const [playerPoster, setPlayerPoster] = useState("");

  useEffect(() => {
    if (config) {
      setEnabledBulletSecret(
        parseInt(config.player.enabled_bullet_secret) === 1
      );
      setBullectSecretText(
        config.player.bullet_secret.text
          .replace("${user.mobile}", user.mobile)
          .replace("${mobile}", user.mobile)
          .replace("${user.id}", user.id)
      );
      setBulletSecretColor(config.player.bullet_secret.color);
      setBulletSecretFontSize(config.player.bullet_secret.size + "px");
      setBulletSecretOpacity(config.player.bullet_secret.opacity);
    }
  }, [config]);

  const navigate = useNavigate();
  const params = useParams();
  const [id, setId] = useState(Number(params.courseId));
  const [course, setCourse] = useState<any>({});
  const [video, setVideo] = useState<any>({});
  const [record_exists, setRecordExists] = useState(0);

  useEffect(() => {
    let poster = "";
    if (course) {
      poster = course.poster;
    }
    if (!poster && config) {
      poster = config.player.cover;
    }
    setPlayerPoster(poster);
  }, [config, course]);

  // 播放地址
  const [playUrl, setPlayUrl] = useState("");
  const [aliRTS, setAliRTS] = useState("");
  const [webrtc_play_url, setWebrtcPlayUrl] = useState("");
  // 聊天
  const [chat, setChat] = useState<any>(null);
  const [roomDisabled, setRoomDisabled] = useState(false); //房间禁言
  const [userDisabled, setUserDisabled] = useState(false); //学员禁言
  const [messageDisabled, setMessageDisabled] = useState(false); // 房间禁言 || 学员禁言
  // 直播间状态
  const [waitTeacher, setWaitTeacher] = useState(false); //直播未开始-倒计时结束
  const [noTeacher, setNoTeacher] = useState(false); //直播开始-但是讲师未推流
  const [isShowVodPlayer, setIsShowVodPlayer] = useState(false); //是否显示回放
  const [signStatus, setSignStatus] = useState(false); //签到状态
  const [signRecords, setSignRecords] = useState<any>(null); //签到记录
  // 倒计时
  const [day, setDay] = useState<string | number>("0");
  const [hour, setHour] = useState<string | number>("00");
  const [min, setMin] = useState<string | number>("00");
  const [second, setSecond] = useState<string | number>("00");
  const [timeValue, setTimeValue] = useState(0);
  const [curDuration, setCurDuration] = useState(0);
  const [currentTab, setCurrentTab] = useState(1);
  const [content, setContent] = useState("");
  const [enabledChat, setEnabledChat] = useState(false);

  const myRef = useRef(0);
  const tabs = [
    {
      name: "聊天",
      id: 1,
    },
    {
      name: "课件",
      id: 2,
    },
  ];

  useEffect(() => {
    if (video?.status === 1) {
      if (webrtc_play_url) {
        renderLiveTencentPlayer();
      } else {
        renderLiveDPlayer();
      }
    }
  }, [video, webrtc_play_url, playUrl]);

  useEffect(() => {
    myRef.current = timeValue;
  }, [timeValue]);

  useEffect(() => {
    myRef.current = curDuration;
  }, [curDuration]);

  useEffect(() => {
    getData();
  }, [id]);

  useEffect(() => {
    setId(Number(params.courseId));
  }, [params.courseId]);

  const getData = () => {
    live.play(id).then((res: any) => {
      let resData = res.data;
      document.title = resData.video.title;

      if (!chat && resData.chat) {
        setChat(resData.chat);
      }

      setCourse(resData.course);
      setVideo(resData.video);
      setPlayUrl(resData.play_url);
      setAliRTS(resData.ali_rts);
      setRecordExists(resData.record_exists);
      setWebrtcPlayUrl(resData.web_rtc_play_url);

      if (typeof resData.video.status === "undefined") {
        setEnabledChat(false);
      } else {
        setEnabledChat(
          resData.video.status === 0 || resData.video.status === 1
        );
      }

      setRoomDisabled(resData.room_is_ban === 1);
      setUserDisabled(resData.user_is_ban === 1);
      setMessageDisabled(
        resData.room_is_ban === 1 || resData.user_is_ban === 1
      );

      // 倒计时
      if (resData.video.status === 0) {
        setWaitTeacher(false);
        countTime(resData.video.published_at);
      }

      //签到相关
      let sign_in_record = resData.sign_in_record;
      if (sign_in_record && sign_in_record.length !== 0) {
        setSignStatus(true);
        setSignRecords(sign_in_record);
      } else {
        setSignStatus(false);
        setSignRecords(null);
      }
    });
  };

  const countTime = (endValue: string) => {
    let date = new Date();
    let now = date.getTime();
    let endDate = new Date(endValue);
    let end = endDate.getTime();
    let leftTime = end - now;
    let c_day = 0;
    let c_hour = 0;
    let c_min = 0;
    let c_second = 0;
    if (leftTime >= 0) {
      // 天
      let day = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      c_day = day;
      setDay(day);
      // 时
      let h = Math.floor((leftTime / 1000 / 60 / 60) % 24);
      c_hour = h;
      let hour = h < 10 ? "0" + h : h;
      setHour(hour);
      // 分
      let m = Math.floor((leftTime / 1000 / 60) % 60);
      c_min = m;
      let min = m < 10 ? "0" + m : m;
      setMin(min);
      // 秒
      let s = Math.floor((leftTime / 1000) % 60);
      c_second = s;
      let second = s < 10 ? "0" + s : s;
      setSecond(second);
    } else {
      c_day = 0;
      c_hour = 0;
      c_min = 0;
      c_second = 0;
      setDay(0);
      setHour("00");
      setMin("00");
      setSecond("00");
    }
    if (leftTime <= 0) {
      setWaitTeacher(true);
      return;
    }
    setTimeout(() => {
      countTime(endValue);
    }, 1000);
  };

  const renderLiveTencentPlayer = () => {
    liveTencentPlayerRef.current = new window.TCPlayer("meedu-live-player", {
      width: 950,
      height: 535,
      sources: [{ src: webrtc_play_url }],
      controls: true,
      autoplay: true,
      poster: playerPoster,
      bigPlayButton: true,
      reportable: false,
      webrtcConfig: {
        connectRetryCount: 3,
        connectRetryDelay: 1,
        receiveVideo: true,
        receiveAudio: true,
        showLog: false,
      },
      plugins: {
        DynamicWatermark: enabledBulletSecret
          ? {
              type: "text",
              speed: 0.2, // 建议取值范围 0<= speed <=1，默认值 0.2
              content: bulletSecretText,
              opacity: bulletSecretFontOpacity,
              fontSize: bulletSecretFontSize,
              color: bulletSecretColor,
            }
          : null,
      },
    });

    liveTencentPlayerRef.current.on("timeupdate", function () {
      livePlayRecord(liveTencentPlayerRef.current.currentTime(), false);
    });
    liveTencentPlayerRef.current.on("error", function (e: any) {
      console.log("视频播放出现错误", e);
      liveTencentPlayerRef.current.dispose();
      liveTencentPlayerRef.current = null;
      setTimeout(() => {
        setNoTeacher(true);
      }, 500);
    });
  };

  const renderLiveDPlayer = () => {
    let videoInfo: any = {
      url: playUrl,
      pic: playerPoster,
    };
    if (aliRTS) {
      videoInfo = {
        live_artc_url: aliRTS,
        type: "artc",
        pic: playerPoster,
      };
    }

    // 初始化播放器
    liveDPlayerRef.current = new window.DPlayer({
      container: document.getElementById("meedu-live-player"),
      live: true,
      video: videoInfo,
      autoplay: true,
      bulletSecret: {
        enabled: enabledBulletSecret,
        text: bulletSecretText,
        size: bulletSecretFontSize,
        color: bulletSecretColor,
        opacity: bulletSecretFontOpacity,
      },
    });
    liveDPlayerRef.current.on("timeupdate", () => {
      if (!liveDPlayerRef.current || !liveDPlayerRef.current.video) {
        return;
      }
      livePlayRecord(parseInt(liveDPlayerRef.current.video.currentTime), false);
    });
    liveDPlayerRef.current.on("play_error", (e: any) => {
      console.log("play_error", e);
      if (e?.from && (e.from === "AliRTS" || e.from === "HLS")) {
        playerDestroy();
        setNoTeacher(true);
      }
    });
  };

  const goDetail = () => {
    playerDestroy();
    setTimeout(() => {
      navigate("/live/detail/" + course.id + "?tab=3", { replace: true });
    }, 500);
  };

  const tabChange = (id: number) => {
    setCurrentTab(id);
  };

  const openSignDialog = (data: any) => {
    if (liveDPlayerRef.current || liveTencentPlayerRef.current) {
      exitFullscreen();
    }
    setSignRecords(data);
    setSignStatus(true);
  };

  const showVodPlayer = () => {
    if (record_exists === 1 && playUrl.length > 0) {
      playerDestroy();
      setIsShowVodPlayer(true);
      initVodPlayer();
    } else {
      setIsShowVodPlayer(false);
      message.error("暂无回放");
    }
  };

  const reloadPlayer = () => {
    window.location.reload();
  };

  const closeSignDialog = () => {
    setSignStatus(false);
    setSignRecords(null);
  };

  const initVodPlayer = () => {
    vodDlayerRef.current = new window.DPlayer({
      container: document.getElementById("meedu-vod-player"),
      autoplay: false,
      video: {
        quality: playUrl,
        defaultQuality: 0,
        pic: playerPoster,
      },
      bulletSecret: {
        enabled: enabledBulletSecret,
        text: bulletSecretText,
        size: bulletSecretFontSize,
        color: bulletSecretColor,
        opacity: bulletSecretFontOpacity,
      },
    });
    vodDlayerRef.current.on("timeupdate", () => {
      playRecord(parseInt(vodDlayerRef.current.video.currentTime), false);
    });
    vodDlayerRef.current.on("ended", () => {
      playRecord(parseInt(vodDlayerRef.current.video.currentTime), true);
    });
    vodDlayerRef.current.on("play_error", (e: any) => {
      console.log("播放出错啦", e);
    });
  };

  const playRecord = (duration: number, isEnd: boolean) => {
    if (duration - myRef.current >= 10 || isEnd === true) {
      setTimeValue(duration);
      goMeedu
        .vodWatchRecord(video.course_id, id, {
          duration: duration,
        })
        .then((res: any) => {});
    }
  };

  const livePlayRecord = (duration: number, isEnd: boolean) => {
    if (duration - myRef.current >= 10 || isEnd === true) {
      setCurDuration(duration);
      goMeedu
        .liveWatchRecord(video.course_id, id, {
          duration: duration,
        })
        .then((res: any) => {});
    }
  };

  const submitMessage = () => {
    if (content === "" || messageDisabled) {
      return;
    }
    saveChat(content);
  };

  const saveChat = (content: string) => {
    goMeedu
      .chatMsgSend(video.course_id, id, {
        content: content,
        duration: curDuration,
      })
      .then((res: any) => {
        setContent("");
      });
  };

  const resetAttachDialog = () => {
    setCurrentTab(0);
    setTimeout(() => {
      setCurrentTab(2);
    }, 150);
  };

  return (
    <>
      <div className={styles["content"]}>
        <div className={styles["navheader"]}>
          <div className={styles["top"]}>
            <div className="d-flex">
              <img
                onClick={() => goDetail()}
                className={styles["icon-back"]}
                src={backIcon}
              />
              <span onClick={() => goDetail()}>{video.title}</span>
            </div>
          </div>
        </div>
        <div className={styles["live-banner"]}>
          {isLogin && video && (
            <div className={styles["live-box"]}>
              <div className={styles["live-item"]}>
                {video.status === 1 && signStatus && signRecords && (
                  <SignDialog
                    cid={course.id}
                    vid={id}
                    records={signRecords}
                    onCancel={() => closeSignDialog()}
                  />
                )}
                <div className={styles["live-item-title"]}>
                  <span className={styles["name"]}>{video.title}</span>
                  <span className={styles["time"]}>
                    {video.status === 0 && <>开播时间 {video.published_at}</>}
                    {video.status === 1 && <>直播中</>}
                    {video.status === 2 && <>已结束</>}
                  </span>
                </div>
                <div
                  className={styles["live-item-video"]}
                  style={{
                    backgroundImage: "url(" + course.poster + ")",
                    backgroundSize: "100% 100%",
                  }}
                >
                  {video.status === 1 ? (
                    <>
                      <div
                        className={styles["alert-message"]}
                        style={{ display: noTeacher ? "flex" : "none" }}
                      >
                        <div className={styles["message"]}>
                          讲师暂时离开直播间，稍后请刷新！
                          <a onClick={() => reloadPlayer()}>点击刷新</a>
                        </div>
                      </div>

                      <div
                        className={styles["play"]}
                        style={{ display: noTeacher ? "none" : "block" }}
                      >
                        {webrtc_play_url ? (
                          <video id="meedu-live-player"></video>
                        ) : (
                          <div
                            id="meedu-live-player"
                            style={{ width: "100%", height: "100%" }}
                          ></div>
                        )}
                      </div>
                    </>
                  ) : null}

                  {video.status === 0 && (
                    <div className={styles["alert-message"]}>
                      {waitTeacher ? (
                        <div className={styles["message"]}>
                          待讲师开播，
                          <a onClick={() => reloadPlayer()}>点击刷新</a>
                        </div>
                      ) : (
                        <div className={styles["message"]}>
                          直播倒计时：{day}天{hour}小时{min}分{second}秒
                        </div>
                      )}
                    </div>
                  )}

                  {video.status === 2 && (
                    <>
                      <div className={styles["play"]}>
                        {record_exists === 1 && !isShowVodPlayer && (
                          <div className={styles["alert-message"]}>
                            {playUrl.length > 0 ? (
                              <div className={styles["message"]}>
                                直播已结束，
                                <a onClick={() => showVodPlayer()}>点击回看</a>
                              </div>
                            ) : (
                              <div className={styles["message"]}>
                                直播已结束
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          id="meedu-vod-player"
                          style={{
                            width: "100%",
                            height: "100%",
                            display:
                              record_exists === 1 && isShowVodPlayer
                                ? "block"
                                : "none",
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
                <div className={styles["replybox"]}>
                  {currentTab === 1 && video.status !== 2 && (
                    <>
                      <Input
                        className={styles["reply-content"]}
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value);
                        }}
                        disabled={messageDisabled}
                        placeholder={
                          messageDisabled
                            ? "禁言状态下无法发布消息"
                            : "按回车键可直接发送"
                        }
                        onPressEnter={() => submitMessage()}
                      ></Input>
                      <div
                        className={
                          messageDisabled
                            ? styles["submit-disabled"]
                            : styles["submit"]
                        }
                        onClick={() => submitMessage()}
                      >
                        发布
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={styles["chat-item"]}>
                <div className={styles["tabs"]}>
                  {tabs.map((item: any) => (
                    <div
                      key={item.id}
                      className={
                        currentTab === item.id
                          ? styles["active-item-tab"]
                          : styles["item-tab"]
                      }
                      onClick={() => tabChange(item.id)}
                    >
                      {item.name}
                      {currentTab === item.id && (
                        <div className={styles["actline"]}></div>
                      )}
                    </div>
                  ))}
                </div>
                {currentTab === 1 && video.course_id && (
                  <ChatBox
                    chat={chat}
                    enabledChat={enabledChat}
                    cid={video.course_id}
                    vid={id}
                    disabled={userDisabled}
                    enabledMessage={roomDisabled}
                    change={(
                      userDisabled: boolean,
                      messageDisabled: boolean
                    ) => {
                      if (userDisabled || messageDisabled) {
                        console.log(userDisabled, messageDisabled);
                        setMessageDisabled(true);
                      } else {
                        setMessageDisabled(false);
                      }
                    }}
                    sign={(data: any) => openSignDialog(data)}
                    endSign={() => closeSignDialog()}
                  />
                )}
                {currentTab === 2 && (
                  <AttachDialog
                    status={video.status}
                    cid={course.id}
                    vid={id}
                    onCancel={() => resetAttachDialog()}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LiveVideoPage;
