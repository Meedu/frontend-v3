import { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Skeleton, message, Button } from "antd";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { mock } from "../../../api/index";
import { Empty } from "../../../components";

const ExamMockPaperDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [joinRecords, setJoinRecords] = useState<any>([]);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [joinCount, setJoinCount] = useState<number>(0);
  const [requiredCourses, setRequiredCourses] = useState<any>([]);
  const [sumQuestion, setSumQuestion] = useState<number>(0);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [id, setId] = useState(Number(params.courseId) || 0);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getDetail();
  }, [id]);

  useEffect(() => {
    setId(Number(params.courseId));
  }, [params.courseId]);

  useEffect(() => {
    let val = 0;
    if (questions.num && questions.num.choice) {
      val = val + parseInt(questions.num.choice);
    }
    if (questions.num && questions.num.select) {
      val = val + parseInt(questions.num.select);
    }
    if (questions.num && questions.num.input) {
      val = val + parseInt(questions.num.input);
    }
    if (questions.num && questions.num.qa) {
      val = val + parseInt(questions.num.qa);
    }
    if (questions.num && questions.num.judge) {
      val = val + parseInt(questions.num.judge);
    }
    if (questions.num && questions.num.cap) {
      val = val + parseInt(questions.num.cap);
    }
    setSumQuestion(val);
  }, [questions]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    mock
      .detail(id)
      .then((res: any) => {
        document.title = res.data.paper.title;
        setList(res.data.paper);
        setQuestions(JSON.parse(res.data.paper.rule));
        setJoinRecords(res.data.user_papers);
        setCanJoin(res.data.can);
        setJoinCount(res.data.join_count);
        setRequiredCourses(res.data.required_courses);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
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
      navigate("/exam/mockpaper/play?id=" + id + "&pid=" + records.id);
      return;
    }
    setJoinLoading(true);
    mock
      .join(id)
      .then((res: any) => {
        setJoinLoading(false);
        let record_id = res.data.recordId;
        navigate("/exam/mockpaper/play?id=" + id + "&pid=" + record_id);
      })
      .catch((e: any) => {
        setJoinLoading(false);
      });
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
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
        "&goods_type=mockpaper&goods_charge=" +
        list.charge +
        "&goods_label=模拟试卷&goods_name=" +
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
            navigate("/exam/mockpaper");
          }}
        >
          模拟考试
        </a>{" "}
        /<span>{list.title}</span>
      </div>
      <div className={styles["banner-box"]}>
        {loading && (
          <div
            style={{
              width: 1200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton.Button
              active
              style={{
                width: 300,
                height: 28,
                marginTop: 50,
                marginBottom: 30,
              }}
            ></Skeleton.Button>
            <Skeleton.Button
              active
              style={{
                width: 600,
                height: 14,
                marginBottom: 50,
              }}
            ></Skeleton.Button>
            <Skeleton.Button
              active
              style={{
                width: 104,
                height: 40,
                borderRadius: 4,
              }}
            ></Skeleton.Button>
          </div>
        )}
        {!loading && (
          <>
            <div className={styles["title"]}>{list.title}</div>
            <div className={styles["info"]}>
              {/* <div className={styles["info-item"]}>总分：{list.score}分</div>
          <i></i> */}
              <div className={styles["info-item"]}>
                及格分：{list.pass_score}分
              </div>
              <i></i>
              <div className={styles["info-item"]}>题数：{sumQuestion}道</div>
              <i></i>
              <div className={styles["info-item"]}>可考试次数：不限</div>
            </div>
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
                {canJoin && (
                  <Button
                    type="primary"
                    loading={joinLoading}
                    className={styles["join-button"]}
                    onClick={() => join(undefined)}
                  >
                    立即考试
                  </Button>
                )}
              </>
            </div>
          </>
        )}
      </div>
      <div className={styles["records-box"]}>
        <div className={styles["tit"]}>考试记录</div>
        <div className={styles["records"]}>
          {loading && (
            <div
              style={{
                width: 1140,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Skeleton.Button
                active
                style={{
                  width: 1140,
                  height: 14,
                  marginBottom: 30,
                }}
              ></Skeleton.Button>
              <Skeleton.Button
                active
                style={{
                  width: 1140,
                  height: 14,
                  marginBottom: 30,
                }}
              ></Skeleton.Button>
              <Skeleton.Button
                active
                style={{
                  width: 1140,
                  height: 14,
                  marginBottom: 30,
                }}
              ></Skeleton.Button>
            </div>
          )}
          {!loading && joinRecords.length === 0 && <Empty></Empty>}
          {!loading && joinRecords.length > 0 && (
            <>
              {joinRecords.map((item: any) => (
                <div key={item.id} className={styles["record-item"]}>
                  <div className={styles["item-type"]}>
                    <>
                      {item.status === 1 && <span>{item.get_score}分</span>}
                      {item.status !== 1 && (
                        <span className={styles["red"]}>未完成</span>
                      )}
                    </>
                  </div>
                  <div className={styles["item-pro"]}>
                    <>
                      {item.status !== 1 && <span>考试中</span>}
                      {item.status === 1 && <span>已结束</span>}
                    </>
                  </div>
                  <div
                    className={styles["item-status"]}
                    onClick={() => join(item)}
                  >
                    <>
                      {item.status !== 1 && (
                        <span className={styles["red"]}>继续考试</span>
                      )}
                      {item.status === 1 && <span>考试详情</span>}
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

export default ExamMockPaperDetailPage;
