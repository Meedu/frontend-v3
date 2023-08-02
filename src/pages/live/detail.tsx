import { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Skeleton, message } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { live, miaosha, tuangou } from "../../api/index";
import {
  HistoryRecord,
  MiaoshaDialog,
  ThumbBar,
  MiaoshaList,
  TuangouList,
  LiveCourseComments,
} from "../../components";
import { latexRender, codeRender } from "../../utils/index";
import collectIcon from "../../assets/img/commen/icon-collect-h.png";
import noCollectIcon from "../../assets/img/commen/icon-collect-n.png";
import { VideoListComp } from "./components/detail/video-list";
import { VideoChapterListComp } from "./components/detail/video-chapter-list";
import appConfig from "../../js/config";

const LiveDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [cid, setCid] = useState(Number(params.courseId));
  const [course, setCourse] = useState<any>({});
  const [chapters, setChapters] = useState<any>([]);
  const [videos, setVideos] = useState<any>({});
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [isLike, setIsLike] = useState<boolean>(false);
  const [msData, setMsData] = useState<any>({});
  const [msVisible, setMsVisible] = useState<boolean>(false);
  const [tgData, setTgData] = useState<any>({});
  const [hideButton, setHideButton] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const [commentUsers, setCommentUsers] = useState<any>({});
  const [currentTab, setCurrentTab] = useState(Number(result.get("tab")) || 2);
  const [isfixTab, setIsfixTab] = useState<boolean>(false);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
  const tabs = [
    {
      name: "直播详情",
      id: 2,
    },
    {
      name: "直播排课",
      id: 3,
    },
    {
      name: "课程评论",
      id: 4,
    },
  ];

  useEffect(() => {
    getDetail();
    getComments();
    getLikeStatus();
    window.addEventListener("scroll", handleTabFix, true);
    return () => {
      window.removeEventListener("scroll", handleTabFix, true);
    };
  }, [cid]);

  useEffect(() => {
    latexRender(document.getElementById("desc"));
    codeRender(document.getElementById("desc"));
  }, [document.getElementById("desc")]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    live.detail(cid).then((res: any) => {
      document.title = res.data.course.title;
      setCourse(res.data.course);
      setChapters(res.data.chapters);
      setIsBuy(res.data.is_buy);
      setVideos(res.data.videos);
      //获取秒杀信息
      if (!res.data.is_buy && configFunc["miaosha"]) {
        getMsDetail();
      }

      //获取团购信息
      else if (!res.data.is_buy && configFunc["tuangou"]) {
        getTgDetail();
      }

      setLoading(false);
    });
  };

  const getMsDetail = () => {
    if (course.charge === 0) {
      return;
    }
    miaosha
      .detail(0, {
        course_id: cid,
        course_type: "live",
      })
      .then((res: any) => {
        setMsData(res.data);
        if (!res.data.data && !isBuy && configFunc["tuangou"]) {
          getTgDetail();
        }
      });
  };
  const getTgDetail = () => {
    if (course.charge === 0) {
      return;
    }
    tuangou
      .detail(0, {
        course_id: cid,
        course_type: "live",
      })
      .then((res: any) => {
        setTgData(res.data);
        setHideButton(res.data.join_item && res.data.join_item.length !== 0);
      });
  };

  const getComments = () => {
    if (commentLoading) {
      return;
    }
    setCommentLoading(true);
    live
      .comments(cid, {
        page: 1,
        size: 10000,
      })
      .then((res: any) => {
        setComments(res.data.data.data);
        setCommentUsers(res.data.users);
        setCommentLoading(false);
      });
  };

  const resetComments = () => {
    setCommentLoading(false);
    setComments([]);
    setCommentUsers({});
  };

  const getLikeStatus = () => {
    live
      .likeStatus({
        id: cid,
        type: "live",
      })
      .then((res: any) => {
        setIsLike(res.data.like);
      });
  };

  const tabChange = (id: number) => {
    setCurrentTab(id);
    navigate("/live/detail/" + cid + "?tab=" + id);
  };

  const likeHit = () => {
    if (isLogin) {
      live
        .likeHit({
          id: cid,
          type: "live",
        })
        .then((res) => {
          setIsLike(!isLike);
          if (isLike) {
            message.success("取消收藏");
          } else {
            message.success("已收藏");
          }
        });
    } else {
      goLogin();
    }
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

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

  const goRole = () => {
    navigate("/vip");
  };

  const buyCourse = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?goods_id=" +
        cid +
        "&goods_type=live&goods_charge=" +
        course.charge +
        "&goods_label=直播课程&goods_name=" +
        course.title +
        "&goods_thumb=" +
        course.thumb
    );
  };

  const goMsOrder = (id: number) => {
    navigate(
      "/order?course_id=" +
        msData.data.goods_id +
        "&course_type=" +
        msData.data.goods_type +
        "&goods_type=ms&goods_charge=" +
        msData.data.charge +
        "&goods_label=秒杀&goods_name=" +
        msData.data.goods_title +
        "&goods_id=" +
        id +
        "&goods_thumb=" +
        msData.data.goods_thumb
    );
  };

  const goPay = (gid = 0) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?course_id=" +
        tgData.goods.other_id +
        "&course_type=" +
        tgData.goods.goods_type +
        "&goods_type=tg&goods_charge=" +
        tgData.goods.charge +
        "&goods_label=团购&goods_name=" +
        tgData.goods.goods_title +
        "&goods_id=" +
        tgData.goods.id +
        "&goods_thumb=" +
        tgData.goods.goods_thumb +
        "&tg_gid=" +
        gid
    );
  };

  const openMsDialog = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    setMsVisible(true);
  };

  const goPlay = (item: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }

    if (isBuy === false) {
      message.error("请购买课程后观看");
      return;
    }
    if (item.status === 2 && item.duration === 0) {
      message.error("直播已结束");
      return;
    }

    navigate("/live/video/" + item.id);
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
          {loading && (
            <Skeleton.Button
              active
              style={{
                width: 1200,
                height: 14,
                marginLeft: 0,
              }}
            ></Skeleton.Button>
          )}
          {!loading && (
            <>
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
                  navigate("/live");
                }}
              >
                直播课
              </a>{" "}
              /<span>{course.title}</span>
            </>
          )}
        </div>
        <HistoryRecord id={course.id} title={course.title} type="live" />
        {!isBuy && msData && (
          <MiaoshaDialog
            open={msVisible}
            msData={msData}
            onCancel={() => setMsVisible(false)}
          />
        )}

        <div className={styles["course-info"]}>
          <div className={styles["course-info-box"]}>
            <div className={styles["course-thumb"]}>
              {loading && (
                <Skeleton.Button
                  active
                  style={{
                    width: 320,
                    height: 240,
                    borderRadius: 8,
                  }}
                ></Skeleton.Button>
              )}
              {!loading && (
                <>
                  <ThumbBar
                    value={course.thumb}
                    width={320}
                    height={240}
                    border={null}
                  />
                  <div className={styles["status"]}>{course.status_text}</div>
                </>
              )}
            </div>
            <div className={styles["info"]}>
              {loading && (
                <div
                  style={{
                    width: 710,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Skeleton.Button
                    active
                    style={{
                      width: 710,
                      height: 30,
                      marginTop: 20,
                    }}
                  ></Skeleton.Button>
                  <Skeleton.Button
                    active
                    style={{
                      width: 710,
                      height: 16,
                      marginTop: 21,
                    }}
                  ></Skeleton.Button>
                </div>
              )}
              <div className={styles["course-info-title"]}>{course.title}</div>
              {!loading && isLike && (
                <img
                  onClick={() => {
                    likeHit();
                  }}
                  className={styles["collect-button"]}
                  src={collectIcon}
                />
              )}
              {!loading && !isLike && (
                <img
                  onClick={() => {
                    likeHit();
                  }}
                  className={styles["collect-button"]}
                  src={noCollectIcon}
                />
              )}
              <p className={styles["desc"]}>{course.short_description}</p>
              <div className={styles["btn-box"]}>
                {!isBuy && course.charge !== 0 && (
                  <>
                    {msData && msData.data && (
                      <>
                        {msData.order && msData.order.status === 0 && (
                          <div
                            className={styles["buy-button"]}
                            onClick={() => goMsOrder(msData.order.id)}
                          >
                            已获得秒杀资格，请尽快支付
                          </div>
                        )}
                        {(!msData.order || msData.order.status !== 0) &&
                          !msData.data.is_over && (
                            <div
                              className={styles["buy-button"]}
                              onClick={() => openMsDialog()}
                            >
                              立即秒杀￥{msData.data.charge}
                            </div>
                          )}
                      </>
                    )}
                    {(!msData || !msData.data) && (
                      <>
                        {hideButton && (
                          <div className={styles["has-button"]}>正在拼团中</div>
                        )}
                        {!hideButton && course.charge > 0 && (
                          <div
                            className={styles["buy-button"]}
                            onClick={() => buyCourse()}
                          >
                            订阅课程￥{course.charge}
                          </div>
                        )}
                        {course.vip_can_view === 1 &&
                          !appConfig.disable_vip && (
                            <div
                              className={styles["role-button"]}
                              onClick={() => goRole()}
                            >
                              会员免费看
                            </div>
                          )}
                        {tgData &&
                          tgData.goods &&
                          (!tgData.join_item ||
                            tgData.join_item.length === 0) && (
                            <div
                              className={styles["role-button"]}
                              onClick={() => goPay(0)}
                            >
                              单独开团￥{tgData.goods.charge}
                            </div>
                          )}
                      </>
                    )}
                  </>
                )}
                {course.charge === 0 && (
                  <div className={styles["has-button"]}>本课程免费</div>
                )}
                {course.charge !== 0 && isBuy && (
                  <div className={styles["has-button"]}>课程已购买</div>
                )}
              </div>
            </div>
          </div>
          {!isBuy && msData && <MiaoshaList msData={msData} />}
          {!isBuy && msData && <TuangouList tgData={tgData} />}
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
        {loading && (
          <div className={styles["course-teacher-box"]}>
            <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
          </div>
        )}
        {currentTab === 2 && course.teacher && (
          <>
            <div className={styles["course-teacher-box"]}>
              {course.teacher && (
                <div className={styles["teacher"]}>
                  <img
                    className={styles["avatar"]}
                    src={course.teacher.avatar}
                  />
                  <a>{course.teacher.name}</a>
                </div>
              )}
              <p className={styles["teacher-desc"]}>
                {course.teacher.short_desc}
              </p>
            </div>
            <div className={styles["coursr-desc"]}>
              <div
                className="u-content md-content"
                id="desc"
                dangerouslySetInnerHTML={{ __html: course.render_desc }}
              ></div>
            </div>
          </>
        )}
        {currentTab === 3 && (
          <div className={styles["course-chapter-box"]}>
            {chapters.length > 0 && (
              <VideoChapterListComp
                chapters={chapters}
                course={course}
                videos={videos}
                isBuy={isBuy}
                switchVideo={(item: any) => goPlay(item)}
              />
            )}
            {chapters.length === 0 && videos[0] && (
              <VideoListComp
                course={course}
                videos={videos[0]}
                isBuy={isBuy}
                switchVideo={(item: any) => goPlay(item)}
              />
            )}
          </div>
        )}
        {currentTab === 4 && (
          <LiveCourseComments
            cid={cid}
            isBuy={isBuy}
            comments={comments}
            commentUsers={commentUsers}
            success={() => {
              resetComments();
              getComments();
            }}
          />
        )}
      </div>
    </>
  );
};

export default LiveDetailPage;
