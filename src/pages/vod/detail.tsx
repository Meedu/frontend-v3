import React, { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Button, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { course as vod, miaosha, tuangou } from "../../api/index";
import {
  HistoryRecord,
  ThumbBar,
  MiaoshaDialog,
  MiaoshaList,
  TuangouList,
} from "../../components";
import collectIcon from "../../assets/img/commen/icon-collect-h.png";
import noCollectIcon from "../../assets/img/commen/icon-collect-n.png";

export const VodDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [cid, setCid] = useState(Number(result.get("id")));
  const [course, setCourse] = useState<any>({});
  const [attach, setAttach] = useState<any>([]);
  const [chapters, setChapters] = useState<any>([]);
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [isCollect, setIsCollect] = useState<boolean>(false);
  const [videos, setVideos] = useState<any>([]);
  const [buyVideos, setBuyVideos] = useState<any>([]);
  const [comments, setComments] = useState<any>([]);
  const [commentUsers, setCommentUsers] = useState<any>([]);
  const [msData, setMsData] = useState<any>({});
  const [msVisible, setMsVisible] = useState<boolean>(false);
  const [tgData, setTgData] = useState<any>({});
  const [hideButton, setHideButton] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState(Number(result.get("tab")) || 2);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
  const tabs = [
    {
      name: "课程详情",
      id: 2,
    },
    {
      name: "课程目录",
      id: 3,
    },
    {
      name: "课程评论",
      id: 4,
    },
    {
      name: "课程附件",
      id: 5,
    },
  ];

  useEffect(() => {
    getDetail();
    getComments();
  }, [cid]);

  const tabChange = (id: number) => {
    setCurrentTab(id);
  };

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    vod.detail(cid).then((res: any) => {
      document.title = res.data.course.title;
      setCourse(res.data.course);
      setAttach(res.data.attach);
      setChapters(res.data.chapters);
      setIsBuy(res.data.isBuy);
      setIsCollect(res.data.isCollect);
      setVideos(res.data.videos);
      setBuyVideos(res.data.buyVideos);

      //获取秒杀信息
      if (!res.data.isBuy && configFunc["miaosha"]) {
        getMsDetail();
      }

      //获取团购信息
      else if (!res.data.isBuy && configFunc["tuangou"]) {
        getTgDetail();
      }
      setLoading(false);
    });
  };

  const getComments = () => {
    if (commentLoading) {
      return;
    }
    setCommentLoading(true);
    vod.comments(cid).then((res: any) => {
      setComments(res.data.comments);
      setCommentUsers(res.data.users);
      setCommentLoading(false);
    });
  };

  const collectCourse = () => {
    if (isLogin) {
      vod
        .collect(cid)
        .then(() => {
          setIsCollect(!isCollect);
          if (isCollect) {
            message.success("已收藏");
          } else {
            message.success("取消收藏");
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    } else {
      goLogin();
    }
  };

  const goLogin = () => {};
  const getMsDetail = () => {
    if (course.is_free === 1) {
      return;
    }
    miaosha
      .detail(0, {
        course_id: cid,
        course_type: "course",
      })
      .then((res: any) => {
        setMsData(res.data);
        if (!res.data.data && !isBuy && configFunc["tuangou"]) {
          getTgDetail();
        }
      });
  };
  const getTgDetail = () => {
    if (course.is_free === 1) {
      return;
    }
    tuangou
      .detail(0, {
        course_id: cid,
        course_type: "course",
      })
      .then((res: any) => {
        setTgData(res.data);
        setHideButton(res.data.join_item && res.data.join_item.length !== 0);
      });
  };

  const goRole = () => {
    navigate("/vip");
  };

  const buyCourse = () => {
    if (!isLogin) {
      message.error("请登录后再操作");
      return;
    }
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
      message.error("请登录后再操作");
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
    setMsVisible(true);
  };

  const goPlay = (item: any) => {};

  return (
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
        /<span>{course.title}</span>
      </div>
      <HistoryRecord id={course.id} title={course.title} type="vod" />
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
            <ThumbBar
              value={course.thumb}
              width={320}
              height={240}
              border={null}
            />
          </div>
          <div className={styles["info"]}>
            <div className={styles["course-info-title"]}>{course.title}</div>
            {isCollect && (
              <img
                onClick={() => {
                  collectCourse();
                }}
                className={styles["collect-button"]}
                src={collectIcon}
              />
            )}
            {!isCollect && (
              <img
                onClick={() => {
                  collectCourse();
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
                      {!msData.data.is_over && (
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
                      {course.vip_can_view === 1 && (
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
                  {course.is_free === 1 && (
                    <div className={styles["has-button"]}>本课程免费</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {!isBuy && msData && <MiaoshaList msData={msData} />}
        {!isBuy && msData && <TuangouList tgData={tgData} />}
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
      {currentTab === 2 && (
        <div className={styles["coursr-desc"]}>
          <div
            className="u-content md-content"
            dangerouslySetInnerHTML={{ __html: course.render_desc }}
          ></div>
        </div>
      )}
      {currentTab === 2 && (
        <div className={styles["course-chapter-box"]}>
          {/* {chapters.length > 0 && (
            <VideoChapterListComp
              chapters={chapters}
              course={course}
              videos={videos}
              isBuy={isBuy}
              buyVideos={buyVideos}
              switchVideo={(item: any) => goPlay(item)}
            />
          )}
          {chapters.length === 0 && (
            <VideoListComp
              course={course}
              videos={videos[0]}
              isBuy={isBuy}
              buyVideos={buyVideos}
              switchVideo={(item: any) => goPlay(item)}
            />
          )} */}
        </div>
      )}
    </div>
  );
};
