import { useState, useRef, useEffect } from "react";
import styles from "./video.module.scss";
import { message, Input } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { ChatBox } from "../../components";
import { SignDialog } from "./components/sign-dialog";
import { AttachDialog } from "./components/attach-dialog";
import { useSelector } from "react-redux";
import { live, goMeedu } from "../../api/index";
import backIcon from "../../assets/img/commen/icon-back-h.png";

declare const window: any;

const LiveVideoPage = () => {
  const liveTencentPlayerRef = useRef<any>(null);
  const liveDPlayerRef = useRef<any>(null);
  const vodDlayerRef = useRef<any>(null);

  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [id, setId] = useState(Number(result.get("id")));
  const [course, setCourse] = useState<any>({});
  const [video, setVideo] = useState<any>({});
  const [chat, setChat] = useState<any>(null);
  const [playUrl, setPlayUrl] = useState("");
  const [aliRTS, setAliRTS] = useState("");
  const [record_exists, setRecordExists] = useState<number>(0);
  const [webrtc_play_url, setWebrtcPlayUrl] = useState("");
  const [roomDisabled, setRoomDisabled] = useState(false);
  const [userDisabled, setUserDisabled] = useState(false);
  const [messageDisabled, setMessageDisabled] = useState(false);
  const [waitTeacher, setWaitTeacher] = useState(false);
  const [noTeacher, setNoTeacher] = useState(false);
  const [isShowVodPlayer, setIsShowVodPlayer] = useState(false);
  const [signStatus, setSignStatus] = useState(false);
  const [signRecords, setSignRecords] = useState<any>(null);
  const [day, setDay] = useState<string | number>("0");
  const [hour, setHour] = useState<string | number>("00");
  const [min, setMin] = useState<string | number>("00");
  const [second, setSecond] = useState<string | number>("00");
  const [timeValue, setTimeValue] = useState(0);
  const [curDuration, setCurDuration] = useState(0);
  const [currentTab, setCurrentTab] = useState(1);
  const [content, setContent] = useState("");
  const [enabledChat, setEnabledChat] = useState(false);
  const user = useSelector((state: any) => state.loginUser.value.user);
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
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
    if (video.status === 1 && webrtc_play_url) {
      initLiveTencentPlayer();
    } else if (video.status === 1 && playUrl) {
      startLivePlay();
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
    setId(Number(result.get("id")));
  }, [result.get("id")]);

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

  const initLiveTencentPlayer = () => {
    liveTencentPlayerRef.current = new window.TCPlayer("meedu-live-player", {
      width: 950,
      height: 535,
      sources: [
        {
          src: webrtc_play_url,
        },
      ],
      controls: true,
      autoplay: true,
      poster: course.poster || config.player.cover,
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
        DynamicWatermark:
          parseInt(config.player.enabled_bullet_secret) === 1
            ? {
                type: "text",
                speed: 0.2, // 建议取值范围 0<= speed <=1，默认值 0.2
                content: config.player.bullet_secret.text
                  .replace("${user.mobile}", user.mobile)
                  .replace("${mobile}", user.mobile)
                  .replace("${user.id}", user.id),
                opacity: 0.5,
                fontSize:
                  (!config.player.bullet_secret.size
                    ? 14
                    : config.player.bullet_secret.size) + "px",
                color: !config.player.bullet_secret.color
                  ? "red"
                  : config.player.bullet_secret.color,
              }
            : null,
      },
    });

    liveTencentPlayerRef.current.on("timeupdate", function () {
      livePlayRecord(liveTencentPlayerRef.current.currentTime(), false);
    });
    liveTencentPlayerRef.current.on("ended", function () {
      livePlayRecord(liveTencentPlayerRef.current.currentTime(), true);
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

  const startLivePlay = () => {
    // 解析跑马灯的字体大小
    let bulletSecretFontSize = !config.player.bullet_secret.size
      ? 14
      : config.player.bullet_secret.size;

    // 初始化播放器
    liveDPlayerRef.current = new window.DPlayer({
      container: document.getElementById("meedu-live-player"),
      live: true,
      video: {
        live_artc_url: aliRTS ? aliRTS : playUrl, //如果返回了阿里云RTS直播地址的话则优先使用rts地址播放
        type: aliRTS ? "artc" : "auto",
        pic: course.poster || config.player.cover,
      },
      autoplay: true,
      bulletSecret: {
        enabled: parseInt(config.player.enabled_bullet_secret) === 1,
        text: config.player.bullet_secret.text
          .replace("${user.mobile}", user.mobile)
          .replace("${mobile}", user.mobile)
          .replace("${user.id}", user.id),
        size: bulletSecretFontSize + "px",
        color: !config.player.bullet_secret.color
          ? "red"
          : config.player.bullet_secret.color,
        opacity: config.player.bullet_secret.opacity,
      },
    });
    liveDPlayerRef.current.on("timeupdate", () => {
      if (!liveDPlayerRef.current || !liveDPlayerRef.current.video) {
        return;
      }
      livePlayRecord(parseInt(liveDPlayerRef.current.video.currentTime), false);
    });
    liveDPlayerRef.current.on("ended", () => {
      livePlayRecord(parseInt(liveDPlayerRef.current.video.currentTime), true);
    });
    liveDPlayerRef.current.on("play_error", (e: any) => {
      console.log("play_error", e);
      if (e?.from && (e.from === "AliRTS" || e.from === "HLS")) {
        // 销毁播放器
        if (liveDPlayerRef.current) {
          liveDPlayerRef.current.destroy(true);
          liveDPlayerRef.current = null;
        }
        setNoTeacher(true);
      }
    });
  };

  const goDetail = () => {
    if (liveDPlayerRef.current) {
      liveDPlayerRef.current.destroy();
    }
    if (liveTencentPlayerRef.current) {
      liveTencentPlayerRef.current.dispose();
    }
    // 回放播放器销毁
    if (vodDlayerRef.current) {
      vodDlayerRef.current.destroy();
    }

    setTimeout(() => {
      navigate("/live/detail?id=" + course.id + "&tab=3", { replace: true });
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

  const exitFullscreen = () => {
    if (liveDPlayerRef.current) {
      liveDPlayerRef.current.fullScreen.cancel();
    }
    if (liveTencentPlayerRef.current) {
      liveTencentPlayerRef.current.exitFullscreen();
    }
  };

  const showVodPlayer = () => {
    if (record_exists === 1 && playUrl.length > 0) {
      vodDlayerRef.current && vodDlayerRef.current.destroy();
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
    setIsShowVodPlayer(true);

    // 跑马灯文字大小
    let bulletSecretFontSize = !config.player.bullet_secret.size
      ? 14
      : config.player.bullet_secret.size;

    vodDlayerRef.current = new window.DPlayer({
      container: document.getElementById("meedu-vod-player"),
      autoplay: false,
      video: {
        quality: playUrl, //如果存在回放的话，那么playUrl就是回放的地址列表
        defaultQuality: 0,
        pic: course?.poster || config.player.cover,
      },
      bulletSecret: {
        enabled: parseInt(config.player.enabled_bullet_secret) === 1,
        text: config.player.bullet_secret.text
          .replace("${user.mobile}", user.mobile)
          .replace("${mobile}", user.mobile)
          .replace("${user.id}", user.id),
        size: bulletSecretFontSize + "px",
        color: !config.player.bullet_secret.color
          ? "red"
          : config.player.bullet_secret.color,
        opacity: config.player.bullet_secret.opacity,
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
