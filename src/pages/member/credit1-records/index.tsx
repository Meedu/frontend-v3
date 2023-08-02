import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Pagination, message } from "antd";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { NavMember, Empty } from "../../../components";
import { user as member, system } from "../../../api/index";
import { changeTime } from "../../../utils/index";
import { loginAction } from "../../../store/user/loginUserSlice";
import { saveConfigAction } from "../../../store/system/systemConfigSlice";
import { GoodsDetailComp } from "./components/goods-detail";

const MemberCredit1RecordsPage = () => {
  document.title = "积分商城";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [currentTab, setCurrentTab] = useState(1);
  const [goodStatus, setGoodStatus] = useState<boolean>(false);
  const [id, setId] = useState(0);
  const [is_v, setIsV] = useState(0);
  const user = useSelector((state: any) => state.loginUser.value.user);
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const tabs = [
    {
      name: "积分商城",
      id: 1,
    },
    {
      name: "明细规则",
      id: 2,
    },
    {
      name: "积分订单",
      id: 3,
    },
  ];

  useEffect(() => {
    if (currentTab === 1) {
      getMall();
    } else if (currentTab === 2) {
      getData();
    } else if (currentTab === 3) {
      getOrders();
    }
    getUser();
    getConfig();
  }, [page, size, refresh, currentTab]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.credit1Records({ page: page, page_size: size }).then((res: any) => {
      setList(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  };

  const getMall = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.creditMallList({ page: page, size: size }).then((res: any) => {
      setList(res.data.data.data);
      setTotal(res.data.data.total);
      setLoading(false);
    });
  };
  const getOrders = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member.creditMallOrders({ page: page, size: size }).then((res: any) => {
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

  const showDetail = (item: any) => {
    setId(item.id);
    setIsV(item.is_v);
    setGoodStatus(true);
  };

  const goDetail = (type: string, id: number) => {
    if (type === "vip") {
      navigate("/vip");
    } else if (type === "vod") {
      navigate("/courses/detail/" + id);
    } else if (type === "live") {
      navigate("/live/detail/" + id);
    } else if (type === "book") {
      navigate("/book/detail/" + id);
    }
  };

  const tabChange = (id: number) => {
    if (loading) {
      return;
    }
    setCurrentTab(id);
    setGoodStatus(false);
    resetData();
  };

  const getUser = () => {
    member.detail().then((res: any) => {
      let loginData = res.data;
      dispatch(loginAction(loginData));
    });
  };

  const getConfig = () => {
    system.config().then((res: any) => {
      let config = res.data;
      dispatch(saveConfigAction(config));
    });
  };

  const statusType = (is_v: number, type: string) => {
    if (is_v === 0) {
      return "发实物";
    } else if (is_v === 1) {
      if (type === "vod" || type === "live" || type === "book") {
        return "换课程";
      } else if (type === "vip") {
        return "换会员";
      }
    }
  };

  const copy = (url: string) => {
    var input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    document.body.removeChild(input);
    message.success("复制成功");
  };

  return (
    <div className="container">
      <div className={styles["box"]}>
        <NavMember cid={16} refresh={true}></NavMember>
        <div className={styles["right-box"]}>
          <div className={styles["exchange-box"]}>
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
            <div className={styles["exchange-content"]}>
              <div className={styles["tit"]}>我的积分：</div>
              <div className={styles["credit"]}>{user.credit1}积分</div>
            </div>
          </div>
          <GoodsDetailComp
            open={goodStatus}
            id={id}
            isV={is_v}
            onExchange={() => {
              setTimeout(() => {
                tabChange(3);
              }, 500);
            }}
            onCancel={() => setGoodStatus(false)}
          ></GoodsDetailComp>
          {!goodStatus && currentTab === 1 && (
            <div className={styles["goods-box"]}>
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
                <div className={styles["goods-list"]}>
                  {list.map((item: any, index: number) => (
                    <div
                      key={index}
                      className={styles["goods-item"]}
                      onClick={() => showDetail(item)}
                    >
                      <div
                        className={styles["item-thumb"]}
                        style={{ backgroundImage: "url(" + item.thumb + ")" }}
                      ></div>
                      <div className={styles["item-body"]}>
                        <div className={styles["item-title"]}>{item.title}</div>
                        <div className={styles["item-info"]}>
                          <div className={styles["item-value"]}>
                            {item.charge}积分
                          </div>
                          <div className={styles["item-type"]}>
                            <span className={styles["type"]}>
                              {statusType(item.is_v, item.v_type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
          )}
          {!goodStatus && currentTab === 2 && (
            <div className={styles["rules"]}>
              <div className={styles["project-box"]}>
                <div className={styles["btn-title"]}>积分明细</div>
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
                    {list.map((item: any, index: number) => (
                      <div key={index} className={styles["project-item"]}>
                        <div className={styles["title"]}>{item.remark}</div>
                        <div className={styles["value"]}>
                          {item.sum > 0 ? (
                            <span>+{item.sum}</span>
                          ) : (
                            <span>{item.sum}</span>
                          )}
                        </div>
                        <div className={styles["info"]}>
                          <span>{changeTime(item.created_at)}</span>
                        </div>
                      </div>
                    ))}
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
              <div className={styles["rules-content"]}>
                <div className={styles["btn-title"]}>积分获取</div>
                {config.credit1_reward.register !== 0 && (
                  <div className={styles["rules-item"]}>
                    <p>• 注册登录 +{config.credit1_reward.register} 积分</p>
                  </div>
                )}
                {config.credit1_reward.watched_video !== 0 && (
                  <div className={styles["rules-item"]}>
                    <p>
                      • 看完视频 +{config.credit1_reward.watched_video} 积分
                    </p>
                  </div>
                )}
                {config.credit1_reward.watched_vod_course !== 0 && (
                  <div className={styles["rules-item"]}>
                    <p>
                      • 看完课程 +{config.credit1_reward.watched_vod_course}{" "}
                      积分
                    </p>
                  </div>
                )}
                {config.credit1_reward.paid_order !== 0 && (
                  <div className={styles["rules-item"]}>
                    <p>
                      • 下单成功 +实付金额*
                      {Math.floor(
                        Number(config.credit1_reward.paid_order) * 100
                      )}
                      % 积分
                    </p>
                  </div>
                )}
                <div className={styles["rules-item"]}>
                  <p>• 可以回答积分悬赏问题获取积分</p>
                </div>
              </div>
            </div>
          )}
          {!goodStatus && currentTab === 3 && (
            <div className={styles["orders-box"]}>
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
                  {list.map((item: any) => (
                    <div key={item.id} className={styles["item"]}>
                      <div className={styles["top"]}>
                        <div className={styles["id"]}>
                          兑换流水号：{item.id}
                        </div>
                        <div className={styles["button"]}>
                          {item.goods_is_v === 0 && (
                            <>
                              {item.is_send === 1 && (
                                <>
                                  <div className={styles["orderId"]}>
                                    运单号：{item.express_number}
                                  </div>
                                  <div
                                    className={styles["showDetail"]}
                                    onClick={() => copy(item.express_number)}
                                  >
                                    复制
                                  </div>
                                </>
                              )}
                              {item.is_send === 0 && (
                                <div className={styles["orderId"]}>发货中</div>
                              )}
                            </>
                          )}
                          {item.goods_is_v === 1 && (
                            <>
                              {item.is_send === 1 && (
                                <>
                                  <div className={styles["orderId"]}>
                                    已发放成功
                                  </div>
                                  <div
                                    className={styles["showDetail"]}
                                    onClick={() =>
                                      goDetail(
                                        item.goods_v_type,
                                        item.goods_v_id
                                      )
                                    }
                                  >
                                    立即查看
                                  </div>
                                </>
                              )}
                              {item.is_send === 0 && (
                                <div className={styles["orderId"]}>发货中</div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className={styles["body"]}>
                        <div
                          className={styles["left"]}
                          style={{
                            backgroundImage: "url(" + item.goods_thumb + ")",
                          }}
                        ></div>
                        <div className={styles["right"]}>
                          <div className={styles["title"]}>
                            {item.goods_title}
                          </div>
                          <div className={styles["info"]}>
                            <div className={styles["date"]}>
                              {changeTime(item.created_at)}
                            </div>
                            <div className={styles["value"]}>
                              {item.total_charge}积分
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCredit1RecordsPage;
