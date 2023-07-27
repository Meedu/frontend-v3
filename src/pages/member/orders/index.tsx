import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Pagination } from "antd";
import styles from "./index.module.scss";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NavMember, Empty, ThumbBar } from "../../../components";
import { user as member } from "../../../api/index";
import { getCommentTime } from "../../../utils/index";
import defaultPaperIcon from "../../../assets/img/commen/default-paper.png";
import defaultVipIcon from "../../../assets/img/commen/default-vip.png";
import defaultTopicIcon from "../../../assets/img/commen/default-article.png";
import defaultCourseIcon from "../../../assets/img/commen/default-lesson.png";
import defaultVideoIcon from "../../../assets/img/commen/default-video.png";
import defaultStepsIcon from "../../../assets/img/commen/default-steps.png";
import defaultLiveIcon from "../../../assets/img/commen/default-live.png";
import defaultBookIcon from "../../../assets/img/commen/default-ebook.png";

const MemberOrdersPage = () => {
  document.title = "所有订单";
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [tabs, setTabs] = useState<any>([]);
  const [currentTab, setCurrentTab] = useState(1);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );

  useEffect(() => {
    if (currentTab == 1) {
      getData();
    } else if (currentTab === 2) {
      getTgData();
    } else if (currentTab === 3) {
      getMsData();
    }
  }, [page, size, refresh, currentTab]);

  useEffect(() => {
    let data = [
      {
        name: "所有订单",
        id: 1,
      },
    ];
    if (configFunc["tuangou"]) {
      data.push({
        name: "团购订单",
        id: 2,
      });
    }
    if (configFunc["miaosha"]) {
      data.push({
        name: "秒杀订单",
        id: 3,
      });
    }
    setTabs(data);
  }, [configFunc]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.orders({ page: page, page_size: size }).then((res: any) => {
      setList(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  };

  const getTgData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.tuangou({ page: page, size: size }).then((res: any) => {
      setList(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  };

  const getMsData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.miaosha({ page: page, size: size }).then((res: any) => {
      setList(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  };

  const resetData = () => {
    setPage(1);
    setList([]);
    setRefresh(!refresh);
  };

  const tabChange = (id: number) => {
    if (loading) {
      return;
    }
    setCurrentTab(id);
    resetData();
  };

  const goDetail = (item: any) => {
    if (item.goods[0].goods_type === "ROLE") {
      navigate("/vip");
    } else if (item.goods[0].goods_type === "BOOK") {
      navigate("/book/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "COURSE") {
      navigate("/courses/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "直播课程") {
      navigate("/live/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "文章") {
      navigate("/topic/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "VIDEO") {
      navigate("/courses/video/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "学习路径") {
      navigate("/learnPath/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "试卷") {
      navigate("/exam/papers/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "练习") {
      navigate("/exam/practice/detail/" + item.goods[0].goods_id);
    } else if (item.goods[0].goods_type === "模拟试卷") {
      navigate("/exam/mockpaper/detail/" + item.goods[0].goods_id);
    }
  };

  const goTgDetail = (item: any) => {
    if (item.goods.goods_type === "book") {
      navigate("/book/detail/" + item.goods.other_id);
    } else if (item.goods.goods_type === "course") {
      navigate("/courses/detail/" + item.goods.other_id);
    } else if (item.goods.goods_type === "live") {
      navigate("/live/detail/" + item.goods.other_id);
    } else if (item.goods.goods_type === "learnPath") {
      navigate("/learnPath/detail/" + item.goods.other_id);
    }
  };

  const goTgOrder = (event: any, item: any) => {
    event.stopPropagation();
    navigate(
      "/order?course_id=" +
        item.goods.goods_id +
        "&course_type=" +
        item.goods.goods_type +
        "&goods_type=ms&goods_charge=" +
        item.charge +
        "&goods_label=团购&goods_name=" +
        item.goods.goods_title +
        "&goods_id=" +
        item.id +
        "&goods_thumb=" +
        item.goods.goods_thumb
    );
  };

  const goMsDetail = (item: any) => {
    if (item.goods.goods_type === "book") {
      navigate("/book/detail/" + item.goods.goods_id);
    } else if (item.goods.goods_type === "course") {
      navigate("/courses/detail/" + item.goods.goods_id);
    } else if (item.goods.goods_type === "live") {
      navigate("/live/detail/" + item.goods.goods_id);
    } else if (item.goods.goods_type === "learnPath") {
      navigate("/learnPath/detail/" + item.goods.goods_id);
    }
  };

  const goMsOrder = (event: any, item: any) => {
    event.stopPropagation();
    navigate(
      "/order?course_id=" +
        item.goods.other_id +
        "&course_type=" +
        item.goods.goods_type +
        "&goods_type=tg&goods_charge=" +
        item.charge +
        "&goods_label=秒杀&goods_name=" +
        item.goods.goods_title +
        "&goods_id=" +
        item.id +
        "&goods_thumb=" +
        item.goods.goods_thumb
    );
  };

  return (
    <div className="container">
      <div className={styles["box"]}>
        <NavMember cid={6} refresh={true}></NavMember>
        <div className={styles["project-box"]}>
          <div className="member-tabs">
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

          {loading && (
            <Row>
              <div className="float-left d-j-flex mt-50">
                <Spin size="large" />
              </div>
            </Row>
          )}
          {!loading && list.length === 0 && (
            <Col span={24}>
              <Empty></Empty>
            </Col>
          )}
          {!loading && list.length > 0 && (
            <>
              {currentTab === 1 && (
                <div className={styles["project-content"]}>
                  {list.map((item: any) => (
                    <div
                      key={item.id}
                      className={styles["project-item"]}
                      onClick={() => goDetail(item)}
                    >
                      {item.goods[0] && item.goods[0].goods_thumb ? (
                        <div className={styles["item-thumb"]}>
                          {item.goods[0].goods_type === "模拟试卷" ||
                          item.goods[0].goods_type === "试卷" ||
                          item.goods[0].goods_type === "练习" ? (
                            <img src={defaultPaperIcon} />
                          ) : item.goods[0].goods_type === "BOOK" ? (
                            <ThumbBar
                              value={item.goods[0].goods_thumb}
                              width={75}
                              height={100}
                              border={8}
                            />
                          ) : (
                            <ThumbBar
                              value={item.goods[0].goods_thumb}
                              width={133}
                              height={100}
                              border={8}
                            />
                          )}
                        </div>
                      ) : item.goods[0].goods_type === "ROLE" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultVipIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "文章" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultTopicIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "COURSE" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultCourseIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "模拟试卷" ||
                        item.goods[0].goods_type === "试卷" ||
                        item.goods[0].goods_type === "练习" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultPaperIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "VIDEO" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultVideoIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "学习路径" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultStepsIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "直播课程" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultLiveIcon} />
                        </div>
                      ) : item.goods[0].goods_type === "BOOK" ? (
                        <div className={styles["item-thumb"]}>
                          <img src={defaultBookIcon} />
                        </div>
                      ) : (
                        <div className={styles["item-thumb"]}></div>
                      )}
                      <div className={styles["item-info"]}>
                        <div className={styles["item-top"]}>
                          {item.goods[0] && (
                            <div className={styles["item-name"]}>
                              {item.goods[0].goods_name}
                            </div>
                          )}
                          <div className={styles["order-num"]}>
                            订单编号：{item.order_id}
                          </div>
                          <div className={styles["item-time"]}>
                            {getCommentTime(item.created_at)}
                          </div>
                        </div>
                        <div className={styles["item-bottom"]}>
                          {item.status_text === "已支付" && (
                            <div className={styles["item-price"]}>
                              实付款：￥{item.charge}
                            </div>
                          )}
                          <div
                            className={
                              item.status_text === "未支付" ||
                              item.status_text === "支付中"
                                ? styles["item-act-status"]
                                : styles["item-status"]
                            }
                          >
                            {item.status_text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {currentTab === 2 && (
                <div className={styles["project-content"]}>
                  {list.map((item: any) => (
                    <div
                      key={item.id}
                      className={styles["project-item"]}
                      onClick={() => goTgDetail(item)}
                    >
                      {item.goods && item.goods.goods_thumb && (
                        <div className={styles["item-thumb"]}>
                          {item.goods.goods_type === "book" ? (
                            <ThumbBar
                              value={item.goods.goods_thumb}
                              width={75}
                              height={100}
                              border={8}
                            />
                          ) : (
                            <ThumbBar
                              value={item.goods.goods_thumb}
                              width={133}
                              height={100}
                              border={8}
                            />
                          )}
                        </div>
                      )}
                      {(!item.goods || item.goods.length === 0) && (
                        <div className={styles["item-thumb"]}></div>
                      )}
                      <div className={styles["item-info"]}>
                        <div className={styles["item-top"]}>
                          <div className={styles["item-name"]}>
                            {item.goods.goods_title || "商品已删除"}
                          </div>
                          <div className={styles["order-num"]}>
                            类型：{item.goods.goods_type_text}
                          </div>
                          <div className={styles["item-time"]}>
                            {getCommentTime(item.updated_at)}
                          </div>
                        </div>
                        <div className={styles["item-bottom"]}>
                          <div className={styles["item-price"]}>
                            实付款：￥{item.charge}
                          </div>
                          {item.status === 0 && (
                            <div
                              className={styles["item-act-status"]}
                              onClick={(e: any) => goTgOrder(e, item)}
                            >
                              未支付，点击立即支付
                            </div>
                          )}
                          {item.status === 1 && (
                            <div className={styles["item-status"]}>已支付</div>
                          )}
                          {item.status === 3 && (
                            <div className={styles["item-status"]}>已取消</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {currentTab === 3 && (
                <div className={styles["project-content"]}>
                  {list.map((item: any) => (
                    <div
                      key={item.id}
                      className={styles["project-item"]}
                      onClick={() => goMsDetail(item)}
                    >
                      {item.goods && item.goods.goods_thumb && (
                        <div className={styles["item-thumb"]}>
                          {item.goods.goods_type === "book" ? (
                            <ThumbBar
                              value={item.goods.goods_thumb}
                              width={75}
                              height={100}
                              border={8}
                            />
                          ) : (
                            <ThumbBar
                              value={item.goods.goods_thumb}
                              width={133}
                              height={100}
                              border={8}
                            />
                          )}
                        </div>
                      )}
                      {(!item.goods || item.goods.length === 0) && (
                        <div className={styles["item-thumb"]}></div>
                      )}
                      <div className={styles["item-info"]}>
                        <div className={styles["item-top"]}>
                          <div className={styles["item-name"]}>
                            {item.goods.goods_title || "商品已删除"}
                          </div>
                          <div className={styles["order-num"]}>
                            类型：{item.goods.goods_type_text}
                          </div>
                          <div className={styles["item-time"]}>
                            {getCommentTime(item.created_at)}
                          </div>
                        </div>
                        <div className={styles["item-bottom"]}>
                          <div className={styles["item-price"]}>
                            实付款：￥{item.charge}
                          </div>
                          {item.status === 0 && (
                            <div
                              className={styles["item-act-status"]}
                              onClick={(e: any) => goMsOrder(e, item)}
                            >
                              未支付，点击立即支付
                            </div>
                          )}
                          {item.status === 1 && (
                            <div className={styles["item-status"]}>已支付</div>
                          )}
                          {item.status === 3 && (
                            <div className={styles["item-status"]}>已取消</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {!loading && list.length > 0 && size < total && (
            <Col
              span={24}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 50,
                marginBottom: 30,
              }}
            >
              <Pagination
                onChange={(currentPage) => {
                  setPage(currentPage);
                  window.scrollTo(0, 0);
                }}
                pageSize={size}
                defaultCurrent={page}
                total={total}
              />
            </Col>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberOrdersPage;
