import React, { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { paper } from "../../../api/index";
import { Empty } from "../../../components";

export const ExamPaperDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [joinRecords, setJoinRecords] = useState<any>([]);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [joinCount, setJoinCount] = useState<number>(0);
  const [requiredCourses, setRequiredCourses] = useState<any>([]);
  const [surplus, setSurplus] = useState<number>(99999);
  const [sumQuestion, setSumQuestion] = useState<number>(0);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [id, setId] = useState(Number(result.get("id")) || 0);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getDetail();
  }, [id]);

  useEffect(() => {
    let val = 0;
    for (var key in questions) {
      val = val + questions[key].length;
    }
    setSumQuestion(val);
  }, [questions]);

  const getDetail = () => {
    paper.paperDetail(id).then((res: any) => {
      document.title = res.data.paper.title;
      setList(res.data.paper);
      setQuestions(res.data.questions);
      setJoinRecords(res.data.user_papers);
      setCanJoin(res.data.can_join);
      setJoinCount(res.data.join_count);
      setRequiredCourses(res.data.required_courses);
      if (res.data.paper.try_times !== 0) {
        let surplus = res.data.paper.try_times - res.data.join_count;
        setSurplus(surplus);
      }
    });
  };

  const join = (records: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (joinLoading) {
      return;
    }
    if (canJoin === false) {
      message.error("无权限参与");
      return;
    }
    if (typeof records !== "undefined") {
      if (records.status === 3) {
        message.error("请等待阅卷完成查看");
        return;
      }
      navigate("/exam/papers/play?id=" + id + "&pid=" + records.id);
      return;
    }
    setJoinLoading(true);
    paper
      .paperJoin(id)
      .then((res: any) => {
        setJoinLoading(false);
        let record_id = res.data.record_id;
        navigate("/exam/papers/play?id=" + id + "&pid=" + record_id);
      })
      .catch((e: any) => {
        setJoinLoading(false);
      });
  };

  const goLogin = () => {
    navigate("/login");
  };

  const payOrder = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (list.charge === 0) {
      message.error("当前试卷无法购买");
      return;
    }
    if (list.enabled_invite === 1) {
      message.error("当前试卷仅限邀请用户参与");
      return;
    }
    navigate(
      "/order?goods_id=" +
        id +
        "&goods_type=paper&goods_charge=" +
        list.charge +
        "&goods_label=试卷&goods_name=" +
        list.title
    );
  };

  return (
    <div className="container">
      <div className="bread-nav">
        <a
          onClick={() => {
            navigate("/exam");
          }}
        >
          考试练习
        </a>{" "}
        /
        <a
          onClick={() => {
            navigate("/exam/papers");
          }}
        >
          在线考试
        </a>{" "}
        /<span>{list.title}</span>
      </div>
      <div className={styles["banner-box"]}>
        <div className={styles["title"]}>{list.title}</div>
        <div className={styles["info"]}>
          <div className={styles["info-item"]}>总分：{list.score}分</div>
          <i></i>
          <div className={styles["info-item"]}>及格分：{list.pass_score}分</div>
          <i></i>
          <div className={styles["info-item"]}>题数：{sumQuestion}道</div>
          <i></i>
          {list.try_times === 0 && (
            <div className={styles["info-item"]}>可考试次数：不限</div>
          )}
          {list.try_times !== 0 && (
            <div className={styles["info-item"]}>剩余可考试次数：{surplus}</div>
          )}
        </div>
        {surplus !== 0 && (
          <div className={styles["btn-box"]}>
            <>
              {!canJoin && list.charge > 0 && (
                <div
                  className={styles["charge-button"]}
                  onClick={() => payOrder()}
                >
                  购买试卷 ￥{list.charge}
                </div>
              )}
              {canJoin && surplus && surplus !== 0 && (
                <div
                  className={styles["join-button"]}
                  onClick={() => join(undefined)}
                >
                  立即考试
                </div>
              )}
            </>
          </div>
        )}
      </div>
      <div className={styles["records-box"]}>
        <div className={styles["tit"]}>考试记录</div>
        <div className={styles["records"]}>
          {joinRecords.length === 0 && <Empty></Empty>}
          {joinRecords.length > 0 && (
            <>
              {joinRecords.map((item: any) => (
                <div key={item.id} className={styles["record-item"]}>
                  <div className={styles["item-type"]}>
                    <>
                      {item.status === 2 && <span>{item.score}分</span>}
                      {item.status === 3 && <span>已完成</span>}
                      {item.status !== 2 && item.status !== 3 && (
                        <span className={styles["red"]}>未完成</span>
                      )}
                    </>
                  </div>
                  <div className={styles["item-pro"]}>
                    <>
                      {item.status === 1 && <span>考试中</span>}
                      {item.status === 3 && <span>阅卷中</span>}
                      {item.status === 2 && <span>已结束</span>}
                    </>
                  </div>
                  <div
                    className={styles["item-status"]}
                    onClick={() => join(item)}
                  >
                    <>
                      {item.status === 1 && (
                        <span className={styles["red"]}>继续考试</span>
                      )}
                      {item.status !== 1 && <span>考试详情</span>}
                    </>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};