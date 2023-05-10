import React, { useState, useRef, useEffect } from "react";
import styles from "./video.module.scss";
import { Button, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { course as vod } from "../../api/index";
import { useSelector } from "react-redux";
import {
  HistoryRecord,
  CourseVideoComments,
  Empty,
  SnaoShotDialog,
} from "../../components";
import { VideoListComp } from "./components/video/video-list";
import { VideoChapterListComp } from "./components/video/video-chapter-list";
import { getToken, getPlayId, savePlayId } from "../../utils/index";

declare const window: any;
var timer: any = null;
var clock: any = null;
export const VodPlayPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const pathname = useLocation().pathname;
  const [loading, setLoading] = useState<boolean>(false);
  const [cid, setCid] = useState(0);
  const [vid, setVid] = useState(Number(result.get("id")));
  const [course, setCourse] = useState<any>({});
  const [video, setVideo] = useState<any>({});
  const [videos, setVideos] = useState<any>([]);
  const [chapters, setChapters] = useState<any>([]);
  const [isWatch, setIsWatch] = useState<boolean>(false);
  const [buyVideos, setBuyVideos] = useState<any>([]);
  const [videoWatchedProgress, setVideoWatchedProgres] = useState<any>([]);
  const [isLastpage, setIsLastpage] = useState<boolean>(false);
  const [lastVideoId, setLastVideoId] = useState(0);
  const [comments, setComments] = useState<any>([]);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentUsers, setCommentUsers] = useState<any>({});
  const [attach, setAttach] = useState<any>([]);
  const [showTry, setShowTry] = useState<boolean>(false);
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [lastSeeValue, setLastSeeValue] = useState<any>(null);
  const [playUrl, setPlayUrl] = useState<string>("");
  const [isIframe, setIsIframe] = useState<boolean>(false);
  const [playendedStatus, setPlayendedStatus] = useState<boolean>(false);
  const [checkPlayerStatus, setCheckPlayerStatus] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState(10);
  const [playDuration, setPlayDuration] = useState(0);
  const [currentTab, setCurrentTab] = useState(4);
  const [isfixTab, setIsfixTab] = useState<boolean>(false);
  const user = useSelector((state: any) => state.loginUser.value.user);
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const myRef = useRef(0);
  const tabs = [
    {
      name: "课时评论",
      id: 4,
    },
    {
      name: "课程附件",
      id: 5,
    },
  ];

  useEffect(() => {
    setVid(Number(result.get("id")));
    window.player && window.player.destroy();
  }, [result.get("id")]);

  useEffect(() => {
    clock && clearInterval(clock);
    timer && clearInterval(timer);
    window.removeEventListener("scroll", handleTabFix, true);
    window.player && window.player.destroy();
  }, [pathname]);

  useEffect(() => {
    getDetail();
    getComments();
    window.addEventListener("scroll", handleTabFix, true);
    return () => {
      clock && clearInterval(clock);
      timer && clearInterval(timer);
      window.removeEventListener("scroll", handleTabFix, true);
    };
  }, [vid]);

  useEffect(() => {
    if (playendedStatus && !isLastpage) {
      countDown();
    }
  }, [playendedStatus]);

  useEffect(() => {
    myRef.current = playDuration;
  }, [playDuration]);

  const handleTabFix = () => {
    let scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    let navbar = document.querySelector("#NavBar") as HTMLElement;
    if (navbar) {
      let offsetTop = navbar.offsetTop;
      scrollTop > offsetTop ? setIsfixTab(true) : setIsfixTab(false);
    }
  };

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    vod.video(vid).then((res: any) => {
      document.title = res.data.course.title;
      setPlayendedStatus(false);
      clock && clearInterval(clock);
      setCourse(res.data.course);
      setVideo(res.data.video);
      setVideos(res.data.videos);
      setChapters(res.data.chapters);
      setIsWatch(res.data.is_watch);
      setVideoWatchedProgres(res.data.video_watched_progress);
      setBuyVideos(res.data.buy_videos);
      let chapteId = parseInt(res.data.video.chapter_id) || 0;

      // 视频排序数组
      let videoBox = [];
      if (chapteId === 0) {
        videoBox = res.data.videos[chapteId];
      } else {
        for (var k = 0; k < res.data.chapters.length; k++) {
          let chap = parseInt(res.data.chapters[k].id);
          if (typeof res.data.videos[chap] !== "undefined") {
            videoBox.push(...res.data.videos[chap]);
          }
        }
      }

      // 读取下一个视频
      for (var j = 0; j < videoBox.length; j++) {
        if (res.data.video.id === videoBox[j].id) {
          if (1 + j >= videoBox.length) {
            setIsLastpage(true);
          } else {
            setIsLastpage(false);
            setLastVideoId(videoBox[j + 1].id);
          }
        }
      }

      // 当前用户已购买 || 可以试看
      if (res.data.is_watch || res.data.video.free_seconds > 0) {
        getPlayInfo(res.data.is_watch, res.data.video.free_seconds);
      }

      //获取附件
      getAttach(res.data.course.id);

      //播放记录跳转
      if (
        res.data.video_watched_progress &&
        res.data.video_watched_progress[vid] &&
        res.data.video_watched_progress[vid].watch_seconds > 0
      ) {
        let last_see_value = {
          time: 5,
          pos: res.data.video_watched_progress[vid].watch_seconds,
        };
        setLastSeeValue(last_see_value);
      }
      setLoading(false);
    });
  };

  const getPlayInfo = (active: boolean, free_seconds: number) => {
    let isTrySee = 0;
    if (active === false && free_seconds > 0) {
      isTrySee = 1;
    }
    vod
      .playInfo(vid, { is_try: isTrySee })
      .then((res: any) => {
        if (res.data.urls.length === 0) {
          message.error("无播放地址");
          return;
        }

        let playUrls = res.data.urls;
        let firstPlayUrl = playUrls[0].url;

        if (firstPlayUrl.substr(1, 6) === "iframe") {
          setIsIframe(true);
          let playUrl = firstPlayUrl.replace(
            ">",
            ' style="width:100%;height:506px" >'
          );
          setPlayUrl(playUrl);
          return;
        }
        setIsIframe(false);
        initDPlayer(playUrls, isTrySee);
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const initDPlayer = (playUrls: any, isTrySee: number) => {
    savePlayId(String(result.get("id")));
    let dplayerUrls: any[] = [];
    playUrls.forEach((item: any) => {
      dplayerUrls.push({
        name: item.name,
        url: item.url,
      });
    });
    // 初始化播放器
    let bulletSecretFontSize = !config.player.bullet_secret.size
      ? 14
      : config.player.bullet_secret.size;
    window.player = new window.DPlayer({
      container: document.getElementById("meedu-player-container"),
      autoplay: false,
      video: {
        quality: dplayerUrls,
        defaultQuality: 0,
        pic: config.player.cover,
      },
      try: isTrySee === 1,
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
      ban_drag: parseInt(video.ban_drag) === 1,
      last_see_pos: lastSeeValue,
    });

    // 监听播放进度更新evt
    window.player.on("timeupdate", () => {
      playTimeUpdate(parseInt(window.player.video.currentTime), false);
    });
    window.player.on("ended", () => {
      playTimeUpdate(parseInt(window.player.video.currentTime), true);
      setPlayendedStatus(true);
    });
    window.player.on("sub_course", () => {
      paySelect(1);
    });

    checkPlayer();
  };

  const checkPlayer = () => {
    timer = setInterval(() => {
      let playId = getPlayId();
      if (parseInt(playId) !== Number(result.get("id"))) {
        timer && clearInterval(timer);
        window.player && window.player.destroy();
        setCheckPlayerStatus(true);
      } else {
        setCheckPlayerStatus(false);
      }
    }, 5000);
  };

  const playTimeUpdate = (duration: number, isEnd: boolean) => {
    if (duration - myRef.current >= 10 || isEnd === true) {
      setPlayDuration(duration);
      vod
        .videoRecord(vid, {
          duration: duration,
        })
        .then((res: any) => {});
    }
  };

  const countDown = () => {
    let totalTime = 10;
    clock = setInterval(() => {
      totalTime--;
      setTotalTime(totalTime);
      if (totalTime === 0) {
        clock && clearInterval(clock);
        goNextVideo(lastVideoId);
      }
    }, 1000);
  };

  const goPlay = (item: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    clock && clearInterval(clock);
    setLastSeeValue(null);
    setTotalTime(10);
    navigate("/courses/video?id=" + item.id, { replace: true });
  };

  const goNextVideo = (id: number) => {
    clock && clearInterval(clock);
    setLastSeeValue(null);
    setTotalTime(10);
    navigate("/courses/video?id=" + id, { replace: true });
  };

  const paySelect = (val: number) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (val === 2) {
      goRole();
      return;
    }
    if (val === 1) {
      navigate(
        "/order?goods_id=" +
          cid +
          "&goods_type=vod&goods_charge=" +
          course.charge +
          "&goods_label=点播课程&goods_name=" +
          course.title +
          "&goods_thumb=" +
          course.thumb
      );
      return;
    }
    if (val === 3) {
      navigate(
        "/order?goods_id=" +
          video.id +
          "&goods_type=video&goods_charge=" +
          video.charge +
          "&goods_label=视频&goods_name=" +
          video.title +
          "&goods_thumb=" +
          course.thumb
      );
      return;
    }
  };

  const getComments = () => {
    if (commentLoading) {
      return;
    }
    setCommentLoading(true);
    vod.videoComments(vid).then((res: any) => {
      setComments(res.data.comments);
      setCommentUsers(res.data.users);
      setCommentLoading(false);
    });
  };

  const resetComments = () => {
    setCommentLoading(false);
    setComments([]);
    setCommentUsers({});
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  const goRole = () => {
    navigate("/vip");
  };

  const getAttach = (cid: number) => {
    vod.detail(cid).then((res: any) => {
      setAttach(res.data.attach);
      setIsBuy(res.data.isBuy);
      setShowTry(!res.data.isBuy);
    });
  };

  const download = (id: number) => {
    let token = getToken();
    if (!isLogin) {
      goLogin();
      return;
    }
    if (!isBuy) {
      message.error("请购买课程后下载");
      return;
    }
    window.open(
      `${config.url}/api/v2/course/attach/${id}/download?token=${token}`
    );
  };

  const tabChange = (id: number) => {
    setCurrentTab(id);
  };

  return (
    <>
      {isfixTab && (
        <div className="fix-nav">
          <div className="course-tabs">
            {tabs.map((item: any) => (
              <div
                key={item.id}
                className={
                  currentTab === item.id ? "active item-tab" : "item-tab"
                }
                onClick={() => tabChange(item.id)}
              >
                {item.name}
                {currentTab === item.id && <div className="actline"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="container">
        <div className="bread-nav">
          <a
            onClick={() => {
              navigate("/");
            }}
          >
            首页
          </a>{" "}
          /
          <a
            onClick={() => {
              navigate("/courses");
            }}
          >
            录播课
          </a>{" "}
          /
          <a
            onClick={() => {
              navigate("/courses/detail?id=" + course.id);
            }}
          >
            {course.title}
          </a>{" "}
          /<span>{video.title}</span>
        </div>
        <HistoryRecord id={video.id} title={video.title} type="video" />
        <div className={styles["course-info"]}>
          <div className={styles["video-box"]}>
            <div
              className={styles["play-box"]}
              style={{
                backgroundImage: "url(" + config.player.cover + ")",
                backgroundSize: "cover",
              }}
            >
              {checkPlayerStatus && (
                <div className={styles["des-video"]}>
                  您已打开新视频，暂停本视频播放
                </div>
              )}
              {!playendedStatus && (isWatch || video.free_seconds > 0) && (
                <>
                  {isIframe && (
                    <div
                      className="iframe-player-box"
                      dangerouslySetInnerHTML={{ __html: playUrl }}
                    ></div>
                  )}
                  {!isIframe && (
                    <div
                      className="meedu-player-container"
                      id="meedu-player-container"
                    ></div>
                  )}
                </>
              )}
              {(playendedStatus || (!isWatch && video.free_seconds <= 0)) && (
                <>
                  {isLogin && (
                    <div className={styles["alert-message"]}>
                      {playendedStatus && (
                        <>
                          {!isWatch && (
                            <div className={styles["subscribe-info"]}>
                              试看结束，购买课程观看所有视频
                            </div>
                          )}
                          {isWatch && !isLastpage && (
                            <>
                              <div
                                className={styles["next-page"]}
                                onClick={() => goNextVideo(lastVideoId)}
                              >
                                播放下一节课程
                              </div>
                              <div className={styles["last-video"]}>
                                {totalTime}秒后开始自动播放下一节
                              </div>
                            </>
                          )}
                          {isWatch && isLastpage && (
                            <div className={styles["last-video"]}>
                              恭喜你学完最后一节
                            </div>
                          )}
                        </>
                      )}
                      {course.charge > 0 && isWatch === false && (
                        <div
                          className={styles["subscribe-button"]}
                          onClick={() => paySelect(1)}
                        >
                          <span>订阅课程 ￥{course.charge}</span>
                        </div>
                      )}
                      {video.charge > 0 &&
                        video.is_ban_sell === 0 &&
                        isWatch === false && (
                          <div
                            className={styles["subscribe-button2"]}
                            onClick={() => paySelect(3)}
                          >
                            <span>
                              或点击此处单独购买本节视频￥{video.charge}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                  {!isLogin && (
                    <div className={styles["alert-message"]}>登录后观看</div>
                  )}
                </>
              )}
            </div>
            <div className="course-chapter-box">
              {chapters.length > 0 && (
                <VideoChapterListComp
                  chapters={chapters}
                  course={course}
                  video={video}
                  videos={videos}
                  isBuy={isBuy}
                  buyVideos={buyVideos}
                  switchVideo={(item: any) => goPlay(item)}
                />
              )}
              {chapters.length === 0 && videos[0] && (
                <VideoListComp
                  course={course}
                  video={video}
                  videos={videos[0]}
                  isBuy={isBuy}
                  buyVideos={buyVideos}
                  switchVideo={(item: any) => goPlay(item)}
                />
              )}
            </div>
          </div>
          <div className="course-tabs" id="NavBar">
            {tabs.map((item: any) => (
              <div
                key={item.id}
                className={
                  currentTab === item.id ? "active item-tab" : "item-tab"
                }
                onClick={() => tabChange(item.id)}
              >
                {item.name}
                {currentTab === item.id && <div className="actline"></div>}
              </div>
            ))}
          </div>
        </div>
        {currentTab === 4 && (
          <CourseVideoComments
            vid={vid}
            isBuy={isBuy}
            comments={comments}
            commentUsers={commentUsers}
            success={() => {
              resetComments();
              getComments();
            }}
          />
        )}
        {currentTab === 5 && (
          <div className={styles["attach-list-box"]}>
            {attach.length === 0 && <Empty></Empty>}
            {attach.length > 0 &&
              attach.map((item: any) => (
                <div className={styles["attach-item"]} key={item.id}>
                  <div className={styles["attach-name"]}>{item.name}</div>
                  <a
                    onClick={() => download(item.id)}
                    className={styles["download-attach"]}
                  >
                    下载附件
                  </a>
                </div>
              ))}
          </div>
        )}
        {configFunc.snapshort && isWatch && (
          <SnaoShotDialog id={vid} duration={playDuration} resourceType="vod" />
        )}
      </div>
    </>
  );
};
