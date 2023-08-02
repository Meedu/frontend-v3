import { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Skeleton } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { path, miaosha, tuangou } from "../../api/index";
import {
  MiaoshaDialog,
  ThumbBar,
  MiaoshaList,
  TuangouList,
} from "../../components";
import guideIcon from "../../assets/img/commen/icon-guidepost.png";
import paperIcon from "../../assets/img/commen/default-paper.png";

const LearnPathDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [cid, setCid] = useState(Number(params.courseId));
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [learn, setLearn] = useState<any>({});
  const [steps, setSteps] = useState<any>([]);
  const [msData, setMsData] = useState<any>({});
  const [msVisible, setMsVisible] = useState<boolean>(false);
  const [tgData, setTgData] = useState<any>({});
  const [hideButton, setHideButton] = useState<boolean>(false);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getDetail();
  }, [cid]);

  useEffect(() => {
    setCid(Number(params.courseId));
  }, [params.courseId]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    path.detail(cid).then((res: any) => {
      document.title = res.data.data.name;
      setLearn(res.data.data);
      setSteps(res.data.steps);
      setIsBuy(res.data.is_buy);
      if (!res.data.is_buy && configFunc["miaosha"]) {
        getMsDetail();
      } else if (!res.data.is_buy && configFunc["tuangou"]) {
        getTgDetail();
      }
      setLoading(false);
    });
  };

  const getMsDetail = () => {
    if (learn.charge === 0) {
      return;
    }
    miaosha
      .detail(0, {
        course_id: cid,
        course_type: "learnPath",
      })
      .then((res: any) => {
        setMsData(res.data);
        if (!res.data.data && !isBuy && configFunc["tuangou"]) {
          getTgDetail();
        }
      });
  };
  const getTgDetail = () => {
    if (learn.charge === 0) {
      return;
    }
    tuangou
      .detail(0, {
        course_id: cid,
        course_type: "learnPath",
      })
      .then((res: any) => {
        setTgData(res.data);
        setHideButton(res.data.join_item && res.data.join_item.length !== 0);
      });
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  const openMsDialog = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    setMsVisible(true);
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

  const buyCourse = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?goods_id=" +
        cid +
        "&goods_type=path&goods_charge=" +
        learn.charge +
        "&goods_label=学习路径&goods_name=" +
        learn.name +
        "&goods_thumb=" +
        learn.thumb
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

  const goDetail = (item: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }

    if (item.type === "course") {
      navigate("/courses/detail/" + item.other_id);
    } else if (item.type === "book") {
      navigate("/book/detail/" + item.other_id);
    } else if (item.type === "live") {
      navigate("/live/detail/" + item.other_id);
    } else if (item.type === "paper_practice") {
      navigate("/exam/practice/detail/" + item.other_id);
    } else if (item.type === "paper_paper") {
      navigate("/exam/papers/detail/" + item.other_id);
    }
  };

  return (
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
                navigate("/learnPath");
              }}
            >
              学习路径
            </a>{" "}
            /<span>{learn.name}</span>
          </>
        )}
      </div>
      {!isBuy && msData && (
        <MiaoshaDialog
          open={msVisible}
          msData={msData}
          onCancel={() => setMsVisible(false)}
        />
      )}
      <div className={styles["book-info"]}>
        <div className={styles["book-info-box"]}>
          <div className={styles["book-thumb"]}>
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
            <ThumbBar
              value={learn.thumb}
              width={320}
              height={240}
              border={null}
            />
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
            <div className={styles["book-info-title"]}>{learn.name}</div>
            <p className={styles["desc"]}>{learn.desc}</p>
            {!loading && (
              <div className={styles["btn-box"]}>
                {isBuy && <div className={styles["has-button"]}>已购买</div>}
                {learn.charge === 0 && !isBuy && (
                  <div className={styles["has-button"]}>本路径免费</div>
                )}
                {!isBuy && learn.charge !== 0 && (
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
                        {!hideButton && learn.charge > 0 && (
                          <div
                            className={styles["buy-button"]}
                            onClick={() => buyCourse()}
                          >
                            购买套餐￥{learn.charge}（共{learn.courses_count}
                            课程）
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
                    {!hideButton && (
                      <div className={styles["original"]}>
                        原价:￥{learn.original_charge}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {!isBuy && msData && <MiaoshaList msData={msData} />}
        {!isBuy && tgData && <TuangouList tgData={tgData} />}
      </div>
      {steps.length > 0 && (
        <div className={styles["book-chapter-box"]}>
          <div className={styles["steps-box"]}>
            {steps.map((item: any) => (
              <div key={item.id} className={styles["step-item"]}>
                <div className={styles["left-item"]}>
                  <img className={styles["icon"]} src={guideIcon} />
                  <div className={styles["column"]}></div>
                </div>
                <div className={styles["right-item"]}>
                  <div className={styles["step-title"]}>{item.name}</div>
                  <div className={styles["step-desc"]}>{item.desc}</div>
                  {item.courses.length > 0 && (
                    <div className={styles["courses-box"]}>
                      {item.courses.map((courseItem: any) => (
                        <div
                          key={courseItem.id}
                          className={styles["course-item"]}
                          onClick={() => goDetail(courseItem)}
                        >
                          <div className={styles["course-thumb"]}>
                            <div className={styles["spback"]}></div>
                            {courseItem.type === "book" ? (
                              <div className={styles["active-thumb-bar"]}>
                                <ThumbBar
                                  value={learn.thumb}
                                  width={75}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            ) : courseItem.type === "paper_paper" ||
                              courseItem.type === "paper_practice" ||
                              courseItem.type === "paper_mock_paper" ? (
                              <div className={styles["thumb-bar"]}>
                                <ThumbBar
                                  value={paperIcon}
                                  width={133}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            ) : (
                              <div className={styles["thumb-bar"]}>
                                <ThumbBar
                                  value={courseItem.thumb}
                                  width={133}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            )}
                          </div>
                          <div className={styles["course-body"]}>
                            <div className={styles["course-name"]}>
                              {" "}
                              {courseItem.name}
                            </div>
                            <div className={styles["course-type"]}>
                              {courseItem.type_text}
                            </div>
                            {courseItem.charge === 0 && (
                              <div className={styles["course-free"]}>免费</div>
                            )}
                            {courseItem.charge !== 0 && (
                              <div className={styles["course-charge"]}>
                                原价:￥{courseItem.charge}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnPathDetailPage;
